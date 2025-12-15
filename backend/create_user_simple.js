const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const password = 'taller123';
  const hash = await bcrypt.hash(password, 10);
  console.log('\nðŸ”‘ Creando usuario con contraseÃ±a:', password);
  console.log('ðŸ“ Hash generado:', hash);
  try {
    await prisma.empleados.deleteMany({
      where: { email: 'test@taller.com' }
    });
    const user = await prisma.empleados.create({
      data: {
        nombre: 'Test',
        apellido: 'Admin',
        email: 'test@taller.com',
        password: hash,
        rol: 'admin',
        activo: true,
        fecha_ingreso: new Date()
      }
    });
    console.log('\nâœ… Usuario creado exitosamente!');
    console.log('\nðŸ“§ Email:', user.email);
    console.log('ðŸ” Password:', password);
    console.log('ðŸ‘¤ Rol:', user.rol);
    console.log('\nðŸŒ Usa estas credenciales en http:
  } catch (error) {
    console.error('\nâŒ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
