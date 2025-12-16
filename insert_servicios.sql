-- Update precio from precio_estandar if it exists
UPDATE "Servicios" SET "precio" = "precio_estandar" WHERE "precio" IS NULL;

-- Insert sample services
INSERT INTO "Servicios" (nombre, descripcion, precio, activo, tiempo_estimado) VALUES
('Cambio de aceite', 'Cambio de aceite de motor y filtro', 500.00, true, 30),
('Alineación y balanceo', 'Alineación y balanceo de ruedas', 800.00, true, 60),
('Revisión de frenos', 'Inspección y ajuste del sistema de frenos', 600.00, true, 45),
('Diagnóstico electrónico', 'Escaneo y diagnóstico con computadora', 400.00, true, 30),
('Cambio de batería', 'Reemplazo e instalación de batería', 300.00, true, 20)
ON CONFLICT (nombre) DO NOTHING;

SELECT * FROM "Servicios";
