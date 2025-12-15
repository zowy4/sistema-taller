import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Clients E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let createdClientId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login to get auth token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@taller.com',
        password: 'admin123',
      });

    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    // Clean up created client if exists
    if (createdClientId) {
      await request(app.getHttpServer())
        .delete(`/clientes/${createdClientId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
    await app.close();
  });

  describe('/clientes (GET)', () => {
    it('should get all clients with authentication', () => {
      return request(app.getHttpServer())
        .get('/clientes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/clientes')
        .expect(401);
    });
  });

  describe('/clientes (POST)', () => {
    it('should create a new client', () => {
      return request(app.getHttpServer())
        .post('/clientes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'E2E Test',
          apellido: 'Client',
          email: `e2e-${Date.now()}@test.com`,
          telefono: '1234567890',
          direccion: 'Test Address',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id_cliente');
          expect(res.body.nombre).toBe('E2E Test');
          createdClientId = res.body.id_cliente;
        });
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/clientes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Test',
          // Missing required fields
        })
        .expect(400);
    });
  });

  describe('/clientes/:id (GET)', () => {
    it('should get a specific client', async () => {
      return request(app.getHttpServer())
        .get(`/clientes/${createdClientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id_cliente', createdClientId);
          expect(res.body).toHaveProperty('nombre');
        });
    });

    it('should return 404 for non-existent client', () => {
      return request(app.getHttpServer())
        .get('/clientes/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/clientes/:id (PATCH)', () => {
    it('should update a client', () => {
      return request(app.getHttpServer())
        .patch(`/clientes/${createdClientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          telefono: '9876543210',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.telefono).toBe('9876543210');
        });
    });
  });

  describe('/clientes/:id (DELETE)', () => {
    it('should delete a client', () => {
      return request(app.getHttpServer())
        .delete(`/clientes/${createdClientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should return 404 when deleting non-existent client', () => {
      return request(app.getHttpServer())
        .delete('/clientes/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
