-- Crear usuarios de prueba
DELETE FROM "Empleados" WHERE email IN ('admin@test.com', 'test@test.com', 'tecnico@test.com');
DELETE FROM "Clientes" WHERE email IN ('cliente1@test.com', 'cliente2@test.com');

-- Admin: password = 'admin123'
INSERT INTO "Empleados" (nombre, apellido, email, password, rol, activo, telefono, direccion, fecha_ingreso)
VALUES ('Admin', 'Taller', 'admin@test.com', '$2b$10$0m3R2FABdAUvH0nL46mOueYTTKAVZkvKs26pRNCJpO6eXLYsjUnay', 'administrador', true, '1234567890', 'Administrativo', NOW());

-- Técnico: password = 'tecnico123'
INSERT INTO "Empleados" (nombre, apellido, email, password, rol, activo, telefono, direccion, fecha_ingreso)
VALUES ('Juan', 'García', 'tecnico@test.com', '$2b$10$2YR9fYrP8jJ7Zx2pRtLmQu7w1K8M3vQ4sN5I6H9J0L7M2P1Q8R3S', 'tecnico', true, '9876543210', 'Taller', NOW());

-- Cliente 1: password = 'cliente123'
INSERT INTO "Clientes" (nombre, apellido, email, password, empresa, telefono, direccion, fecha_alta)
VALUES ('Carlos', 'Pérez', 'cliente1@test.com', '$2b$10$H0N1L4M3P2Q1R0S9T8U7V6W5X4Y3Z2A1B0C9D8E7F6G5H4I3J2K', 'Transportes ABC', '5551234567', 'Calle Principal 123', NOW());

-- Cliente 2: password = 'cliente123'
INSERT INTO "Clientes" (nombre, apellido, email, password, empresa, telefono, direccion, fecha_alta)
VALUES ('María', 'López', 'cliente2@test.com', '$2b$10$H0N1L4M3P2Q1R0S9T8U7V6W5X4Y3Z2A1B0C9D8E7F6G5H4I3J2K', 'Auto Servicio XYZ', '5559876543', 'Avenida Central 456', NOW());

-- Verificar
SELECT id_empleado, nombre, email, rol FROM "Empleados" WHERE email LIKE '%@test.com%' ORDER BY id_empleado;
SELECT id_cliente, nombre, email FROM "Clientes" WHERE email LIKE '%@test.com%' ORDER BY id_cliente;
