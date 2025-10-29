import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear roles
  const roles = await Promise.all([
    prisma.roles.create({
      data: {
        nombre: 'admin',
        descripcion: 'Administrador del sistema con acceso completo',
        activo: true,
      },
    }),
    prisma.roles.create({
      data: {
        nombre: 'supervisor',
        descripcion: 'Supervisor con acceso a gestión y reportes',
        activo: true,
      },
    }),
    prisma.roles.create({
      data: {
        nombre: 'tecnico',
        descripcion: 'Técnico con acceso limitado a órdenes de trabajo',
        activo: true,
      },
    }),
    prisma.roles.create({
      data: {
        nombre: 'recepcion',
        descripcion: 'Recepción con acceso a clientes y órdenes',
        activo: true,
      },
    }),
  ]);

  console.log('✅ Roles creados:', roles.map(r => r.nombre));

  // Crear permisos
  const permisos = await Promise.all([
    // Permisos de clientes
    prisma.permisos.create({
      data: {
        nombre: 'clientes:create',
        descripcion: 'Crear nuevos clientes',
        modulo: 'clientes',
        accion: 'create',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'clientes:read',
        descripcion: 'Ver información de clientes',
        modulo: 'clientes',
        accion: 'read',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'clientes:update',
        descripcion: 'Actualizar información de clientes',
        modulo: 'clientes',
        accion: 'update',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'clientes:delete',
        descripcion: 'Eliminar clientes',
        modulo: 'clientes',
        accion: 'delete',
      },
    }),
    // Permisos de vehículos
    prisma.permisos.create({
      data: {
        nombre: 'vehiculos:create',
        descripcion: 'Crear nuevos vehículos',
        modulo: 'vehiculos',
        accion: 'create',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'vehiculos:read',
        descripcion: 'Ver información de vehículos',
        modulo: 'vehiculos',
        accion: 'read',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'vehiculos:update',
        descripcion: 'Actualizar información de vehículos',
        modulo: 'vehiculos',
        accion: 'update',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'vehiculos:delete',
        descripcion: 'Eliminar vehículos',
        modulo: 'vehiculos',
        accion: 'delete',
      },
    }),
    // Permisos de órdenes
    prisma.permisos.create({
      data: {
        nombre: 'ordenes:create',
        descripcion: 'Crear nuevas órdenes de trabajo',
        modulo: 'ordenes',
        accion: 'create',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'ordenes:read',
        descripcion: 'Ver órdenes de trabajo',
        modulo: 'ordenes',
        accion: 'read',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'ordenes:update',
        descripcion: 'Actualizar órdenes de trabajo',
        modulo: 'ordenes',
        accion: 'update',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'ordenes:delete',
        descripcion: 'Eliminar órdenes de trabajo',
        modulo: 'ordenes',
        accion: 'delete',
      },
    }),
    // Permisos de facturas
    prisma.permisos.create({
      data: {
        nombre: 'facturas:create',
        descripcion: 'Crear facturas',
        modulo: 'facturas',
        accion: 'create',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'facturas:read',
        descripcion: 'Ver facturas',
        modulo: 'facturas',
        accion: 'read',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'facturas:update',
        descripcion: 'Actualizar facturas',
        modulo: 'facturas',
        accion: 'update',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'facturas:delete',
        descripcion: 'Eliminar facturas',
        modulo: 'facturas',
        accion: 'delete',
      },
    }),
    // Permisos de empleados
    prisma.permisos.create({
      data: {
        nombre: 'empleados:create',
        descripcion: 'Crear nuevos empleados',
        modulo: 'empleados',
        accion: 'create',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'empleados:read',
        descripcion: 'Ver información de empleados',
        modulo: 'empleados',
        accion: 'read',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'empleados:update',
        descripcion: 'Actualizar información de empleados',
        modulo: 'empleados',
        accion: 'update',
      },
    }),
    prisma.permisos.create({
      data: {
        nombre: 'empleados:delete',
        descripcion: 'Eliminar empleados',
        modulo: 'empleados',
        accion: 'delete',
      },
    }),
    // Permisos de reportes
    prisma.permisos.create({
      data: {
        nombre: 'reportes:read',
        descripcion: 'Ver reportes y estadísticas',
        modulo: 'reportes',
        accion: 'read',
      },
    }),
    // Permisos de configuración
    prisma.permisos.create({
      data: {
        nombre: 'configuracion:update',
        descripcion: 'Modificar configuración del sistema',
        modulo: 'configuracion',
        accion: 'update',
      },
    }),
  ]);

  console.log('✅ Permisos creados:', permisos.length);

  // Asignar permisos a roles
  const adminRole = roles.find(r => r.nombre === 'admin');
  const supervisorRole = roles.find(r => r.nombre === 'supervisor');
  const tecnicoRole = roles.find(r => r.nombre === 'tecnico');
  const recepcionRole = roles.find(r => r.nombre === 'recepcion');

  // Admin: todos los permisos
  for (const permiso of permisos) {
    await prisma.rol_Permiso.create({
      data: {
        id_rol: adminRole!.id_rol,
        id_permiso: permiso.id_permiso,
      },
    });
  }

  // Supervisor: permisos de gestión (sin eliminar empleados)
  const supervisorPermissions = permisos.filter(p => 
    !p.nombre.includes('empleados:delete') && 
    !p.nombre.includes('configuracion:update')
  );
  for (const permiso of supervisorPermissions) {
    await prisma.rol_Permiso.create({
      data: {
        id_rol: supervisorRole!.id_rol,
        id_permiso: permiso.id_permiso,
      },
    });
  }

  // Técnico: solo lectura y actualización de órdenes
  const tecnicoPermissions = permisos.filter(p => 
    p.nombre.includes('ordenes:read') || 
    p.nombre.includes('ordenes:update') ||
    p.nombre.includes('clientes:read') ||
    p.nombre.includes('vehiculos:read') ||
    p.nombre.includes('facturas:read')
  );
  for (const permiso of tecnicoPermissions) {
    await prisma.rol_Permiso.create({
      data: {
        id_rol: tecnicoRole!.id_rol,
        id_permiso: permiso.id_permiso,
      },
    });
  }

  // Recepción: gestión de clientes y órdenes
  const recepcionPermissions = permisos.filter(p => 
    p.nombre.includes('clientes:') ||
    p.nombre.includes('vehiculos:') ||
    p.nombre.includes('ordenes:') ||
    p.nombre.includes('facturas:create') ||
    p.nombre.includes('facturas:read')
  );
  for (const permiso of recepcionPermissions) {
    await prisma.rol_Permiso.create({
      data: {
        id_rol: recepcionRole!.id_rol,
        id_permiso: permiso.id_permiso,
      },
    });
  }

  console.log('✅ Permisos asignados a roles');

  // Crear empleados de ejemplo
  const hashedPassword = await bcrypt.hash('password123', 10);

  const empleados = await Promise.all([
    prisma.empleados.create({
      data: {
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@taller.com',
        password: hashedPassword,
        rol: 'admin',
        activo: true,
      },
    }),
    prisma.empleados.create({
      data: {
        nombre: 'Juan',
        apellido: 'Supervisor',
        email: 'supervisor@taller.com',
        password: hashedPassword,
        rol: 'supervisor',
        activo: true,
      },
    }),
    prisma.empleados.create({
      data: {
        nombre: 'Carlos',
        apellido: 'Técnico',
        email: 'tecnico@taller.com',
        password: hashedPassword,
        rol: 'tecnico',
        activo: true,
      },
    }),
    prisma.empleados.create({
      data: {
        nombre: 'María',
        apellido: 'Recepción',
        email: 'recepcion@taller.com',
        password: hashedPassword,
        rol: 'recepcion',
        activo: true,
      },
    }),
  ]);

  console.log('✅ Empleados creados:', empleados.map(e => `${e.nombre} ${e.apellido} (${e.email})`));

  // Crear cliente de ejemplo
  const cliente = await prisma.clientes.create({
    data: {
      nombre: 'Cliente',
      apellido: 'Ejemplo',
      email: 'cliente@ejemplo.com',
      password: hashedPassword,
      telefono: '123456789',
      direccion: 'Calle Ejemplo 123',
      empresa: 'Empresa Ejemplo',
    },
  });

  console.log('✅ Cliente creado:', `${cliente.nombre} ${cliente.apellido} (${cliente.email})`);

  console.log('🎉 Seed completado exitosamente!');
  console.log('\n📋 Credenciales de prueba:');
  console.log('👤 Admin: admin@taller.com / password123');
  console.log('👤 Supervisor: supervisor@taller.com / password123');
  console.log('👤 Técnico: tecnico@taller.com / password123');
  console.log('👤 Recepción: recepcion@taller.com / password123');
  console.log('👤 Cliente: cliente@ejemplo.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });