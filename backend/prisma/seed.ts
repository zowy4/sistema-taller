import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt'; // Importamos bcrypt

const prisma = new PrismaClient();

// Hashear la contraseña de prueba
async function hashPassword(password: string) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log(`Start seeding ...`);

  // --- Limpieza (en orden inverso de dependencias) ---
  // Borrar tablas que tienen relaciones foráneas primero
  console.log('Deleting previous data...');
  await prisma.historial_Vehiculo.deleteMany();
  await prisma.facturas.deleteMany();
  await prisma.ordenes_Servicios.deleteMany();
  await prisma.ordenes_Repuestos.deleteMany();
  await prisma.ordenesDeTrabajo.deleteMany(); // Corregido: camelCase
  await prisma.vehiculos.deleteMany();
  await prisma.clientes.deleteMany();
  await prisma.servicios.deleteMany();
  await prisma.repuestos.deleteMany();
  await prisma.empleados.deleteMany(); // Empleados al final de las entidades principales

  // --- Creación de Empleados (con contraseñas hasheadas) ---
  console.log('Creating employees...');
  const passwordDePrueba = 'password123';
  const hashedPassword = await hashPassword(passwordDePrueba); // Hasheamos la contraseña

  const roberto = await prisma.empleados.create({
    data: {
      nombre: 'Roberto',
      apellido: 'Administrador',
      // --- CAMPOS NUEVOS AÑADIDOS ---
      email: 'admin@taller.com',
      password: hashedPassword,
      // ----------------------------
      rol: 'administracion',
      activo: true,
    },
  });
  console.log('Created employee Roberto');

  const lucia = await prisma.empleados.create({
    data: {
      nombre: 'Lucía',
      apellido: 'Mecánica',
      // --- CAMPOS NUEVOS AÑADIDOS ---
      email: 'lucia@taller.com',
      password: hashedPassword,
      // ----------------------------
      rol: 'tecnico',
      activo: true,
    },
  });
  console.log('Created employee Lucia');

  // --- Creación de Clientes ---
  console.log('Creating clients...');
  const ana = await prisma.clientes.create({
    data: {
      nombre: 'Ana',
      apellido: 'García',
      telefono: '5511223344',
      email: 'ana.garcia@email.com',
      direccion: 'Calle Sol 123',
    },
  });
  console.log('Created client Ana');

  const carlos = await prisma.clientes.create({
    data: {
      nombre: 'Carlos',
      apellido: 'Sanchez',
      telefono: '5588776655',
      email: 'carlos.sanchez@email.com',
      direccion: 'Avenida Luna 456',
    },
  });
  console.log('Created client Carlos');

  // --- Creación de Vehículos ---
  console.log('Creating vehicles...');
  const tsuru = await prisma.vehiculos.create({
    data: {
      id_cliente: ana.id_cliente, // Relacionado con Ana
      placa: 'A1B-2C3',
      vin: 'VIN-TSURU-123456',
      marca: 'Nissan',
      modelo: 'Tsuru',
      anio: 2017,
    },
  });
  console.log('Created vehicle Tsuru');

  const versa = await prisma.vehiculos.create({
    data: {
      id_cliente: carlos.id_cliente, // Relacionado con Carlos
      placa: 'X4Y-5Z6',
      vin: 'VIN-VERSA-789012',
      marca: 'Nissan',
      modelo: 'Versa',
      anio: 2022,
    },
  });
  console.log('Created vehicle Versa');

  // --- Creación de Repuestos (Inventario) ---
  console.log('Creating parts inventory...');
  const filtroAceite = await prisma.repuestos.create({
    data: {
      nombre: 'Filtro de Aceite',
      descripcion: 'Filtro de aceite estándar para Nissan',
      unidad_medida: 'pieza',
      cantidad_existente: 50,
      precio_unitario: 150.0,
      nivel_minimo_alerta: 10,
    },
  });

  const balatas = await prisma.repuestos.create({
    data: {
      nombre: 'Juego de Balatas Delanteras',
      descripcion: 'Balatas de cerámica para Tsuru/Versa',
      unidad_medida: 'juego',
      cantidad_existente: 30,
      precio_unitario: 750.0,
      nivel_minimo_alerta: 5,
    },
  });

  const aceite = await prisma.repuestos.create({
    data: {
      nombre: 'Aceite Sintético 5W-30',
      descripcion: 'Garrafa de 5 litros',
      unidad_medida: 'litro',
      cantidad_existente: 100,
      precio_unitario: 180.0,
      nivel_minimo_alerta: 20,
    },
  });
  console.log('Created parts (3)');

  // --- Creación de Servicios (Catálogo) ---
  console.log('Creating services catalog...');
  const cambioAceite = await prisma.servicios.create({
    data: {
      nombre: 'Cambio de Aceite y Filtro',
      descripcion: 'Incluye hasta 5L de aceite y filtro estándar.',
      precio_estandar: 500.0,
      activo: true,
    },
  });

  const frenosDelanteros = await prisma.servicios.create({
    data: {
      nombre: 'Servicio de Frenos Delanteros',
      descripcion: 'Incluye cambio de balatas y rectificación de discos.',
      precio_estandar: 900.0,
      activo: true,
    },
  });
  console.log('Created services (2)');

  // --- Creación de Órdenes de Trabajo ---
  console.log('Creating work orders...');
  const orden1 = await prisma.ordenesDeTrabajo.create({
    // Corregido: camelCase
    data: {
      id_cliente: ana.id_cliente,
      id_vehiculo: tsuru.id_vehiculo,
      id_empleado_responsable: lucia.id_empleado, // Asignada a Lucía
      fecha_entrega_estimada: new Date(Date.now() + 24 * 60 * 60 * 1000), // mañana
      estado: 'en_proceso',
      total_estimado: 2530.0,
    },
  });
  console.log('Created work order 1');

  // --- Llenar Órdenes: Servicios y Repuestos ---
  console.log('Adding services and parts to work order...');
  // 1. Añadir servicio de cambio de aceite
  await prisma.ordenes_Servicios.create({
    data: {
      id_orden: orden1.id_orden,
      id_servicio: cambioAceite.id_servicio,
      cantidad: 1,
      precio_unitario: 500.0,
      subtotal: 500.0,
    },
  });

  // 2. Añadir servicio de frenos
  await prisma.ordenes_Servicios.create({
    data: {
      id_orden: orden1.id_orden,
      id_servicio: frenosDelanteros.id_servicio,
      cantidad: 1,
      precio_unitario: 900.0,
      subtotal: 900.0,
    },
  });

  // 3. Añadir repuesto: filtro de aceite
  await prisma.ordenes_Repuestos.create({
    data: {
      id_orden: orden1.id_orden,
      id_repuesto: filtroAceite.id_repuesto,
      cantidad: 1,
      precio_unitario: 150.0,
      subtotal: 150.0,
    },
  });

  // 4. Añadir repuesto: 4 litros de aceite
  await prisma.ordenes_Repuestos.create({
    data: {
      id_orden: orden1.id_orden,
      id_repuesto: aceite.id_repuesto,
      cantidad: 4,
      precio_unitario: 180.0,
      subtotal: 720.0,
    },
  });

  // 5. Añadir repuesto: balatas
  await prisma.ordenes_Repuestos.create({
    data: {
      id_orden: orden1.id_orden,
      id_repuesto: balatas.id_repuesto,
      cantidad: 1,
      precio_unitario: 750.0,
      subtotal: 750.0,
    },
  });

  // --- Creación de Factura (simulada) ---
  console.log('Creating invoice...');
  await prisma.facturas.create({
    data: {
      id_orden: orden1.id_orden,
      monto: 3020.0, // 500+900+150+720+750
      estado_pago: 'pendiente',
      metodo_pago: 'efectivo',
    },
  });

  // --- Creación de Historial ---
  console.log('Creating vehicle history...');
  await prisma.historial_Vehiculo.create({
    data: {
      id_vehiculo: tsuru.id_vehiculo,
      id_orden: orden1.id_orden,
      fecha: new Date(), // fecha actual para el registro histórico
      kilometraje: 105000, // Corregido: es un número
      notas: 'Cambio de aceite y frenos. Cliente reporta ruido al frenar.',
    },
  });

  console.log(`Seeding finished.`);
  console.log('--- Resumen de Creación ---');
  console.log(`Clientes creados: 2`);
  console.log(`Empleados creados: 2 (admin@taller.com, lucia@taller.com)`);
  console.log(`Vehículos creados: 2`);
  console.log(`Repuestos creados: 3`);
  console.log(`Servicios creados: 2`);
  console.log(`Órdenes de Trabajo creadas: 1`);
  console.log('-----------------------------');
}

main()
  .catch(async (e) => {
    // Asegurarse de que el catch sea async
    console.error('An error occurred during seeding:');
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
