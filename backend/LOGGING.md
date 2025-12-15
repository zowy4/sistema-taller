# Sistema de Logs Profesionales

## 📋 Descripción

El sistema utiliza **Winston** como biblioteca de logging profesional, integrado con NestJS a través de `nest-winston`. Proporciona logging estructurado, rotación automática de archivos, y diferentes niveles de log.

## 🎯 Características

- ✅ **Múltiples niveles de log**: error, warn, info, http, debug, verbose
- ✅ **Rotación automática de archivos** con `winston-daily-rotate-file`
- ✅ **Logs estructurados** en formato JSON para producción
- ✅ **Logs con colores** para desarrollo
- ✅ **Separación de logs** por tipo (errores, acceso HTTP, general)
- ✅ **Compresión automática** de logs antiguos
- ✅ **Retención configurable** (7-30 días según tipo)
- ✅ **Middleware de logging** para todas las peticiones HTTP
- ✅ **Filtro global de excepciones** con logging automático

## 📁 Estructura de Archivos de Log

```
logs/
├── error-2025-12-12.log        # Solo errores (30 días)
├── combined-2025-12-12.log     # Todos los niveles (14 días)
├── access-2025-12-12.log       # Peticiones HTTP (7 días)
├── exceptions.log              # Excepciones no capturadas
└── rejections.log              # Promise rejections no manejados
```

## 🔧 Configuración

### Niveles de Log

```typescript
// Desarrollo
level: 'debug' // Muestra todos los logs

// Producción
level: 'info' // Solo info, warn, error
```

### Variables de Entorno

```bash
# .env
NODE_ENV=development  # 'development' o 'production'
PORT=3002
```

## 💻 Uso del Logger

### 1. Inyectar el Logger

```typescript
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class MiServicio {
  constructor(private readonly logger: LoggerService) {}
}
```

### 2. Métodos Básicos

```typescript
// Log informativo
this.logger.log('Operación completada exitosamente', 'MiServicio');

// Error
this.logger.error('Error al procesar solicitud', error.stack, 'MiServicio');

// Advertencia
this.logger.warn('Recurso casi agotado', 'MiServicio');

// Debug (solo en desarrollo)
this.logger.debug('Estado interno: ' + JSON.stringify(state), 'MiServicio');

// Verbose
this.logger.verbose('Detalles adicionales', 'MiServicio');
```

### 3. Métodos Especializados

```typescript
// Log de peticiones HTTP (automático via middleware)
this.logger.logRequest(req, res, responseTime);

// Log de errores con stack trace
this.logger.logError(error, 'ContextoDelError');

// Log de queries de base de datos
this.logger.logDatabaseQuery('SELECT * FROM users', 45);

// Log de autenticación
this.logger.logAuthentication(userId, 'Login', true);
```

## 🎨 Formato de Logs

### Desarrollo (Console)

```
[Nest] 12345  - 12/12/2025, 10:30:45     LOG [TallerApp] Creating NestJS application...
[Nest] 12345  - 12/12/2025, 10:30:46    INFO [AuthService] User logged in successfully
[Nest] 12345  - 12/12/2025, 10:30:47   ERROR [OrdersService] Failed to create order
```

### Producción (JSON)

```json
{
  "level": "info",
  "message": "User logged in successfully",
  "context": "AuthService",
  "timestamp": "2025-12-12 10:30:46"
}
```

## 📊 Ejemplos de Uso en Servicios

### AuthService

```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly logger: LoggerService,
  ) {}

  async login(email: string, password: string) {
    this.logger.debug(`Login attempt for: ${email}`, 'AuthService');
    
    try {
      const user = await this.validateUser(email, password);
      
      if (user) {
        this.logger.logAuthentication(user.id, 'Login', true);
        this.logger.log(`User ${email} logged in successfully`, 'AuthService');
        return this.generateToken(user);
      } else {
        this.logger.warn(`Failed login attempt for: ${email}`, 'AuthService');
        this.logger.logAuthentication(0, 'Login', false);
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (error) {
      this.logger.logError(error, 'AuthService.login');
      throw error;
    }
  }
}
```

### OrdersService

```typescript
@Injectable()
export class OrdersService {
  constructor(
    private readonly logger: LoggerService,
  ) {}

  async create(data: CreateOrderDto) {
    this.logger.log(`Creating new order for client ${data.clientId}`, 'OrdersService');
    
    try {
      const order = await this.prisma.orders.create({ data });
      this.logger.log(`Order ${order.id} created successfully`, 'OrdersService');
      return order;
    } catch (error) {
      this.logger.error(
        `Failed to create order: ${error.message}`,
        error.stack,
        'OrdersService'
      );
      throw error;
    }
  }
}
```

## 🔍 Middleware de Logging

El middleware `LoggerMiddleware` registra automáticamente:

- Método HTTP (GET, POST, etc.)
- URL de la petición
- Código de estado de respuesta
- Tiempo de respuesta en ms
- IP del cliente
- User-Agent

```
HTTP Request {
  method: 'POST',
  url: '/api/orders',
  statusCode: 201,
  responseTime: '145ms',
  ip: '::1',
  userAgent: 'Mozilla/5.0...'
}
```

