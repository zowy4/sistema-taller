ALTER TABLE "OrdenesDeTrabajo" ADD COLUMN IF NOT EXISTS notas TEXT;
ALTER TABLE "Servicios" ADD COLUMN IF NOT EXISTS precio double precision;
