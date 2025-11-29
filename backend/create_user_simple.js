const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Generar hash para la contraseña "taller123"
  const password = 'taller123';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n🔑 Creando usuario con contraseña:', password);
  console.log('📝 Hash generado:', hash);
  
  try {
    // Eliminar usuario si existe
    await prisma.empleados.deleteMany({
      where: { email: 'test@taller.com' }
    });
    
    // Crear nuevo usuario
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
    
    console.log('\n✅ Usuario creado exitosamente!');
    console.log('\n📧 Email:', user.email);
    console.log('🔐 Password:', password);
    console.log('👤 Rol:', user.rol);
    console.log('\n🌐 Usa estas credenciales en http://localhost:3000');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
