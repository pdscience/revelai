-- ============================================================
-- CORREÇÕES: decrementar foto, auto-close eventos, RLS melhorado
-- Execute no SQL Editor do InsForge/Supabase
-- ============================================================

-- 1. Função para decrementar contador de fotos do convidado (ao deletar)
CREATE OR REPLACE FUNCTION public.decrementar_foto_convidado(
  p_evento_id UUID,
  p_device_id VARCHAR(64)
)
RETURNS VOID AS $$
BEGIN
  UPDATE convidados
  SET fotos_tiradas = GREATEST(fotos_tiradas - 1, 0)
  WHERE evento_id = p_evento_id AND usuario_dispositivo_id = p_device_id;

  UPDATE eventos
  SET total_fotos = GREATEST(total_fotos - 1, 0)
  WHERE id = p_evento_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Função para encerrar automaticamente eventos após data_fim
CREATE OR REPLACE FUNCTION public.encerrar_eventos_expirados()
RETURNS JSON AS $$
DECLARE
  v_encerrados INT;
BEGIN
  UPDATE eventos
  SET status = 'encerrado'
  WHERE status = 'ativo'
    AND data_fim < NOW();

  GET DIAGNOSTICS v_encerrados = ROW_COUNT;

  RETURN json_build_object(
    'ok', true,
    'eventos_encerrados', v_encerrados
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Função para deletar uma foto individual (storage + DB)
CREATE OR REPLACE FUNCTION public.deletar_foto(
  p_foto_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_foto RECORD;
  v_storage_deleted BOOLEAN := false;
BEGIN
  -- Buscar foto
  SELECT * INTO v_foto
  FROM fotos
  WHERE id = p_foto_id;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'erro', 'Foto não encontrada');
  END IF;

  -- Deletar do storage
  IF v_foto.storage_key IS NOT NULL THEN
    BEGIN
      DELETE FROM storage.objects
      WHERE bucket_id = 'event-photos'
        AND name = v_foto.storage_key;
      v_storage_deleted := true;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- Deletar registro
  DELETE FROM fotos WHERE id = p_foto_id;

  -- Decrementar contadores
  UPDATE convidados
  SET fotos_tiradas = GREATEST(fotos_tiradas - 1, 0)
  WHERE evento_id = v_foto.evento_id
    AND usuario_dispositivo_id = v_foto.usuario_dispositivo_id;

  UPDATE eventos
  SET total_fotos = GREATEST(total_fotos - 1, 0)
  WHERE id = v_foto.evento_id;

  RETURN json_build_object(
    'ok', true,
    'storage_deletado', v_storage_deleted
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Melhorar RLS policies

-- Remover políticas antigas de fotos
DROP POLICY IF EXISTS "fotos_select_public" ON fotos;
DROP POLICY IF EXISTS "fotos_insert_public" ON fotos;

-- Fotos: leitura para participantes do evento (anfitrião ou convidado registrado)
CREATE POLICY "fotos_select_participants" ON fotos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM eventos
      WHERE eventos.id = fotos.evento_id
        AND (
          eventos.anfitriao_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM convidados
            WHERE convidados.evento_id = fotos.evento_id
              AND convidados.usuario_dispositivo_id = current_setting('request.jwt.claims', true)::json->>'sub'
          )
        )
    )
  );

-- Fotos: inserção apenas por convidados registrados no evento
CREATE POLICY "fotos_insert_registered" ON fotos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM convidados
      WHERE convidados.evento_id = fotos.evento_id
        AND convidados.usuario_dispositivo_id = fotos.usuario_dispositivo_id
    )
  );

-- Fotos: delete pelo dono da foto ou anfitrião
CREATE POLICY "fotos_delete_owner_or_host" ON fotos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM eventos
      WHERE eventos.id = fotos.evento_id
        AND (
          eventos.anfitriao_id = auth.uid()
          OR fotos.usuario_dispositivo_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    )
  );

-- Convidados: restringir update ao próprio registro (via device_id no JWT)
DROP POLICY IF EXISTS "convidados_update_self" ON convidados;

CREATE POLICY "convidados_update_own" ON convidados
  FOR UPDATE USING (
    usuario_dispositivo_id = current_setting('request.jwt.claims', true)::json->>'sub'
    OR EXISTS (
      SELECT 1 FROM eventos
      WHERE eventos.id = convidados.evento_id
        AND eventos.anfitriao_id = auth.uid()
    )
  );