## 🛡️ Filtro de Excepciones

El `AllExceptionsFilter` captura automáticamente:

- Todas las excepciones HTTP
- Errores internos del servidor
- Errores no manejados

Y registra:

```typescript
{
  statusCode: 500,
  timestamp: '2025-12-12T10:30:45.123Z',
  path: '/api/orders',
  method: 'POST',
  message: 'Internal server error'
}
```

## 🔄 Rotación de Archivos

### Configuración Actual

```typescript
// Error logs
maxFiles: '30d'  // 30 días
maxSize: '20m'   // 20 MB por archivo

// Combined logs
maxFiles: '14d'  // 14 días
maxSize: '20m'

// Access logs
maxFiles: '7d'   // 7 días
maxSize: '20m'

zippedArchive: true  // Comprime archivos antiguos
```

## 📝 Best Practices

### 1. Contexto Claro

```typescript
// ❌ Malo
this.logger.log('User created');

// ✅ Bueno
this.logger.log('User created successfully', 'UserService');
```

### 2. Información Relevante

```typescript
// ❌ Malo
this.logger.error('Error');

// ✅ Bueno
this.logger.error(
  `Failed to update user ${userId}: ${error.message}`,
  error.stack,
  'UserService'
);
```

### 3. Niveles Apropiados

```typescript
// Debug - Información de desarrollo
this.logger.debug(`Processing request with params: ${JSON.stringify(params)}`);

// Info - Eventos importantes del sistema
this.logger.log('Payment processed successfully');

// Warn - Situaciones anormales pero no críticas
this.logger.warn('API rate limit approaching threshold');

// Error - Errores que requieren atención
this.logger.error('Database connection failed', error.stack);
```

### 4. No Loggear Información Sensible

```typescript
// ❌ Malo
this.logger.log(`User password: ${password}`);
this.logger.log(`Credit card: ${creditCard}`);

// ✅ Bueno
this.logger.log(`User authenticated: ${userId}`);
this.logger.log(`Payment processed for order: ${orderId}`);
```

## 🚀 Producción

### Variables de Entorno

```bash
NODE_ENV=production
PORT=3002
```

### Archivos Generados

En producción se generan automáticamente:

1. **error-YYYY-MM-DD.log** - Solo errores
2. **combined-YYYY-MM-DD.log** - Todos los logs
3. **access-YYYY-MM-DD.log** - Peticiones HTTP
4. **exceptions.log** - Excepciones no capturadas
5. **rejections.log** - Promises rechazados

### Limpieza Automática

Los archivos se comprimen (.gz) y eliminan automáticamente según `maxFiles`:

- Errors: 30 días
- Combined: 14 días
- Access: 7 días

## 🔧 Integración con Servicios Externos

### Sentry (Opcional)

Para agregar Sentry:

```bash
npm install @sentry/node
```

```typescript
// logger.service.ts
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
  
  // En método error
  Sentry.captureException(error);
}
```

### Datadog (Opcional)

Para agregar Datadog:

```bash
npm install dd-trace
```

```typescript
// main.ts
import tracer from 'dd-trace';
tracer.init();
```

## 📊 Monitoreo

### Verificar Logs en Tiempo Real

```bash
# Development
npm run start:dev

# Ver logs específicos
tail -f logs/error-2025-12-12.log
tail -f logs/combined-2025-12-12.log
tail -f logs/access-2025-12-12.log
```

### Buscar en Logs

```bash
# Buscar errores específicos
grep "Failed" logs/error-*.log

# Buscar por usuario
grep "userId: 123" logs/combined-*.log

# Contar errores por día
grep -c "level.*error" logs/combined-2025-12-12.log
```

## 🧪 Testing

El logger se puede mockear en tests:

```typescript
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

const module: TestingModule = await Test.createTestingModule({
  providers: [
    MyService,
    { provide: LoggerService, useValue: mockLogger },
  ],
}).compile();
```

## 📦 Archivos Creados

```
src/
├── common/
│   ├── logger/
│   │   ├── logger.service.ts      # Servicio principal de logging
│   │   └── logger.module.ts       # Módulo global de logging
│   ├── middleware/
│   │   └── logger.middleware.ts   # Middleware HTTP logging
│   └── filters/
│       └── http-exception.filter.ts  # Filtro global de errores
├── app.module.ts                  # Importa LoggerModule
└── main.ts                        # Configura logger global
```

## ✅ Checklist de Implementación

- [x] Winston instalado
- [x] LoggerService creado
- [x] LoggerModule global
- [x] Middleware HTTP logging
- [x] Filtro de excepciones
- [x] Rotación de archivos configurada
- [x] Integración en AuthService
- [x] Logs estructurados (JSON)
- [x] Logs con colores (desarrollo)
- [x] Documentación completa

## 🎓 Recursos Adicionales

- [Winston Documentation](https://github.com/winstonjs/winston)
- [nest-winston](https://github.com/gremo/nest-winston)
- [Winston Daily Rotate File](https://github.com/winstonjs/winston-daily-rotate-file)
- [NestJS Logger](https://docs.nestjs.com/techniques/logger)
