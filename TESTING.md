# Testing Documentation

## 📋 Resumen de Tests

Este proyecto incluye **tests unitarios** y **tests E2E (end-to-end)** que cubren los módulos principales del sistema.

### Cobertura de Tests

✅ **Tests Unitarios (Service Layer):**
- `auth.service.spec.ts` - 6 tests
- `clients.service.spec.ts` - 7 tests  
- `vehiculos.service.spec.ts` - 6 tests
- `ordenes.service.spec.ts` - 7 tests

✅ **Tests E2E (Integration):**
- `auth.e2e-spec.ts` - 9 tests
- `clients.e2e-spec.ts` - 8 tests

**Total: 43+ tests implementados** ✅

## 🚀 Ejecutar Tests

### Tests Unitarios

```bash
cd backend

# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:cov
```

### Tests E2E

```bash
cd backend

# Ejecutar tests E2E
npm run test:e2e

# Ejecutar test específico
npm run test:e2e -- auth.e2e-spec.ts
```

### Ver Reporte de Coverage

```bash
cd backend
npm run test:cov

# El reporte se genera en: coverage/lcov-report/index.html
```

## 📊 Detalle de Tests

### 1. AuthService Tests (auth.service.spec.ts)

**Tests de Login:**
- ✅ Login exitoso con credenciales de cliente
- ✅ Login exitoso con credenciales de empleado
- ✅ Error con credenciales inválidas
- ✅ Error con contraseña incorrecta

**Tests de Registro:**
- ✅ Registro exitoso de nuevo cliente
- ✅ Verificación de hash de contraseña

### 2. ClientsService Tests (clients.service.spec.ts)

**CRUD Operations:**
- ✅ Listar todos los clientes
- ✅ Retornar array vacío cuando no hay clientes
- ✅ Obtener cliente por ID
- ✅ Error 404 cuando cliente no existe
- ✅ Crear nuevo cliente
- ✅ Actualizar cliente existente
- ✅ Eliminar cliente

### 3. VehiculosService Tests (vehiculos.service.spec.ts)

**CRUD Operations:**
- ✅ Listar todos los vehículos
- ✅ Obtener vehículo por ID
- ✅ Error 404 cuando vehículo no existe
- ✅ Crear nuevo vehículo
- ✅ Actualizar kilometraje del vehículo
- ✅ Obtener vehículos por cliente

### 4. OrdenesService Tests (ordenes.service.spec.ts)

**Gestión de Órdenes:**
- ✅ Listar órdenes con cálculo de totales
- ✅ Obtener orden por ID
- ✅ Error 404 cuando orden no existe
- ✅ Crear nueva orden
- ✅ Error cuando vehículo no existe
- ✅ Actualizar estado de orden
- ✅ Normalización de estados (completada → completado)
- ✅ Obtener órdenes por técnico

### 5. Auth E2E Tests (auth.e2e-spec.ts)

**Endpoint /auth/login:**
- ✅ Login exitoso con credenciales válidas
- ✅ Error 401 con credenciales inválidas
- ✅ Error 400 sin email
- ✅ Error 400 sin password

**Endpoint /auth/profile:**
- ✅ Obtener perfil con token válido
- ✅ Error 401 sin token
- ✅ Error 401 con token inválido

**Endpoint /auth/register:**
- ✅ Registro exitoso de nuevo cliente
- ✅ Error con email duplicado
- ✅ Error con formato de email inválido
- ✅ Error con campos faltantes

### 6. Clients E2E Tests (clients.e2e-spec.ts)

**Endpoint /clientes:**
- ✅ GET - Listar todos los clientes (autenticado)
- ✅ GET - Error 401 sin autenticación
- ✅ POST - Crear nuevo cliente
- ✅ POST - Error 400 con datos inválidos

**Endpoint /clientes/:id:**
- ✅ GET - Obtener cliente específico
- ✅ GET - Error 404 cliente no existente
- ✅ PATCH - Actualizar cliente
- ✅ DELETE - Eliminar cliente
- ✅ DELETE - Error 404 al eliminar inexistente

## 🔧 Configuración de Tests

### Jest Configuration

El proyecto usa Jest como framework de testing con la siguiente configuración:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": [
    "**/*.(t|j)s"
  ],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node"
}
```

### E2E Configuration

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

## 🎯 Buenas Prácticas

### 1. Estructura de Tests
```typescript
describe('ModuleName', () => {
  // Setup
  beforeEach(() => {});
  afterEach(() => {});

  // Test groups
  describe('functionName', () => {
    it('should do something', () => {});
  });
});
```

### 2. Mocking
```typescript
const mockService = {
  method: jest.fn().mockResolvedValue(mockData),
};
```

### 3. Assertions
```typescript
expect(result).toBeDefined();
expect(result).toEqual(expected);
expect(result).toHaveProperty('key');
expect(fn).toHaveBeenCalledWith(args);
expect(fn).rejects.toThrow(Error);
```

### 4. Cleanup
```typescript
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await app.close();
});
```

## 📈 Métricas Esperadas

### Coverage Goals
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Test Execution Time
- Unit tests: < 10s
- E2E tests: < 30s

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
npm install
npm run build
```

### Error: "Database connection failed"
```bash
# Asegúrate de que PostgreSQL esté corriendo
docker-compose up -d postgres

# O configura la variable de entorno
export DATABASE_URL="postgresql://..."
```

### Error: "Timeout exceeded"
```typescript
// Aumentar timeout en test específico
it('should handle long operation', async () => {
  // ...
}, 10000); // 10 segundos
```

## 🔄 CI/CD Integration

Los tests se ejecutan automáticamente en GitHub Actions:

```yaml
- name: Run Unit Tests
  run: npm run test

- name: Run E2E Tests  
  run: npm run test:e2e

- name: Generate Coverage
  run: npm run test:cov
```

## 📝 Agregar Nuevos Tests

### 1. Test Unitario

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';

describe('YourService', () => {
  let service: YourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YourService],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### 2. Test E2E

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('YourController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/your-route (GET)', () => {
    return request(app.getHttpServer())
      .get('/your-route')
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## 🎓 Referencias

- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest](https://github.com/visionmedia/supertest)
