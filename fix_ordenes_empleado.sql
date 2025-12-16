-- Make id_empleado_responsable nullable to match Prisma schema
ALTER TABLE "OrdenesDeTrabajo" ALTER COLUMN "id_empleado_responsable" DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'OrdenesDeTrabajo' 
  AND column_name = 'id_empleado_responsable';
