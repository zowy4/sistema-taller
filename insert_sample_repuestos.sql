-- Insert sample repuestos data for testing
INSERT INTO "Repuestos" (
    nombre, 
    descripcion, 
    unidad_medida, 
    cantidad_existente, 
    precio_unitario, 
    nivel_minimo_alerta,
    codigo,
    stock_actual,
    precio_venta,
    precio_compra,
    stock_minimo
) VALUES 
('Filtro de aceite', 'Filtro estándar para motores', 'unidad', 50, 150.00, 10, 'REP-00001', 50, 150.00, 105.00, 10),
('Pastillas de freno', 'Juego de pastillas delanteras', 'juego', 30, 800.00, 5, 'REP-00002', 30, 800.00, 560.00, 5),
('Aceite de motor 5W-30', 'Aceite sintético premium', 'litro', 100, 120.00, 20, 'REP-00003', 100, 120.00, 84.00, 20),
('Batería 12V 60Ah', 'Batería estándar para vehículos', 'unidad', 15, 2500.00, 3, 'REP-00004', 15, 2500.00, 1750.00, 3),
('Neumático 195/65 R15', 'Neumático radial estándar', 'unidad', 8, 850.00, 4, 'REP-00005', 8, 850.00, 595.00, 4)
ON CONFLICT (nombre) DO NOTHING;

SELECT * FROM "Repuestos";
