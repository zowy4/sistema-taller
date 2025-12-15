# GitHub Actions - Workflows

Este proyecto utiliza GitHub Actions para CI/CD automatizado.

## 📋 Workflows Configurados

### 1. CI/CD - Tests & Build (`test.yml`)

**Triggers:**
- Push a `main` o `develop`
- Pull requests a `main` o `develop`

**Jobs:**

#### Backend Tests
- ✅ Instala dependencias
- ✅ Configura PostgreSQL para tests
- ✅ Genera Prisma Client
- ✅ Ejecuta migraciones
- ✅ Corre tests unitarios con coverage
- ✅ Sube coverage a Codecov

#### Frontend Tests
- ✅ Instala dependencias
- ✅ Ejecuta linter
- ✅ Build de Next.js

#### Build Docker
- ✅ Build de imágenes Docker (backend + frontend)
- ✅ Valida docker-compose.yml
- ✅ Solo ejecuta en push (no en PR)

#### Notify
- ✅ Genera resumen de resultados
- ✅ Muestra status de cada job

**Variables de Entorno Necesarias:**

Ninguna (usa valores de test por defecto)

---

### 2. Deploy to VPS (`deploy.yml`)

**Triggers:**
- Push a `main` (automático)
- Manual dispatch (workflow_dispatch)

**Jobs:**

#### Deploy
1. **Setup SSH**: Configura conexión SSH al VPS
2. **Copy Files**: Sincroniza código con rsync
3. **Create .env**: Genera archivos de configuración
4. **Deploy**: Ejecuta docker-compose up en VPS
5. **Migrations**: Aplica migraciones de Prisma
6. **Health Check**: Verifica que servicios respondan
7. **Cleanup**: Limpia recursos Docker antiguos

#### Rollback
- Se ejecuta solo si deploy falla
- Restaura versión anterior desde backup
- Reinicia servicios

**Secrets Requeridos en GitHub:**

```bash
# VPS Access
VPS_HOST=your-vps-ip.com
VPS_USER=your-user
VPS_SSH_PRIVATE_KEY=your-private-key
VPS_URL=https://your-domain.com

# Backend
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-jwt-secret-key

# Frontend
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

---

## 🔧 Configuración de Secrets

### En GitHub:
1. Ve a tu repositorio
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Agrega cada secret:

```yaml
Name: VPS_HOST
Value: 123.456.789.10

Name: VPS_USER
Value: ubuntu

Name: VPS_SSH_PRIVATE_KEY
Value: |
  -----BEGIN OPENSSH PRIVATE KEY-----
  tu_clave_privada_aqui
  -----END OPENSSH PRIVATE KEY-----

Name: VPS_URL
Value: https://taller.example.com

Name: DATABASE_URL
Value: postgresql://taller_user:password@localhost:5432/taller_prod

Name: JWT_SECRET
Value: tu-super-secreto-jwt-key-muy-segura-123

Name: NEXT_PUBLIC_API_URL
Value: https://api.taller.example.com
```

---

## 🚀 Uso de los Workflows

### Test Workflow (Automático)

**Se ejecuta automáticamente en:**
```bash
# Push a main o develop
git push origin main

# Pull Request
git checkout -b feature/nueva-funcionalidad
git push origin feature/nueva-funcionalidad
# Crear PR en GitHub
```

**Resultado:**
- ✅ Tests pasan → PR puede ser merged
- ❌ Tests fallan → PR bloqueado hasta fix

### Deploy Workflow

**Opción 1: Automático (Push a main)**
```bash
git checkout main
git merge develop
git push origin main
# Deploy se ejecuta automáticamente
```

**Opción 2: Manual (GitHub UI)**
1. Ve a Actions → Deploy to VPS
2. Click "Run workflow"
3. Selecciona environment (production/staging)
4. Click "Run workflow"

---

## 📊 Monitoreo

### Ver Ejecución en GitHub:
1. Ve a tu repo en GitHub
2. Click en tab "Actions"
3. Ver workflows en ejecución o completados
4. Click en workflow para ver detalles

### Ver Logs:
```bash
# En cada job, puedes expandir los steps
# Ejemplo: Backend Tests → Run backend unit tests
```

### Ver Summary:
Cada workflow genera un summary al final con:
- Status de cada job
- Commit SHA
- Branch name
- Coverage reports (si aplica)

---

## 🔍 Troubleshooting

### Test Workflow Falla

**Backend tests fail:**
```bash
# Verificar localmente
cd backend
npm test

