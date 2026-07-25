-- ============================================================
-- POLÍTICA DE RETENÇÃO DE FOTOS
-- ============================================================

-- Função para limpar fotos de eventos encerrados há mais de X dias
CREATE OR REPLACE FUNCTION public.cleanup_old_photos(days_to_keep integer DEFAULT 90)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_fotos integer := 0;
  v_deleted_storage integer := 0;
  v_evento record;
  v_foto record;
BEGIN
  -- Buscar eventos encerrados há mais de X dias
  FOR v_evento IN
    SELECT id, nome_evento
    FROM eventos
    WHERE status IN ('encerrado', 'cancelado')
      AND data_fim < (now() - (days_to_keep || ' days')::interval)
  LOOP
    -- Deletar fotos do storage
    FOR v_foto IN
      SELECT storage_key
      FROM fotos
      WHERE evento_id = v_evento.id
        AND storage_key IS NOT NULL
    LOOP
      BEGIN
        DELETE FROM storage.objects
        WHERE bucket_id = 'event-photos'
          AND name = v_foto.storage_key;
        v_deleted_storage := v_deleted_storage + 1;
      EXCEPTION WHEN OTHERS THEN
        -- Ignorar erro de storage (objeto pode não existir)
        NULL;
      END;
    END LOOP;

    -- Deletar registros de fotos
    DELETE FROM fotos WHERE evento_id = v_evento.id;
    GET DIAGNOSTICS v_deleted_fotos = ROW_COUNT;
  END LOOP;

  RETURN json_build_object(
    'ok', true,
    'fotos_deletadas', v_deleted_fotos,
    'storage_deletados', v_deleted_storage,
    'dias_mantidos', days_to_keep
  );
END;
$$;

-- Função para limpar fotos de um evento específico
CREATE OR REPLACE FUNCTION public.delete_event_photos(p_evento_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_fotos integer := 0;
  v_deleted_storage integer := 0;
  v_foto record;
BEGIN
  -- Deletar fotos do storage
  FOR v_foto IN
    SELECT storage_key
    FROM fotos
    WHERE evento_id = p_evento_id
      AND storage_key IS NOT NULL
  LOOP
    BEGIN
      DELETE FROM storage.objects
      WHERE bucket_id = 'event-photos'
        AND name = v_foto.storage_key;
      v_deleted_storage := v_deleted_storage + 1;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;

  -- Deletar registros de fotos
  DELETE FROM fotos WHERE evento_id = p_evento_id;
  GET DIAGNOSTICS v_deleted_fotos = ROW_COUNT;

  -- Atualizar total_fotos do evento
  UPDATE eventos SET total_fotos = 0 WHERE id = p_evento_id;

  RETURN json_build_object(
    'ok', true,
    'fotos_deletadas', v_deleted_fotos,
    'storage_deletados', v_deleted_storage
  );
END;
$$;

-- Habilitar RLS nas tabelas (se ainda não estiver)
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
