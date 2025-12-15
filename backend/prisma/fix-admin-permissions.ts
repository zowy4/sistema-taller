import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function fixAdminPermissions() {
  console.log('?? Verificando permisos del admin...');
  const adminRole = await prisma.roles.findFirst({
    where: { nombre: 'admin' }
  });
  if (!adminRole) {
    console.error('? Rol admin no encontrado');
    return;
  }
  const repuestosPermisos = await prisma.permisos.findMany({
    where: {
      nombre: {
        startsWith: 'repuestos:'
      }
    }
  });
  console.log(`?? Permisos de repuestos encontrados: ${repuestosPermisos.length}`);
  const existingPermissions = await prisma.rol_Permiso.findMany({
    where: {
      id_rol: adminRole.id_rol,
      id_permiso: {
        in: repuestosPermisos.map(p => p.id_permiso)
      }
    }
  });
  console.log(`? Permisos ya asignados al admin: ${existingPermissions.length}`);
  let added = 0;
  for (const permiso of repuestosPermisos) {
    const exists = existingPermissions.find(ep => ep.id_permiso === permiso.id_permiso);
    if (!exists) {
      await prisma.rol_Permiso.create({
        data: {
          id_rol: adminRole.id_rol,
          id_permiso: permiso.id_permiso
        }
      });
      console.log(`? Agregado: ${permiso.nombre}`);
      added++;
    }
  }
  if (added === 0) {
    console.log('? El admin ya tiene todos los permisos de repuestos');
  } else {
    console.log(`? Se agregaron ${added} permisos al admin`);
  }
  const allAdminPermissions = await prisma.rol_Permiso.findMany({
    where: { id_rol: adminRole.id_rol },
    include: { permiso: true }
  });
  console.log(`\n?? Total de permisos del admin: ${allAdminPermissions.length}`);
  const repuestosPermisosAdmin = allAdminPermissions.filter(p => 
    p.permiso.nombre.startsWith('repuestos:')
  );
  console.log(`?? Permisos de repuestos del admin:`);
  repuestosPermisosAdmin.forEach(p => {
    console.log(`   - ${p.permiso.nombre}`);
  });
}
fixAdminPermissions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
