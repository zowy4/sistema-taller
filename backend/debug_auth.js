const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function debugAuth() {
  try {
    console.log('=== DEPURACIÓN DE AUTENTICACIÓN ===\n');
    
    // 1. Verificar usuarios en BD
    console.log('1. Consultando empleados...');
    const empleados = await prisma.empleados.findMany({
      select: {
        id_empleado: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        activo: true,
        password: true
      }
    });
    
    console.log(`   Encontrados ${empleados.length} empleados:\n`);
    
    for (const emp of empleados) {
      console.log(`   ID: ${emp.id_empleado}`);
      console.log(`   Nombre: ${emp.nombre} ${emp.apellido}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Rol: ${emp.rol}`);
      console.log(`   Activo: ${emp.activo}`);
      console.log(`   Tiene contraseña: ${emp.password ? 'SÍ' : 'NO'}`);
      
      if (emp.password) {
        console.log(`   Longitud hash: ${emp.password.length} caracteres`);
        console.log(`   Hash inicia con: ${emp.password.substring(0, 20)}`);
        
        // Probar con contraseñas comunes
        const passwordsToTest = ['admin123', 'Admin123', 'admin', '123456'];
        
        for (const testPass of passwordsToTest) {
          const match = await bcrypt.compare(testPass, emp.password);
          if (match) {
            console.log(`   ✓ COINCIDE CON: "${testPass}"`);
          }
        }
      }
      console.log('');
    }
    
    // 2. Verificar clientes
    console.log('2. Consultando clientes...');
    const clientes = await prisma.clientes.findMany({
      where: {
        password: { not: null }
      },
      select: {
        id_cliente: true,
        nombre: true,
        apellido: true,
        email: true,
        password: true
      }
    });
    
    console.log(`   Encontrados ${clientes.length} clientes con contraseña\n`);
    
    for (const cli of clientes) {
      console.log(`   ID: ${cli.id_cliente}`);
      console.log(`   Nombre: ${cli.nombre} ${cli.apellido}`);
      console.log(`   Email: ${cli.email}`);
      console.log(`   Tiene contraseña: ${cli.password ? 'SÍ' : 'NO'}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuth();
