# Pull Request: v2-Auth-Security

## Descripción General
Implementación de prácticas básicas de seguridad, autenticación sólida con JWT y OAuth 2.0 (Google y GitHub) para el sistema de gestión de taller.

## Cambios Realizados

### 1. **Prácticas Básicas de Seguridad**

#### 📦 Sanitización de Cabeceras HTTP
- **Archivo**: `backend/src/main.ts`
- **Cambio**: Integración de `helmet` middleware
- **Por qué**: Protege la aplicación contra vulnerabilidades comunes en cabeceras HTTP:
  - XSS (Cross-Site Scripting)
  - MIME type sniffing
  - Clickjacking (X-Frame-Options)
  - Content Security Policy

```typescript
app.use(helmet());
```

#### ✅ Validación y Sanitización de Payloads
- **Archivo**: `backend/src/main.ts`
- **Cambio**: Mejorado `ValidationPipe` con opciones de seguridad
- **Por qué**: Evita inyección de datos no autorizados:
  - `whitelist: true` - Solo permite campos definidos en DTOs
  - `forbidNonWhitelisted: true` - Rechaza campos desconocidos
  - `transform: true` - Conversión automática de tipos

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

#### 🔒 Mapeo de Salidas (Ocultación de Datos Sensibles)
- **Archivos creados**:
  - `backend/src/clients/dto/cliente-response.dto.ts`
  - `backend/src/empleados/dto/empleado-response.dto.ts`
- **Cambio**: Uso de `@Exclude()` decorator para campos sensibles
- **Por qué**: Garantiza que contraseñas y datos sensibles nunca se envíen en respuestas API

```typescript
export class ClienteResponseDto {
  @Exclude()
  password?: string; // Nunca se incluirá en JSON
}
```

- **Configuración en main.ts**:
```typescript
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
```

#### ⚠️ Manejo Global de Excepciones
- **Archivo creado**: `backend/src/common/filters/all-exceptions.filter.ts`
- **Por qué**: Evita exponer estructura interna de la aplicación en errores
- **Características**:
  - Sanitiza mensajes de error para el cliente
  - Valida errores internos sin exponer detalles técnicos
  - Logs detallados internamente para debugging

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // Respuesta segura al cliente
  response.status(status).json({
    statusCode: status,
    timestamp: new Date().toISOString(),
    path: request.url,
    message: 'Mensaje seguro para el cliente'
  });
}
```

---

### 2. **Autenticación Sólida (JWT + OAuth 2.0)**

#### 🔐 Estrategia OAuth 2.0 - Google
- **Archivo creado**: `backend/src/auth/strategies/google.strategy.ts`
- **Dependencia**: `passport-google-oauth20`
- **Flujo**:
  1. Usuario hace clic en "Login con Google"
  2. Redirige a Google OAuth (`/auth/google`)
  3. Google valida credenciales y redirige de vuelta (`/auth/google/callback`)
  4. Sistema crea/actualiza usuario en BD
  5. Genera JWT y lo guarda en cookie HttpOnly

```typescript
@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthRedirect(@Req() req, @Res() res) {
  const user = await this.authService.findOrCreateOAuthUser(
    req.user.email,
    { firstName: req.user.firstName, /* ... */ }
  );
  const token = await this.authService.generateToken({ /* ... */ });
  
  // Guardar en cookie HttpOnly (seguro contra XSS)
  res.cookie('access_token', token.access_token, {
    httpOnly: true,
    secure: true, // Solo HTTPS en producción
    sameSite: 'lax'
  });
}
```

#### 🔐 Estrategia OAuth 2.0 - GitHub
- **Archivo creado**: `backend/src/auth/strategies/github.strategy.ts`
- **Dependencia**: `passport-github2`
- **Flujo**: Similar a Google, permite login con credenciales GitHub

#### 📋 Integración en AuthController
- **Archivo actualizado**: `backend/src/auth/auth.controller.ts`
- **Nuevos endpoints**:
  - `GET /auth/google` - Inicia flujo Google OAuth
  - `GET /auth/google/callback` - Callback de Google
  - `GET /auth/github` - Inicia flujo GitHub OAuth
  - `GET /auth/github/callback` - Callback de GitHub

#### 🔍 Método `findOrCreateOAuthUser`
- **Archivo actualizado**: `backend/src/auth/auth.service.ts`
- **Funcionalidad**: 
  - Busca usuario existente por email
  - Si no existe, crea uno nuevo automáticamente
  - Devuelve usuario con permisos y JWT

#### ⚙️ Configuración en Auth Module
- **Archivo actualizado**: `backend/src/auth/auth.module.ts`
- **Cambios**:
  - Importa `ConfigModule` para variables de entorno
  - Registra `GoogleStrategy` y `GitHubStrategy`

#### 🔑 Variables de Entorno (OAuth)
- **Archivo actualizado**: `backend/.env.example`
- **Nuevas variables**:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3002/auth/google/callback"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_CALLBACK_URL="http://localhost:3002/auth/github/callback"

# Frontend
FRONTEND_URL="http://localhost:3000"
```

