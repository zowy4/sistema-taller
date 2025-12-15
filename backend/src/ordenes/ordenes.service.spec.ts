import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesService } from './ordenes.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('OrdenesService', () => {
  let service: OrdenesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    ordenesDeTrabajo: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ordenes_Servicios: {
      create: jest.fn(),
    },
    ordenes_Repuestos: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    servicios: {
      findUnique: jest.fn(),
    },
    repuestos: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdenesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdenesService>(OrdenesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all orders with calculated totals', async () => {
      const mockOrders = [
        {
          id_orden: 1,
          id_vehiculo: 1,
          estado: 'pendiente',
          descripcion_problema: 'Cambio de aceite',
          total_estimado: 5000,
          total_real: null,
          fecha_ingreso: new Date(),
          fecha_estimada: new Date(),
          fecha_entrega: null,
          id_tecnico: 1,
          observaciones: null,
        },
        {
          id_orden: 2,
          id_vehiculo: 2,
          estado: 'completado',
          descripcion_problema: 'Reparación de frenos',
          total_estimado: 8000,
          total_real: 7500,
          fecha_ingreso: new Date(),
          fecha_estimada: new Date(),
          fecha_entrega: new Date(),
          id_tecnico: 2,
          observaciones: 'Completado sin problemas',
        },
      ];

      mockPrismaService.ordenesDeTrabajo.findMany.mockResolvedValue(mockOrders);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].total).toBe(5000); // usa total_estimado
      expect(result[1].total).toBe(7500); // usa total_real
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const mockOrder = {
        id_orden: 1,
        id_vehiculo: 1,
        estado: 'en_proceso',
        descripcion_problema: 'Cambio de aceite',
        total_estimado: 5000,
        total_real: null,
        fecha_ingreso: new Date(),
        fecha_estimada: new Date(),
        fecha_entrega: null,
        id_tecnico: 1,
        observaciones: null,
      };

      mockPrismaService.ordenesDeTrabajo.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne(1);

      expect(result).toEqual(mockOrder);
      expect(result.estado).toBe('en_proceso');
    });

    it('should throw NotFoundException when order does not exist', async () => {
      mockPrismaService.ordenesDeTrabajo.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new order with services and repuestos', async () => {
      const createDto = {
        id_vehiculo: 1,
        descripcion_problema: 'Revisión general',
        servicios: [{ id_servicio: 1, cantidad: 1 }],
        repuestos: [{ id_repuesto: 1, cantidad: 2 }],
      };

      const mockServicio = { id_servicio: 1, precio: 5000 };
      const mockRepuesto = { id_repuesto: 1, precio_venta: 2000 };

      mockPrismaService.servicios.findUnique.mockResolvedValue(mockServicio);
      mockPrismaService.repuestos.findUnique.mockResolvedValue(mockRepuesto);

      const mockCreatedOrder = {
        id_orden: 1,
        id_vehiculo: 1,
        estado: 'pendiente',
        descripcion_problema: 'Revisión general',
        total_estimado: 9000,
        fecha_ingreso: new Date(),
      };

      mockPrismaService.ordenesDeTrabajo.create.mockResolvedValue(mockCreatedOrder);

      const result = await service.create(createDto as any);

      expect(result).toBeDefined();
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const updateDto = {
        descripcion_problema: 'Updated description',
      };

      const mockUpdatedOrder = {
        id_orden: 1,
        descripcion_problema: 'Updated description',
        estado: 'pendiente',
      };

      mockPrismaService.ordenesDeTrabajo.update.mockResolvedValue(mockUpdatedOrder);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(mockUpdatedOrder);
      expect(result.descripcion_problema).toBe('Updated description');
    });
  });

  describe('remove', () => {
    it('should delete an order', async () => {
      const mockOrder = {
        id_orden: 1,
        estado: 'pendiente',
      };

      mockPrismaService.ordenesDeTrabajo.delete.mockResolvedValue(mockOrder);

      const result = await service.remove(1);

      expect(result).toEqual(mockOrder);
      expect(prismaService.ordenesDeTrabajo.delete).toHaveBeenCalled();
    });
  });
});
