-- ============================================================
-- REVELAI - Database Schema
-- Execute no SQL Editor do InsForge/Supabase
-- ============================================================

-- 1. Tabela de Planos (referência)
CREATE TABLE IF NOT EXISTS planos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  preco_centavos INT NOT NULL,
  limite_convidados INT NOT NULL,
  limite_fotos_por_pessoa INT NOT NULL,
  stripe_price_id TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela de Eventos (core)
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anfitriao_id UUID REFERENCES auth.users(id),
  plano_id INT REFERENCES planos(id),
  nome_evento VARCHAR(100) NOT NULL,
  codigo_acesso VARCHAR(10) UNIQUE NOT NULL,
  share_code VARCHAR(8) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'aguardando_pagamento',
  total_convidados_conectados INT DEFAULT 0,
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP NOT NULL,
  revelacao_modo VARCHAR(20) DEFAULT 'instant',
  revelacao_time TIMESTAMP,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- 3. Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  gateway_id VARCHAR(100),
  valor_pago_centavos INT NOT NULL,
  metodo_pagamento VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pendente',
  pago_em TIMESTAMP,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- 4. Tabela de Fotos
CREATE TABLE IF NOT EXISTS fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_dispositivo_id VARCHAR(64) NOT NULL,
  usuario_nome VARCHAR(100) DEFAULT 'Convidado',
  storage_key TEXT,
  url TEXT,
  filtro VARCHAR(20) DEFAULT 'original',
  largura INT DEFAULT 0,
  altura INT DEFAULT 0,
  tamanho_bytes INT DEFAULT 0,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- 5. Tabela de Convidados (rastreamento de entrada)
CREATE TABLE IF NOT EXISTS convidados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_dispositivo_id VARCHAR(64) NOT NULL,
  nome VARCHAR(100) DEFAULT 'Convidado',
  fotos_tiradas INT DEFAULT 0,
  entrou_em TIMESTAMP DEFAULT NOW(),
  UNIQUE(evento_id, usuario_dispositivo_id)
);

-- ============================================================
-- INDEXES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_eventos_codigo_acesso ON eventos(codigo_acesso);
CREATE INDEX IF NOT EXISTS idx_eventos_share_code ON eventos(share_code);
CREATE INDEX IF NOT EXISTS idx_fotos_evento ON fotos(evento_id);
CREATE INDEX IF NOT EXISTS idx_fotos_usuario ON fotos(evento_id, usuario_dispositivo_id);
CREATE INDEX IF NOT EXISTS idx_convidados_evento ON convidados(evento_id);
CREATE INDEX IF NOT EXISTS idx_convidados_lookup ON convidados(evento_id, usuario_dispositivo_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_evento ON pagamentos(evento_id);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE convidados ENABLE ROW LEVEL SECURITY;

-- Planos: leitura pública (para a landing page mostrar planos)
CREATE POLICY "planos_select_public" ON planos
  FOR SELECT USING (true);

-- Eventos: anfitrião pode ver seus próprios eventos
CREATE POLICY "eventos_select_owner" ON eventos
  FOR SELECT USING (auth.uid() = anfitriao_id);

-- Eventos: leitura por código de acesso (para convidados)
CREATE POLICY "eventos_select_by_code" ON eventos
  FOR SELECT USING (true);

-- Eventos: inserção pelo anfitrião
CREATE POLICY "eventos_insert_owner" ON eventos
  FOR INSERT WITH CHECK (auth.uid() = anfitriao_id);

-- Eventos: update pelo anfitrião
CREATE POLICY "eventos_update_owner" ON eventos
  FOR UPDATE USING (auth.uid() = anfitriao_id);

-- Fotos: leitura pública de fotos de eventos ativos
CREATE POLICY "fotos_select_public" ON fotos
  FOR SELECT USING (true);

-- Fotos: inserção por qualquer um (convidados incluídos)
CREATE POLICY "fotos_insert_public" ON fotos
  FOR INSERT WITH CHECK (true);

-- Convidados: leitura pública
CREATE POLICY "convidados_select_public" ON convidados
  FOR SELECT USING (true);

-- Convidados: inserção pública (registro de entrada)
CREATE POLICY "convidados_insert_public" ON convidados
  FOR INSERT WITH CHECK (true);

-- Convidados: update próprio registro (incrementar fotos)
CREATE POLICY "convidados_update_self" ON convidados
  FOR UPDATE USING (true);

-- Pagamentos: leitura pelo anfitrião do evento
CREATE POLICY "pagamentos_select_owner" ON pagamentos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM eventos
      WHERE eventos.id = pagamentos.evento_id
      AND eventos.anfitriao_id = auth.uid()
    )
  );

