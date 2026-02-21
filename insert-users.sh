#!/bin/sh
# Script para insertar admin en PostgreSQL

psql -U postgres -d taller_db <<EOF
INSERT INTO "Empleados" (nombre, apellido, email, password, rol, activo, telefono, direccion, fecha_ingreso)
VALUES ('Admin', 'Sistema', 'admin@taller.com', '\$2b\$10\$0m3R2FABdAUvH0nL46mOueYTTKAVZkvKs26pRNCJpO6eXLYsjUnay', 'administrador', true, '1234567890', 'Dirección Administrativa', NOW())
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

INSERT INTO "Clientes" (nombre, apellido, email, password, empresa, telefono, direccion, fecha_alta)
VALUES ('Juan', 'Pérez', 'cliente@test.com', '\$2b\$10\$2YR9fYrP8jJ7Zx2pRtLmQu7w1K8M3vQ4sN5I6H9J0L7M2P1Q8R3S', 'Test Company', '9876543210', 'Calle Principal 123', NOW())
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

SELECT 'Admin creado/actualizado' As status;
SELECT id_empleado, nombre, email, rol FROM "Empleados" WHERE email='admin@taller.com';
EOF
