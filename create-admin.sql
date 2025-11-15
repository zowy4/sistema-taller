-- Crear usuario administrador
-- Email: admin@taller.com
-- Password: admin123

INSERT INTO "Empleados" (
    nombre, 
    apellido, 
    email, 
    password, 
    telefono, 
    direccion, 
    activo, 
    rol
) VALUES (
    'Admin',
    'Sistema',
    'admin@taller.com',
    '$2b$10$YQeJz.kZ8Kvq5J5YxZ0Z.OvwgZ5S0eKvq5J5YxZ0Z.YxZ0Z0Z0Z0ZO',
    '1234567890',
    'Dirección Administrativa',
    true,
    'administrador'
) ON CONFLICT (email) DO NOTHING;

-- Verificar que se creó
SELECT id_empleado, nombre, apellido, email, rol, activo 
FROM "Empleados" 
WHERE email = 'admin@taller.com';
