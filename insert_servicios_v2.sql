-- Add missing columns
ALTER TABLE "Servicios" ADD COLUMN IF NOT EXISTS "tiempo_estimado" INTEGER;

-- Insert sample services without tiempo_estimado
INSERT INTO "Servicios" (nombre, descripcion, precio, activo) VALUES
('Cambio de aceite', 'Cambio de aceite de motor y filtro', 500.00, true),
('Alineación y balanceo', 'Alineación y balanceo de ruedas', 800.00, true),
('Revisión de frenos', 'Inspección y ajuste del sistema de frenos', 600.00, true),
('Diagnóstico electrónico', 'Escaneo y diagnóstico con computadora', 400.00, true),
('Cambio de batería', 'Reemplazo e instalación de batería', 300.00, true)
ON CONFLICT (nombre) DO NOTHING;

SELECT * FROM "Servicios";
