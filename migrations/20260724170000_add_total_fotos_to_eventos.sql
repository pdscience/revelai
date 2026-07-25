-- Atualizar RPC registrar_foto para incrementar total_fotos no evento
CREATE OR REPLACE FUNCTION public.registrar_foto(p_evento_id uuid, p_device_id character varying, p_storage_key text DEFAULT NULL::text, p_url text DEFAULT NULL::text, p_filtro character varying DEFAULT 'original'::character varying, p_largura integer DEFAULT 0, p_altura integer DEFAULT 0, p_tamanho_bytes integer DEFAULT 0)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_limite INT;
  v_fotos_tiradas INT;
  v_foto_id UUID;
  v_total_fotos INT;
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

  -- Incrementar total_fotos do evento
  UPDATE eventos SET total_fotos = total_fotos + 1 WHERE id = p_evento_id RETURNING total_fotos INTO v_total_fotos;

  RETURN json_build_object(
    'ok', true,
    'foto_id', v_foto_id,
    'limite', v_limite,
    'tiradas', v_fotos_tiradas + 1,
    'restantes', v_limite - v_fotos_tiradas - 1,
    'total_fotos', v_total_fotos
  );
END;
$function$;
