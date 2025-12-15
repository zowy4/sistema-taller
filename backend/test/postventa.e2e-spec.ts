import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
describe('Post-Venta E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const ts = Date.now();
  const testData = {
    cliente: {
      nombre: 'QA', apellido: 'Flow', email: `qa.flow.${ts}@example.com`, telefono: '000', direccion: 'Test', empresa: null as string | null,
    },
    vehiculo: {
      placa: `QA${ts.toString().slice(-6)}`,
      vin: `VIN${ts}`,
      marca: 'TestMarca', modelo: 'TestModelo', anio: 2020, detalles: 'QA',
    },
    empleado: {
      nombre: 'Tech', apellido: 'Tester', rol: 'tecnico', email: null as string | null, telefono: null as string | null, direccion: null as string | null,
    },
    servicio: {
      nombre: `Revision-${ts}`, descripcion: 'Servicio QA', precio_estandar: 50, activo: true,
    },
    repuesto: {
      nombre: `Filtro-${ts}`, descripcion: 'Repuesto QA', unidad_medida: 'unidad', cantidad_existente: 100, precio_unitario: 10, nivel_minimo_alerta: 5,
    },
  };
  let ids = {
    id_cliente: 0,
    id_vehiculo: 0,
    id_empleado: 0,
    id_servicio: 0,
    id_repuesto: 0,
    id_orden: 0,
    id_factura: 0,
  };
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    const cliente = await prisma.clientes.create({ data: testData.cliente });
    ids.id_cliente = cliente.id_cliente;
    const vehiculo = await prisma.vehiculos.create({ data: { ...testData.vehiculo, id_cliente: cliente.id_cliente } });
    ids.id_vehiculo = vehiculo.id_vehiculo;
    const empleado = await prisma.empleados.create({ data: { ...testData.empleado, activo: true, fecha_ingreso: new Date() } });
    ids.id_empleado = empleado.id_empleado;
    const servicio = await prisma.servicios.create({ data: testData.servicio });
    ids.id_servicio = servicio.id_servicio;
    const repuesto = await prisma.repuestos.create({ data: testData.repuesto });
    ids.id_repuesto = repuesto.id_repuesto;
  });
  afterAll(async () => {
    await app.close();
  });
  it('debe crear una orden con servicios y repuestos', async () => {
    const servicios = [
      { id_servicio: ids.id_servicio, cantidad: 2, precio_unitario: 50 },
    ];
    const repuestos = [
      { id_repuesto: ids.id_repuesto, cantidad: 2, precio_unitario: 10 },
    ];
    const total_estimado = servicios.reduce((s, it) => s + it.cantidad * it.precio_unitario, 0)
      + repuestos.reduce((s, it) => s + it.cantidad * it.precio_unitario, 0);
    const res = await request(app.getHttpServer())
      .post('/ordenes')
      .send({
        id_cliente: ids.id_cliente,
        id_vehiculo: ids.id_vehiculo,
        id_empleado_responsable: ids.id_empleado,
        fecha_entrega_estimada: new Date(Date.now() + 86400000).toISOString(),
        estado: 'pendiente',
        total_estimado,
        servicios,
        repuestos,
      })
      .expect(201);
    expect(res.body.id_orden).toBeDefined();
    ids.id_orden = res.body.id_orden;
  });
  it('debe cambiar estado a en_proceso y luego a completado', async () => {
    await request(app.getHttpServer())
      .patch(`/ordenes/${ids.id_orden}/estado`)
      .send({ estado: 'en_proceso' })
      .expect(200);
    const res2 = await request(app.getHttpServer())
      .patch(`/ordenes/${ids.id_orden}/estado`)
      .send({ estado: 'completado' })
      .expect(200);
    expect(res2.body.estado).toBe('completado');
    expect(typeof res2.body.total_real === 'number').toBe(true);
  });
  it('debe facturar la orden y marcar entregado si hay método de pago', async () => {
    const res = await request(app.getHttpServer())
      .post(`/facturas/facturar/${ids.id_orden}`)
      .send({ metodo_pago: 'efectivo' })
      .expect(201);
    expect(res.body.id_factura).toBeDefined();
    ids.id_factura = res.body.id_factura;
    const res2 = await request(app.getHttpServer())
      .get(`/facturas/orden/${ids.id_orden}`)
      .expect(200);
    expect(res2.body.id_factura).toBe(ids.id_factura);
    const res3 = await request(app.getHttpServer())
      .get(`/ordenes/${ids.id_orden}`)
      .expect(200);
    expect(res3.body.estado).toBe('entregado');
  });
});
