-- Make fecha_entrega_estimada nullable to match Prisma schema
ALTER TABLE "OrdenesDeTrabajo" ALTER COLUMN "fecha_entrega_estimada" DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'OrdenesDeTrabajo' 
  AND column_name LIKE '%fecha%';
