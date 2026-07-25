-- ============================================================
-- REVELAI - Seed: Planos
-- Execute APÓS 001_create_tables.sql
-- ============================================================

INSERT INTO planos (nome, preco_centavos, limite_convidados, limite_fotos_por_pessoa, ativo)
VALUES
  ('Teste',          0,      5,   10, true),
  ('Festa Média',    4990,  25,   25, true),
  ('Grande Evento', 11990,  50,   30, true),
  ('Casamento Standard', 19990, 100, 30, true),
  ('Casamento Premium',  29990, 150, 30, true),
  ('Corporativo / Ilimitado', 59990, 9999, 9999, true)
ON CONFLICT DO NOTHING;
