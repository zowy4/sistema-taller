import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthorizationService } from './authorization.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    clientes: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    empleados: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
  };

  const mockAuthorizationService = {
    getUserPermissions: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuthorizationService,
          useValue: mockAuthorizationService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUserByEmail', () => {
    it('should return user data for valid cliente credentials', async () => {
      const mockCliente = {
        id_cliente: 1,
        email: 'cliente@test.com',
        password: await bcrypt.hash('password123', 10),
        nombre: 'Test',
        apellido: 'Cliente',
      };

      mockPrismaService.empleados.findUnique.mockResolvedValue(null);
      mockPrismaService.clientes.findUnique.mockResolvedValue(mockCliente);

      const result = await service.validateUserByEmail('cliente@test.com', 'password123');

      expect(result).toHaveProperty('email', 'cliente@test.com');
      expect(result).toHaveProperty('_type', 'cliente');
      expect(result).not.toHaveProperty('password');
    });

    it('should return user data for valid empleado credentials', async () => {
      const mockEmpleado = {
        id_empleado: 1,
        email: 'empleado@test.com',
        password: await bcrypt.hash('password123', 10),
        nombre: 'Test',
        apellido: 'Empleado',
        rol: 'admin',
      };

      mockPrismaService.empleados.findUnique.mockResolvedValue(mockEmpleado);

      const result = await service.validateUserByEmail('empleado@test.com', 'password123');

      expect(result).toHaveProperty('email', 'empleado@test.com');
      expect(result).toHaveProperty('_type', 'empleado');
      expect(result).not.toHaveProperty('password');
    });

    it('should return null for invalid credentials', async () => {
      mockPrismaService.empleados.findUnique.mockResolvedValue(null);
      mockPrismaService.clientes.findUnique.mockResolvedValue(null);

      const result = await service.validateUserByEmail('invalid@test.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null for wrong password', async () => {
      const mockCliente = {
        id_cliente: 1,
        email: 'cliente@test.com',
        password: await bcrypt.hash('correctpassword', 10),
        nombre: 'Test',
        apellido: 'Cliente',
      };

      mockPrismaService.empleados.findUnique.mockResolvedValue(null);
      mockPrismaService.clientes.findUnique.mockResolvedValue(mockCliente);

      const result = await service.validateUserByEmail('cliente@test.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token', async () => {
      const payload = {
        id: 1,
        email: 'test@test.com',
        rol: 'admin',
        permissions: ['read', 'write'],
      };

      const result = await service.generateToken(payload);

      expect(result).toBeDefined();
      expect(result).toEqual({ access_token: 'mock-jwt-token' });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: payload.id,
        email: payload.email,
        rol: payload.rol,
        permissions: payload.permissions,
        id_cliente: undefined,
        id_empleado: undefined,
      });
    });
  });
});
