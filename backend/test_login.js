const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function testLogin() {
  try {
    const email = 'admin@taller.com';
    const password = 'admin123';
    console.log('Buscando empleado con email:', email);
    const empleado = await prisma.empleados.findUnique({ 
      where: { email } 
    });
    if (!empleado) {
      console.log('âœ— No se encontrÃ³ el empleado');
      return;
    }
    console.log('âœ“ Empleado encontrado:', {
      id: empleado.id_empleado,
      nombre: empleado.nombre,
      email: empleado.email,
      rol: empleado.rol,
      hasPassword: !!empleado.password
    });
    if (!empleado.password) {
      console.log('âœ— El empleado no tiene contraseÃ±a');
      return;
    }
    console.log('Comparando contraseÃ±a...');
    const isMatch = await bcrypt.compare(password, empleado.password);
    console.log('Resultado de comparaciÃ³n:', isMatch);
    if (isMatch) {
      console.log('âœ“ Â¡Login exitoso!');
    } else {
      console.log('âœ— ContraseÃ±a incorrecta');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}
testLogin();
