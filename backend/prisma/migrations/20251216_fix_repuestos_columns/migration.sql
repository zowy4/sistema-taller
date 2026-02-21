-- Fix Repuestos table columns to match schema

-- Rename existing columns
ALTER TABLE "Repuestos" RENAME COLUMN "cantidad_existente" TO "stock_actual";
ALTER TABLE "Repuestos" RENAME COLUMN "precio_unitario" TO "precio_venta";
ALTER TABLE "Repuestos" RENAME COLUMN "nivel_minimo_alerta" TO "stock_minimo";

-- Add missing columns
ALTER TABLE "Repuestos" ADD COLUMN "codigo" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Repuestos" ADD COLUMN "precio_compra" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Create unique constraint on codigo
CREATE UNIQUE INDEX "Repuestos_codigo_key" ON "Repuestos"("codigo");

-- Remove defaults after adding columns (optional but cleaner)
ALTER TABLE "Repuestos" ALTER COLUMN "codigo" DROP DEFAULT;
ALTER TABLE "Repuestos" ALTER COLUMN "precio_compra" DROP DEFAULT;
