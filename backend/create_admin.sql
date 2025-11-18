-- Eliminar usuario admin anterior si existe
DELETE FROM "Empleados" WHERE email = 'admin@taller.com';

-- Crear usuario administrador de prueba
-- Password: admin123
INSERT INTO "Empleados" (nombre, apellido, email, password, rol, activo, fecha_ingreso)
VALUES ('Admin', 'Sistema', 'admin@taller.com', '$2b$10$0m3R2FABdAUvH0nL46mOueYTTKAVZkvKs26pRNCJpO6eXLYsjUnay', 'admin', true, NOW());

-- Verificar que se creó
SELECT id_empleado, nombre, apellido, email, rol, activo FROM "Empleados" WHERE email = 'admin@taller.com';
