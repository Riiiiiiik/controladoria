-- Ensure all columns required by the new form exist
ALTER TABLE registros ADD COLUMN IF NOT EXISTS meio_confirmacao text;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS gestor text;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS numero_op text;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS tipo text;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS cedente text;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS sacado text;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS nome_contato text;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS telefone text;
-- These had defaults in the form logic, safe to add here
ALTER TABLE registros ADD COLUMN IF NOT EXISTS boleto_status text DEFAULT 'Email';
ALTER TABLE registros ADD COLUMN IF NOT EXISTS entrega_mercadoria text DEFAULT 'Entregue';
