import { Test, TestingModule } from '@nestjs/testing';
import { VehiculosService } from './vehiculos.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('VehiculosService', () => {
  let service: VehiculosService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    vehiculos: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiculosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VehiculosService>(VehiculosService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of vehicles', async () => {
      const mockVehicles = [
        {
          id_vehiculo: 1,
          id_cliente: 1,
          marca: 'Toyota',
          modelo: 'Corolla',
          patente: 'ABC123',
          anio: 2020,
          color: 'Blanco',
          kilometraje: 50000,
          foto_url: null,
        },
        {
          id_vehiculo: 2,
          id_cliente: 1,
          marca: 'Honda',
          modelo: 'Civic',
          patente: 'XYZ789',
          anio: 2021,
          color: 'Negro',
          kilometraje: 30000,
          foto_url: null,
        },
      ];

      mockPrismaService.vehiculos.findMany.mockResolvedValue(mockVehicles);

      const result = await service.findAll();

      expect(result).toEqual(mockVehicles);
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return a vehicle by id', async () => {
      const mockVehicle = {
        id_vehiculo: 1,
        id_cliente: 1,
        marca: 'Toyota',
        modelo: 'Corolla',
        patente: 'ABC123',
        anio: 2020,
        color: 'Blanco',
        kilometraje: 50000,
        foto_url: null,
      };

      mockPrismaService.vehiculos.findUnique.mockResolvedValue(mockVehicle);

      const result = await service.findOne(1);

      expect(result).toEqual(mockVehicle);
      expect(result.marca).toBe('Toyota');
      expect(result.modelo).toBe('Corolla');
    });

    it('should throw NotFoundException when vehicle does not exist', async () => {
      mockPrismaService.vehiculos.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new vehicle', async () => {
      const createDto = {
        id_cliente: 1,
        marca: 'Ford',
        modelo: 'Focus',
        patente: 'DEF456',
        anio: 2022,
        color: 'Azul',
        kilometraje: 10000,
      };

      const mockCreatedVehicle = {
        id_vehiculo: 3,
        ...createDto,
        foto_url: null,
      };

      mockPrismaService.vehiculos.create.mockResolvedValue(mockCreatedVehicle);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCreatedVehicle);
      expect(result.marca).toBe('Ford');
      expect(result.patente).toBe('DEF456');
    });
  });

  describe('update', () => {
    it('should update vehicle kilometraje', async () => {
      const updateDto = {
        kilometraje: 55000,
      };

      const mockUpdatedVehicle = {
        id_vehiculo: 1,
        id_cliente: 1,
        marca: 'Toyota',
        modelo: 'Corolla',
        patente: 'ABC123',
        anio: 2020,
        color: 'Blanco',
        kilometraje: 55000,
        foto_url: null,
      };

      mockPrismaService.vehiculos.update.mockResolvedValue(mockUpdatedVehicle);

      const result = await service.update(1, updateDto);

      expect(result.kilometraje).toBe(55000);
    });
  });

  describe('remove', () => {
    it('should delete a vehicle', async () => {
      const mockVehicle = {
        id_vehiculo: 1,
        id_cliente: 1,
        marca: 'Toyota',
        modelo: 'Corolla',
        patente: 'ABC123',
        anio: 2020,
        color: 'Blanco',
        kilometraje: 50000,
        foto_url: null,
      };

      mockPrismaService.vehiculos.delete.mockResolvedValue(mockVehicle);

      const result = await service.remove(1);

      expect(result).toEqual(mockVehicle);
      expect(prismaService.vehiculos.delete).toHaveBeenCalled();
    });
  });
});