---

## 🎯 Beneficios de Estos Cambios

| Aspecto | Beneficio |
|---------|-----------|
| **Seguridad HTTP** | Protección contra ataques de cabeceras comunes |
| **Validación** | Prevención de inyección de campos no autorizados |
| **Datos Sensibles** | Garantía de que contraseñas nunca se exponen |
| **Manejo de Errores** | Evita filtrar estructura interna en exceptions |
| **Autenticación OAuth** | Usuarios pueden login con Google/GitHub sin contraseña |
| **Sesiones Seguras** | Cookies HttpOnly + SameSite previenen CSRF/XSS |
| **Escalabilidad** | Soporta múltiples métodos de autenticación simultáneamente |

---

## 🧪 Testing Recomendado

### 1. Testear ValidationPipe
```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123","extra_field":"should_be_rejected"}'
# Esperado: 400 Bad Request (forbidNonWhitelisted)
```

### 2. Testear Exclusión de Contraseña
```bash
curl http://localhost:3002/auth/profile \
  -H "Authorization: Bearer <JWT_TOKEN>"
# Esperado: Respuesta NO contiene campo "password"
```

### 3. Testear OAuth Google
```
http://localhost:3002/auth/google
# Debería redirigir a Google signin
```

### 4. Testear Manejo de Errores
```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"invalid":"json"}'
# Esperado: 400 con mensaje sanitizado
```

---

## 📋 Dependencias Agregadas

```json
{
  "helmet": "^7.x",
  "passport-google-oauth20": "^2.x",
  "passport-github2": "^0.x",
  "express-session": "^1.x",
  "@types/passport-google-oauth20": "^2.x",
  "@types/passport-github2": "^1.x",
  "@types/express-session": "^1.x"
}
```

---

## ✅ Checklist para Código Review

- [ ] Todas las contraseñas están excluidas en respuestas
- [ ] ValidationPipe rechaza campos no autorizados
- [ ] ErrorFilter sanitiza mensajes de error
- [ ] OAuth redirects funcionan correctamente
- [ ] Cookies sont HttpOnly en producción
- [ ] Variables de entorno están documentadas
- [ ] Tests unitarios/e2e pasan
- [ ] No hay secretos en el código (todo en .env)

---

## 🚀 Próximos Pasos (Futuro)

1. **Rate Limiting**: Agregar limitación de intentos de login
2. **2FA/MFA**: Autenticación de dos factores
3. **Refresh Tokens**: Tokens de refresco para sesiones largas
4. **Audit Logging**: Log de accesos y cambios de seguridad
5. **RBAC Mejorado**: Sistema de roles y permisos más granular

---

## 📝 Notas para Deployers

- Cambiar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en producción
- Cambiar `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET` en producción
- Asegurar que `FRONTEND_URL` coincida con el dominio del frontend
- En producción, establecer `NODE_ENV=production` para `secure: true` en cookies
- JWT_SECRET debe ser una cadena aleatoria fuerte (min 32 caracteres)

---

## 🔗 Referencias

- [OWASP: Top 10 Web Application Security Risks](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Passport.js Strategies](http://www.passportjs.org/strategies/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
