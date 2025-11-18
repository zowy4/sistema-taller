-- Crear usuario de prueba simple
INSERT INTO "Empleados" (nombre, apellido, email, password, rol, activo, fecha_ingreso)
VALUES ('Test', 'User', 'test@test.com', '$2b$10$dBJxAtjvq.T5Kw89AII0fOAUETxhdd6u/JftIH2WfbVrIuF8eIAnu', 'admin', true, NOW());
