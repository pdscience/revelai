-- ============================================================
-- CRON JOBS: Encerramento automático e limpeza de fotos
-- Execute no SQL Editor do InsForge/Supabase
-- ============================================================

-- 1. Habilitar extensão pg_cron (se não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Habilitar extensão pg_net (necessária para pg_cron)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Agendar encerramento automático de eventos expirados (diariamente às 03:00)
SELECT cron.schedule(
  'encerrar-eventos-expirados',
  '0 3 * * *',
  $$SELECT public.encerrar_eventos_expirados()$$
);

-- 4. Agendar limpeza de fotos antigas (diariamente às 04:00, 10 dias após encerramento)
SELECT cron.schedule(
  'cleanup-fotos-antigas',
  '0 4 * * *',
  $$SELECT public.cleanup_old_photos(10)$$
);
