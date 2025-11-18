SELECT id_empleado, nombre, apellido, email, rol, activo, 
       LENGTH(password) as password_length,
       SUBSTRING(password, 1, 20) as password_start
FROM "Empleados" 
WHERE email = 'admin@taller.com';
