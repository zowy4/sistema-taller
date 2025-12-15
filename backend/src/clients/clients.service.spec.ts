import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ClientsService', () => {
  let service: ClientsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    clientes: {
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
        ClientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of clients', async () => {
      const mockClients = [
        {
          id_cliente: 1,
          nombre: 'John',
          apellido: 'Doe',
          email: 'john@test.com',
          telefono: '1234567890',
          direccion: 'Test St',
          fecha_alta: new Date(),
          empresa: null,
        },
        {
          id_cliente: 2,
          nombre: 'Jane',
          apellido: 'Smith',
          email: 'jane@test.com',
          telefono: '0987654321',
          direccion: 'Another St',
          fecha_alta: new Date(),
          empresa: null,
        },
      ];

      mockPrismaService.clientes.findMany.mockResolvedValue(mockClients);

      const result = await service.getAllClients();

      expect(result).toEqual(mockClients);
      expect(result).toHaveLength(2);
      expect(prismaService.clientes.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no clients exist', async () => {
      mockPrismaService.clientes.findMany.mockResolvedValue([]);

      const result = await service.getAllClients();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      const mockClient = {
        id_cliente: 1,
        nombre: 'John',
        apellido: 'Doe',
        email: 'john@test.com',
        telefono: '1234567890',
        direccion: 'Test St',
        fecha_alta: new Date(),
        empresa: null,
      };

      mockPrismaService.clientes.findUnique.mockResolvedValue(mockClient);

      const result = await service.getClientById(1);

      expect(result).toEqual(mockClient);
      expect(prismaService.clientes.findUnique).toHaveBeenCalledWith({
        where: { id_cliente: 1 },
      });
    });

    it('should throw NotFoundException when client does not exist', async () => {
      mockPrismaService.clientes.findUnique.mockResolvedValue(null);

      await expect(service.getClientById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const createDto = {
        nombre: 'New',
        apellido: 'Client',
        email: 'new@test.com',
        telefono: '1234567890',
        direccion: 'New Address',
      };

      const mockCreatedClient = {
        id_cliente: 3,
        ...createDto,
        fecha_alta: new Date(),
        empresa: null,
      };

      mockPrismaService.clientes.create.mockResolvedValue(mockCreatedClient);

      const result = await service.createClient(createDto);

      expect(result).toEqual(mockCreatedClient);
      expect(prismaService.clientes.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('update', () => {
    it('should update an existing client', async () => {
      const updateDto = {
        nombre: 'Updated',
        telefono: '9999999999',
      };

      const mockUpdatedClient = {
        id_cliente: 1,
        nombre: 'Updated',
        apellido: 'Doe',
        email: 'john@test.com',
        telefono: '9999999999',
        direccion: 'Test St',
        fecha_alta: new Date(),
        empresa: null,
      };

      mockPrismaService.clientes.findUnique.mockResolvedValue(mockUpdatedClient);
      mockPrismaService.clientes.update.mockResolvedValue(mockUpdatedClient);

      const result = await service.updateClient(1, updateDto);

      expect(result).toEqual(mockUpdatedClient);
      expect(result.nombre).toBe('Updated');
      expect(result.telefono).toBe('9999999999');
    });
  });

  describe('remove', () => {
    it('should delete a client', async () => {
      const mockClient = {
        id_cliente: 1,
        nombre: 'John',
        apellido: 'Doe',
        email: 'john@test.com',
        telefono: '1234567890',
        direccion: 'Test St',
        fecha_alta: new Date(),
        empresa: null,
      };

      mockPrismaService.clientes.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.clientes.delete.mockResolvedValue(mockClient);

      const result = await service.deleteClient(1);

      expect(result).toEqual(mockClient);
      expect(prismaService.clientes.delete).toHaveBeenCalledWith({
        where: { id_cliente: 1 },
      });
    });
  });
});