# Verificar migraciones
npx prisma migrate dev

# Verificar DATABASE_URL
cat .env
```

**Frontend build fail:**
```bash
# Verificar localmente
cd frontend
npm run build

# Verificar variables de entorno
cat .env.local
```

**Docker build fail:**
```bash
# Probar build local
docker build -t test-backend ./backend
docker build -t test-frontend ./frontend
```

### Deploy Workflow Falla

**SSH connection fail:**
```yaml
# Verificar secrets en GitHub
VPS_HOST ✓
VPS_USER ✓
VPS_SSH_PRIVATE_KEY ✓

# Probar conexión manual
ssh user@host
```

**Deploy fail:**
```bash
# SSH al VPS y verificar logs
ssh user@host
cd ~/taller-app
docker-compose logs --tail=100

# Verificar servicios
docker-compose ps

# Verificar .env
cat backend/.env
```

**Health check fail:**
```bash
# En VPS, verificar servicios
curl http://localhost:3002
curl http://localhost:3000

# Verificar logs
docker-compose logs backend
docker-compose logs frontend
```

---

## 🎯 Best Practices

### 1. Branches Strategy

```
main (production)
  ← develop (staging)
    ← feature/nueva-funcionalidad
```

**Workflow:**
1. Crear feature branch desde develop
2. Push feature → Tests run
3. PR a develop → Tests run
4. Merge a develop → Tests run
5. PR develop → main → Tests + Deploy

### 2. Commits

```bash
# Use conventional commits
git commit -m "feat: add user authentication"
git commit -m "fix: resolve database connection issue"
git commit -m "docs: update README with deployment steps"
```

### 3. Testing Antes de Push

```bash
# Siempre correr tests localmente
cd backend && npm test
cd frontend && npm run lint

# Verificar build
cd backend && npm run build
cd frontend && npm run build

# Probar Docker
docker-compose up --build
```

### 4. Variables de Entorno

```bash
# NUNCA commitear .env
# Usar .env.example como template

# backend/.env.example
DATABASE_URL=postgresql://user:password@localhost:5432/taller
JWT_SECRET=your-secret-here
PORT=3002
NODE_ENV=development

# frontend/.env.example
NEXT_PUBLIC_API_URL=http://localhost:3002
```

---

## 📈 Mejoras Futuras

### Posibles Adiciones:

**1. Notificaciones:**
```yaml
# Slack notification en test.yml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

**2. Staging Environment:**
```yaml
# Agregar staging al deploy.yml
on:
  push:
    branches: [ main, develop ]
    
jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    # ...
```

**3. Database Backup:**
```yaml
# Antes de deploy
- name: Backup Database
  run: |
    ssh $SSH_USER@$SSH_HOST << 'EOF'
      docker-compose exec postgres pg_dump -U user dbname > backup.sql
    EOF
```

**4. Performance Tests:**
```yaml
# Agregar job de performance
  performance-tests:
    needs: [test-backend]
    runs-on: ubuntu-latest
    steps:
      - name: Run k6 tests
        uses: grafana/k6-action@v0.3.0
```

---

## ✅ Checklist de Implementación

- [x] test.yml creado
- [x] deploy.yml creado
- [x] Backend tests configurados
- [x] Frontend build configurado
- [x] Docker build configurado
- [x] SSH deployment configurado
- [x] Health checks implementados
- [x] Rollback strategy implementado
- [x] Documentación completa
- [ ] Secrets configurados en GitHub
- [ ] VPS configurado y accessible
- [ ] Primer deploy exitoso

---

## 🎓 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Docker Compose in CI/CD](https://docs.docker.com/compose/ci-cd/)
- [SSH Actions](https://github.com/appleboy/ssh-action)

---

## 📝 Notas Importantes

1. **Secrets**: Asegúrate de configurar TODOS los secrets antes del primer deploy
2. **VPS**: El VPS debe tener Docker y Docker Compose instalados
3. **SSH Key**: Usa una clave SSH específica para GitHub Actions
4. **Backup**: Siempre ten backups antes de deploy
5. **Monitoring**: Configura logs y monitoring en producción

---

**Creado**: 2025-12-12  
**Última actualización**: 2025-12-12  
**Workflows**: 2 (test.yml + deploy.yml)  
**Status**: ✅ Listo para usar
