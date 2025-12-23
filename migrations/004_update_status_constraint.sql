-- Remove the old constraint
ALTER TABLE registros DROP CONSTRAINT IF EXISTS registros_status_check;

-- Migrate existing data
UPDATE registros SET status = 'Reprovado' WHERE status = 'Rejeitado';

-- Add the new constraint with 'Reprovado' instead of 'Rejeitado'
ALTER TABLE registros ADD CONSTRAINT registros_status_check
CHECK (status IN ('Pendente', 'Aprovado', 'Reprovado', 'Em Andamento'));
