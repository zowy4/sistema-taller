-- Check current Repuestos table structure
\d "Repuestos"

-- Add missing columns if they don't exist
ALTER TABLE "Repuestos" ADD COLUMN IF NOT EXISTS "codigo" TEXT;
ALTER TABLE "Repuestos" ADD COLUMN IF NOT EXISTS "stock_actual" INTEGER DEFAULT 0;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Repuestos' 
ORDER BY ordinal_position;
