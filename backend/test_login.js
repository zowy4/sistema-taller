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
      console.log('✗ No se encontró el empleado');
      return;
    }
    
    console.log('✓ Empleado encontrado:', {
      id: empleado.id_empleado,
      nombre: empleado.nombre,
      email: empleado.email,
      rol: empleado.rol,
      hasPassword: !!empleado.password
    });
    
    if (!empleado.password) {
      console.log('✗ El empleado no tiene contraseña');
      return;
    }
    
    console.log('Comparando contraseña...');
    const isMatch = await bcrypt.compare(password, empleado.password);
    
    console.log('Resultado de comparación:', isMatch);
    
    if (isMatch) {
      console.log('✓ ¡Login exitoso!');
    } else {
      console.log('✗ Contraseña incorrecta');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
