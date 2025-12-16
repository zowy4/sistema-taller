-- Check Servicios table structure
\d "Servicios"

-- Add missing precio column
ALTER TABLE "Servicios" ADD COLUMN IF NOT EXISTS "precio" DOUBLE PRECISION;

-- Check if there's a precio_base column and copy data
UPDATE "Servicios" SET "precio" = "precio_base" WHERE "precio" IS NULL AND "precio_base" IS NOT NULL;

-- Verify
SELECT * FROM "Servicios" LIMIT 5;
