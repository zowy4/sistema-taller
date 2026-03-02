-- Insert test client with BCrypt hashed password (password is 'test123')
-- Using bcrypt hash for 'test123'
INSERT INTO "Clientes" (nombre, apellido, empresa, telefono, email, password, direccion, fecha_alta)
VALUES ('Test', 'User', 'Test Company', '1234567890', 'test@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/DiO', '123 Test St', NOW())
ON CONFLICT (email) DO NOTHING;

-- Also create an employee test user
INSERT INTO "Empleados" (nombre, apellido, email, password, telefono, direccion, rol)
VALUES ('Admin', 'User', 'admin@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/DiO', '0987654321', '456 Admin St', 'admin')
ON CONFLICT (email) DO NOTHING;
