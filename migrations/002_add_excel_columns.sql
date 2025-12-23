-- Add new columns to match Excel structure
ALTER TABLE registros
ADD COLUMN IF NOT EXISTS meio_confirmacao text,
ADD COLUMN IF NOT EXISTS gestor text,
ADD COLUMN IF NOT EXISTS numero_op text,
ADD COLUMN IF NOT EXISTS tipo text,
ADD COLUMN IF NOT EXISTS cedente text,
ADD COLUMN IF NOT EXISTS sacado text,
ADD COLUMN IF NOT EXISTS nome_contato text,
ADD COLUMN IF NOT EXISTS telefone text,
ADD COLUMN IF NOT EXISTS boleto_status text,
ADD COLUMN IF NOT EXISTS conf_boleto text,
ADD COLUMN IF NOT EXISTS entrega_mercadoria text;

-- Rename or mapping notes (optional, handled in code)
-- 'data_contato' corresponds to 'DATA'
-- 'valor' corresponds to 'VALOR'
-- 'status' corresponds to 'STATUS'
-- 'observacoes' corresponds to 'OBSERVAÇÃO'
