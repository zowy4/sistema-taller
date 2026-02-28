const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // Hash password: admin123
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Crear empleado admin
    const admin = await prisma.empleados.upsert({
      where: { email: 'admin@taller.com' },
      update: { password: passwordHash },
      create: {
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@taller.com',
        password: passwordHash,
        rol: 'administrador',
        activo: true,
        telefono: '1234567890',
        direccion: 'Dirección Administrativa',
      },
    });

    console.log('✅ Admin creado:', admin.email);

    // Crear cliente de prueba
    const clienteHash = await bcrypt.hash('client123', 10);
    const cliente = await prisma.clientes.upsert({
      where: { email: 'cliente@test.com' },
      update: { password: clienteHash },
      create: {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'cliente@test.com',
        password: clienteHash,
        empresa: 'Test Company',
        telefono: '9876543210',
        direccion: 'Calle Principal 123',
      },
    });

    console.log('✅ Cliente creado:', cliente.email);

    console.log('🎉 Seed completado exitosamente!');
    console.log('Credenciales de prueba:');
    console.log('  Admin: admin@taller.com / admin123');
    console.log('  Cliente: cliente@test.com / client123');
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