-- ============================================================
-- FUNÇÕES RPC para validação server-side
-- ============================================================

-- Função: registrar entrada de convidado (incrementa contador)
CREATE OR REPLACE FUNCTION registrar_entrada_convidado(
  p_evento_id UUID,
  p_device_id VARCHAR(64),
  p_nome VARCHAR(100) DEFAULT 'Convidado'
)
RETURNS JSON AS $$
DECLARE
  v_evento RECORD;
  v_plano RECORD;
  v_ja_existe BOOLEAN;
BEGIN
  -- Buscar evento com plano
  SELECT e.*, p.limite_convidados, p.limite_fotos_por_pessoa
  INTO v_evento
  FROM eventos e
  JOIN planos p ON p.id = e.plano_id
  WHERE e.id = p_evento_id;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'erro', 'Evento não encontrado');
  END IF;

  -- Verificar se evento está ativo
  IF v_evento.status != 'ativo' THEN
    RETURN json_build_object('ok', false, 'erro', 'Evento não está ativo');
  END IF;

  -- Verificar se já existe esse convidado
  SELECT EXISTS(
    SELECT 1 FROM convidados
    WHERE evento_id = p_evento_id AND usuario_dispositivo_id = p_device_id
  ) INTO v_ja_existe;

  IF v_ja_existe THEN
    -- Já existe, apenas retornar dados
    RETURN json_build_object(
      'ok', true,
      'ja_cadastrado', true,
      'limite_fotos', (SELECT limite_fotos_por_pessoa FROM planos WHERE id = v_evento.plano_id),
      'fotos_tiradas', (SELECT fotos_tiradas FROM convidados WHERE evento_id = p_evento_id AND usuario_dispositivo_id = p_device_id)
    );
  END IF;

  -- Verificar vagas
  IF v_evento.total_convidados_conectados >= v_evento.limite_convidados THEN
    RETURN json_build_object('ok', false, 'erro', 'Evento lotado');
  END IF;

  -- Registrar entrada
  INSERT INTO convidados (evento_id, usuario_dispositivo_id, nome)
  VALUES (p_evento_id, p_device_id, p_nome);

  -- Incrementar contador no evento
  UPDATE eventos
  SET total_convidados_conectados = total_convidados_conectados + 1
  WHERE id = p_evento_id;

  RETURN json_build_object(
    'ok', true,
    'ja_cadastrado', false,
    'limite_fotos', v_evento.limite_fotos_por_pessoa,
    'fotos_tiradas', 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: verificar se pode tirar foto
CREATE OR REPLACE FUNCTION pode_tirar_foto(
  p_evento_id UUID,
  p_device_id VARCHAR(64)
)
RETURNS JSON AS $$
DECLARE
  v_convidado RECORD;
  v_limite INT;
BEGIN
  -- Buscar plano do evento
  SELECT p.limite_fotos_por_pessoa INTO v_limite
  FROM eventos e
  JOIN planos p ON p.id = e.plano_id
  WHERE e.id = p_evento_id;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'erro', 'Evento não encontrado');
  END IF;

  -- Buscar convidado
  SELECT * INTO v_convidado
  FROM convidados
  WHERE evento_id = p_evento_id AND usuario_dispositivo_id = p_device_id;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'erro', 'Convidado não registrado');
  END IF;

  -- Verificar limite
  IF v_convidado.fotos_tiradas >= v_limite THEN
    RETURN json_build_object(
      'ok', false,
      'erro', 'Limite de fotos atingido',
      'limite', v_limite,
      'tiradas', v_convidado.fotos_tiradas
    );
  END IF;

  RETURN json_build_object(
    'ok', true,
    'limite', v_limite,
    'tiradas', v_convidado.fotos_tiradas,
    'restantes', v_limite - v_convidado.fotos_tiradas
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: registrar foto tirada (incrementa contador)
CREATE OR REPLACE FUNCTION registrar_foto(
  p_evento_id UUID,
  p_device_id VARCHAR(64),
  p_storage_key TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_filtro VARCHAR(20) DEFAULT 'original',
  p_largura INT DEFAULT 0,
  p_altura INT DEFAULT 0,
  p_tamanho_bytes INT DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
  v_limite INT;
  v_fotos_tiradas INT;
  v_foto_id UUID;
BEGIN
  -- Buscar limite
  SELECT p.limite_fotos_por_pessoa INTO v_limite
  FROM eventos e
  JOIN planos p ON p.id = e.plano_id
  WHERE e.id = p_evento_id;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'erro', 'Evento não encontrado');
  END IF;

  -- Buscar fotos tiradas
  SELECT fotos_tiradas INTO v_fotos_tiradas
  FROM convidados
  WHERE evento_id = p_evento_id AND usuario_dispositivo_id = p_device_id;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'erro', 'Convidado não registrado');
  END IF;

  -- Verificar limite
  IF v_fotos_tiradas >= v_limite THEN
    RETURN json_build_object(
      'ok', false,
      'erro', 'Limite de fotos atingido',
      'limite', v_limite,
      'tiradas', v_fotos_tiradas
    );
  END IF;

  -- Inserir foto
  INSERT INTO fotos (evento_id, usuario_dispositivo_id, storage_key, url, filtro, largura, altura, tamanho_bytes)
  VALUES (p_evento_id, p_device_id, p_storage_key, p_url, p_filtro, p_largura, p_altura, p_tamanho_bytes)
  RETURNING id INTO v_foto_id;

  -- Incrementar contador do convidado
  UPDATE convidados
  SET fotos_tiradas = fotos_tiradas + 1
  WHERE evento_id = p_evento_id AND usuario_dispositivo_id = p_device_id;

  RETURN json_build_object(
    'ok', true,
    'foto_id', v_foto_id,
    'limite', v_limite,
    'tiradas', v_fotos_tiradas + 1,
    'restantes', v_limite - v_fotos_tiradas - 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: buscar evento por share_code (com dados do plano)
CREATE OR REPLACE FUNCTION buscar_evento_por_share(p_share_code VARCHAR(8))
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'ok', true,
    'evento_id', e.id,
    'nome_evento', e.nome_evento,
    'status', e.status,
    'data_inicio', e.data_inicio,
    'data_fim', e.data_fim,
    'revelacao_modo', e.revelacao_modo,
    'revelacao_time', e.revelacao_time,
    'codigo_acesso', e.codigo_acesso,
    'share_code', e.share_code,
    'limite_convidados', p.limite_convidados,
    'limite_fotos_por_pessoa', p.limite_fotos_por_pessoa,
    'total_convidados', e.total_convidados_conectados
  ) INTO v_result
  FROM eventos e
  JOIN planos p ON p.id = e.plano_id
  WHERE e.share_code = p_share_code;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'erro', 'Evento não encontrado');
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: buscar fotos de um evento
CREATE OR REPLACE FUNCTION buscar_fotos_evento(p_evento_id UUID)
RETURNS SETOF fotos AS $$
  SELECT * FROM fotos
  WHERE evento_id = p_evento_id
  ORDER BY criado_em DESC;
$$ LANGUAGE sql SECURITY DEFINER;
