import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@taller.com',
          password: 'admin123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
          authToken = res.body.access_token;
        });
    });

    it('should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid@test.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with missing email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'password123',
        })
        .expect(400);
    });

    it('should fail with missing password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@test.com',
        })
        .expect(400);
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should get user profile with valid token', async () => {
      // First login to get token
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@taller.com',
          password: 'admin123',
        });

      const token = loginRes.body.access_token;

      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('rol');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/register (POST)', () => {
    const uniqueEmail = `test-${Date.now()}@test.com`;

    it('should register a new client', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail,
          password: 'password123',
          nombre: 'Test',
          apellido: 'User',
          telefono: '1234567890',
          direccion: 'Test Address',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id_cliente');
          expect(res.body).toHaveProperty('email', uniqueEmail);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should fail with duplicate email', async () => {
      // Register first time
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `duplicate-${Date.now()}@test.com`,
          password: 'password123',
          nombre: 'Test',
          apellido: 'User',
          telefono: '1234567890',
          direccion: 'Test Address',
        });

      // Try to register again with same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `duplicate-${Date.now()}@test.com`,
          password: 'password123',
          nombre: 'Test',
          apellido: 'User',
          telefono: '1234567890',
          direccion: 'Test Address',
        })
        .expect(400);
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          nombre: 'Test',
          apellido: 'User',
          telefono: '1234567890',
          direccion: 'Test Address',
        })
        .expect(400);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          // Missing password, nombre, etc.
        })
        .expect(400);
    });
  });
});
