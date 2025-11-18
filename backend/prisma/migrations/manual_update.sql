-- Migración para actualizar schema de Repuestos y Servicios

-- 1. Actualizar tabla Repuestos
-- Renombrar columnas existentes
ALTER TABLE "Repuestos" RENAME COLUMN "cantidad_existente" TO "stock_actual";
ALTER TABLE "Repuestos" RENAME COLUMN "nivel_minimo_alerta" TO "stock_minimo";
ALTER TABLE "Repuestos" RENAME COLUMN "precio_unitario" TO "precio_venta";

-- Agregar nuevas columnas con valores por defecto
ALTER TABLE "Repuestos" ADD COLUMN "codigo" TEXT;
ALTER TABLE "Repuestos" ADD COLUMN "precio_compra" DOUBLE PRECISION;

-- Generar códigos únicos para registros existentes
UPDATE "Repuestos" SET "codigo" = 'REP-' || LPAD(id_repuesto::TEXT, 5, '0') WHERE "codigo" IS NULL;
UPDATE "Repuestos" SET "precio_compra" = "precio_venta" * 0.7 WHERE "precio_compra" IS NULL;

-- Hacer las columnas NOT NULL
ALTER TABLE "Repuestos" ALTER COLUMN "codigo" SET NOT NULL;
ALTER TABLE "Repuestos" ALTER COLUMN "precio_compra" SET NOT NULL;

-- Agregar constraint único para codigo
ALTER TABLE "Repuestos" ADD CONSTRAINT "Repuestos_codigo_key" UNIQUE ("codigo");

-- 2. Actualizar tabla Servicios
-- Renombrar columna existente
ALTER TABLE "Servicios" RENAME COLUMN "precio_estandar" TO "precio";

-- Agregar nueva columna con valor por defecto
ALTER TABLE "Servicios" ADD COLUMN "tiempo_estimado" INTEGER DEFAULT 60;
ALTER TABLE "Servicios" ALTER COLUMN "tiempo_estimado" DROP DEFAULT;

-- 3. Actualizar tabla OrdenesDeTrabajo
-- Agregar campo notas
ALTER TABLE "OrdenesDeTrabajo" ADD COLUMN "notas" TEXT;

-- Hacer fecha_entrega_estimada opcional
ALTER TABLE "OrdenesDeTrabajo" ALTER COLUMN "fecha_entrega_estimada" DROP NOT NULL;

-- Hacer id_empleado_responsable opcional
ALTER TABLE "OrdenesDeTrabajo" ALTER COLUMN "id_empleado_responsable" DROP NOT NULL;
