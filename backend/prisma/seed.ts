import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear o actualizar roles (upsert) — idempotente
  const roleNames = ['admin', 'supervisor', 'tecnico', 'recepcion'];
  const roleDatas: Record<string, any> = {
    admin: { descripcion: 'Administrador del sistema con acceso completo', activo: true },
    supervisor: { descripcion: 'Supervisor con acceso a gestión y reportes', activo: true },
    tecnico: { descripcion: 'Técnico con acceso limitado a órdenes de trabajo', activo: true },
    recepcion: { descripcion: 'Recepción con acceso a clientes y órdenes', activo: true },
  };

  const roles = [] as any[];
  for (const nombre of roleNames) {
    const r = await prisma.roles.upsert({
      where: { nombre },
      update: { ...roleDatas[nombre] },
      create: { nombre, ...roleDatas[nombre] },
    });
    roles.push(r);
  }

  console.log('✅ Roles creados/actualizados:', roles.map(r => r.nombre));

  // Crear permisos
  // Permisos: definimos un array y hacemos upsert (idempotente)
  const permisoDefs = [
    // clientes
    { nombre: 'clientes:create', descripcion: 'Crear nuevos clientes', modulo: 'clientes', accion: 'create' },
    { nombre: 'clientes:read', descripcion: 'Ver información de clientes', modulo: 'clientes', accion: 'read' },
    { nombre: 'clientes:update', descripcion: 'Actualizar información de clientes', modulo: 'clientes', accion: 'update' },
    { nombre: 'clientes:delete', descripcion: 'Eliminar clientes', modulo: 'clientes', accion: 'delete' },
    // vehiculos
    { nombre: 'vehiculos:create', descripcion: 'Crear nuevos vehículos', modulo: 'vehiculos', accion: 'create' },
    { nombre: 'vehiculos:read', descripcion: 'Ver información de vehículos', modulo: 'vehiculos', accion: 'read' },
    { nombre: 'vehiculos:update', descripcion: 'Actualizar información de vehículos', modulo: 'vehiculos', accion: 'update' },
    { nombre: 'vehiculos:delete', descripcion: 'Eliminar vehículos', modulo: 'vehiculos', accion: 'delete' },
    // ordenes
    { nombre: 'ordenes:create', descripcion: 'Crear nuevas órdenes de trabajo', modulo: 'ordenes', accion: 'create' },
    { nombre: 'ordenes:read', descripcion: 'Ver órdenes de trabajo', modulo: 'ordenes', accion: 'read' },
    { nombre: 'ordenes:update', descripcion: 'Actualizar órdenes de trabajo', modulo: 'ordenes', accion: 'update' },
    { nombre: 'ordenes:delete', descripcion: 'Eliminar órdenes de trabajo', modulo: 'ordenes', accion: 'delete' },
    // facturas
    { nombre: 'facturas:create', descripcion: 'Crear facturas', modulo: 'facturas', accion: 'create' },
    { nombre: 'facturas:read', descripcion: 'Ver facturas', modulo: 'facturas', accion: 'read' },
    { nombre: 'facturas:update', descripcion: 'Actualizar facturas', modulo: 'facturas', accion: 'update' },
    { nombre: 'facturas:delete', descripcion: 'Eliminar facturas', modulo: 'facturas', accion: 'delete' },
    // empleados
    { nombre: 'empleados:create', descripcion: 'Crear nuevos empleados', modulo: 'empleados', accion: 'create' },
    { nombre: 'empleados:read', descripcion: 'Ver información de empleados', modulo: 'empleados', accion: 'read' },
    { nombre: 'empleados:update', descripcion: 'Actualizar información de empleados', modulo: 'empleados', accion: 'update' },
    { nombre: 'empleados:delete', descripcion: 'Eliminar empleados', modulo: 'empleados', accion: 'delete' },
    // reportes
    { nombre: 'reportes:read', descripcion: 'Ver reportes y estadísticas', modulo: 'reportes', accion: 'read' },
    // configuracion
    { nombre: 'configuracion:update', descripcion: 'Modificar configuración del sistema', modulo: 'configuracion', accion: 'update' },
  ];

  const permisos = [] as any[];
  for (const p of permisoDefs) {
    const up = await prisma.permisos.upsert({
      where: { nombre: p.nombre },
      update: { descripcion: p.descripcion, modulo: p.modulo, accion: p.accion },
      create: p,
    });
    permisos.push(up);
  }

  console.log('✅ Permisos creados/actualizados:', permisos.length);

  // Asignar permisos a roles
  const adminRole = roles.find(r => r.nombre === 'admin');
  const supervisorRole = roles.find(r => r.nombre === 'supervisor');
  const tecnicoRole = roles.find(r => r.nombre === 'tecnico');
  const recepcionRole = roles.find(r => r.nombre === 'recepcion');

  // Asignar permisos a roles (idempotente). Construimos arrays para insertarlos en bloque y usamos skipDuplicates
  const rolPermisosData: Array<{ id_rol: number; id_permiso: number }> = [];

  // Admin: todos los permisos
  for (const permiso of permisos) {
    rolPermisosData.push({ id_rol: adminRole!.id_rol, id_permiso: permiso.id_permiso });
  }

  // Supervisor: permisos de gestión (sin eliminar empleados ni configuracion)
  const supervisorPermissions = permisos.filter(p => !p.nombre.includes('empleados:delete') && !p.nombre.includes('configuracion:update'));
  for (const permiso of supervisorPermissions) {
    rolPermisosData.push({ id_rol: supervisorRole!.id_rol, id_permiso: permiso.id_permiso });
  }

  // Técnico: solo lectura y actualización de órdenes y lectura de clientes/vehículos/facturas
  const tecnicoPermissions = permisos.filter(p => p.nombre.includes('ordenes:read') || p.nombre.includes('ordenes:update') || p.nombre.includes('clientes:read') || p.nombre.includes('vehiculos:read') || p.nombre.includes('facturas:read'));
  for (const permiso of tecnicoPermissions) {
    rolPermisosData.push({ id_rol: tecnicoRole!.id_rol, id_permiso: permiso.id_permiso });
  }

  // Recepción
  const recepcionPermissions = permisos.filter(p => p.nombre.includes('clientes:') || p.nombre.includes('vehiculos:') || p.nombre.includes('ordenes:') || p.nombre.includes('facturas:create') || p.nombre.includes('facturas:read'));
  for (const permiso of recepcionPermissions) {
    rolPermisosData.push({ id_rol: recepcionRole!.id_rol, id_permiso: permiso.id_permiso });
  }

  // Insertar en bloque evitando duplicados (si la BD soporta skipDuplicates)
  if (rolPermisosData.length > 0) {
    // createMany con skipDuplicates para que sea seguro ejecutar varias veces
    await prisma.rol_Permiso.createMany({ data: rolPermisosData, skipDuplicates: true });
  }

  console.log('✅ Permisos asignados a roles (idempotente)');

  // Crear empleados de ejemplo
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Empleados: upsert por email
  const empleadosData = [
    { nombre: 'Admin', apellido: 'Sistema', email: 'admin@taller.com', password: hashedPassword, rol: 'admin', activo: true },
    { nombre: 'Juan', apellido: 'Supervisor', email: 'supervisor@taller.com', password: hashedPassword, rol: 'supervisor', activo: true },
    { nombre: 'Carlos', apellido: 'Técnico', email: 'tecnico@taller.com', password: hashedPassword, rol: 'tecnico', activo: true },
    { nombre: 'María', apellido: 'Recepción', email: 'recepcion@taller.com', password: hashedPassword, rol: 'recepcion', activo: true },
  ];

  const empleados = [] as any[];
  for (const e of empleadosData) {
    const up = await prisma.empleados.upsert({
      where: { email: e.email },
      update: { nombre: e.nombre, apellido: e.apellido, password: e.password, rol: e.rol, activo: e.activo },
      create: e,
    });
    empleados.push(up);
  }

  console.log('✅ Empleados creados/actualizados:', empleados.map(e => `${e.nombre} ${e.apellido} (${e.email})`));

  // Crear cliente de ejemplo
  const clienteData = {
    nombre: 'Cliente',
    apellido: 'Ejemplo',
    email: 'cliente@ejemplo.com',
    password: hashedPassword,
    telefono: '123456789',
    direccion: 'Calle Ejemplo 123',
    empresa: 'Empresa Ejemplo',
  };

  const cliente = await prisma.clientes.upsert({
    where: { email: clienteData.email },
    update: { ...clienteData },
    create: clienteData,
  });

  console.log('✅ Cliente creado/actualizado:', `${cliente.nombre} ${cliente.apellido} (${cliente.email})`);

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