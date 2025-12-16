-- Add all missing columns to match Prisma schema
ALTER TABLE "Repuestos" ADD COLUMN IF NOT EXISTS "precio_venta" DOUBLE PRECISION;
ALTER TABLE "Repuestos" ADD COLUMN IF NOT EXISTS "precio_compra" DOUBLE PRECISION;
ALTER TABLE "Repuestos" ADD COLUMN IF NOT EXISTS "stock_minimo" INTEGER;

-- Update new columns with data from existing columns
UPDATE "Repuestos" SET "stock_actual" = "cantidad_existente" WHERE "stock_actual" IS NULL;
UPDATE "Repuestos" SET "precio_venta" = "precio_unitario" WHERE "precio_venta" IS NULL;
UPDATE "Repuestos" SET "precio_compra" = "precio_unitario" * 0.7 WHERE "precio_compra" IS NULL; -- Assuming 30% markup
UPDATE "Repuestos" SET "stock_minimo" = "nivel_minimo_alerta" WHERE "stock_minimo" IS NULL;
UPDATE "Repuestos" SET "codigo" = 'REP-' || LPAD(id_repuesto::TEXT, 5, '0') WHERE "codigo" IS NULL;

-- Verify the changes
SELECT 
    id_repuesto, 
    nombre, 
    cantidad_existente,
    stock_actual,
    precio_unitario,
    precio_venta,
    precio_compra,
    nivel_minimo_alerta,
    stock_minimo,
    codigo
FROM "Repuestos" 
LIMIT 5;
