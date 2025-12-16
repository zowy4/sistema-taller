-- Check OrdenesDeTrabajo table structure
\d "OrdenesDeTrabajo"

-- Add missing notas column
ALTER TABLE "OrdenesDeTrabajo" ADD COLUMN IF NOT EXISTS "notas" TEXT;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'OrdenesDeTrabajo' 
ORDER BY ordinal_position;
