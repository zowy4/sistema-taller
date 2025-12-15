# Guía Completa de Configuración del VPS

Esta guía te llevará paso a paso desde cero hasta tener tu aplicación funcionando en un VPS.

## 📋 Requisitos Previos

- VPS con Ubuntu 20.04/22.04 o Debian 11/12
- Acceso root o sudo
- Dominio (opcional, pero recomendado)
- Cliente SSH (incluido en Windows 10+, macOS, Linux)

## 🚀 Paso 1: Conectar al VPS

### Opción A: Con Contraseña (Primera vez)

```bash
ssh root@TU_IP_DEL_VPS
# Ingresa la contraseña cuando se solicite
```

### Opción B: Con usuario no-root

```bash
ssh tu_usuario@TU_IP_DEL_VPS
```

## 👤 Paso 2: Crear Usuario (Si usas root)

**⚠️ IMPORTANTE: No uses root para el deployment**

```bash
# Crear nuevo usuario
adduser taller
# Ingresa contraseña cuando se solicite

# Dar permisos sudo
usermod -aG sudo taller

# Cambiar a nuevo usuario
su - taller
```

## 🔐 Paso 3: Configurar SSH Key (Crítico para GitHub Actions)

### En tu computadora local (Windows PowerShell):

```powershell
# Generar nuevo SSH key pair
ssh-keygen -t ed25519 -C "github-actions-taller" -f C:\Users\TU_USUARIO\.ssh\taller_deploy

# Esto genera 2 archivos:
# - taller_deploy (clave PRIVADA - para GitHub)
# - taller_deploy.pub (clave PÚBLICA - para VPS)

# Ver la clave pública
Get-Content C:\Users\TU_USUARIO\.ssh\taller_deploy.pub
# Copia TODO el contenido (empieza con ssh-ed25519)

# Ver la clave privada
Get-Content C:\Users\TU_USUARIO\.ssh\taller_deploy
# Copia TODO el contenido (incluye BEGIN y END)
```

### En el VPS:

```bash
# Crear directorio SSH si no existe
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Agregar clave pública
nano ~/.ssh/authorized_keys
# Pega la clave pública que copiaste
# Ctrl+O para guardar, Ctrl+X para salir

# Permisos correctos
chmod 600 ~/.ssh/authorized_keys
```

### Probar conexión con key:

```powershell
# En tu computadora
ssh -i C:\Users\TU_USUARIO\.ssh\taller_deploy taller@TU_IP_DEL_VPS
# Debería conectar SIN pedir contraseña
```

✅ Si funciona, continúa. Si no, revisa los permisos.

## 🔒 Paso 4: Configuración de Seguridad Básica

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar firewall
sudo apt install ufw -y

# Configurar firewall
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw allow 3002/tcp   # Backend (temporal, luego bloquear)

# Activar firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

## 🐳 Paso 5: Instalar Docker

```bash
# Desinstalar versiones antiguas
sudo apt remove docker docker-engine docker.io containerd runc

# Instalar dependencias
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Agregar Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Agregar repositorio Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Verificar instalación
docker --version
# Debería mostrar: Docker version 24.x.x

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Aplicar cambios (necesitas reconectar SSH después)
newgrp docker

# Probar sin sudo
docker run hello-world
# Debería descargar y ejecutar contenedor de prueba
```

## 🔧 Paso 6: Instalar Docker Compose

```bash
# Descargar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker-compose --version
# Debería mostrar: Docker Compose version v2.x.x
```

## 📁 Paso 7: Crear Estructura de Directorios

```bash
# Crear directorio principal
mkdir -p ~/taller-app
cd ~/taller-app

# Crear directorios para logs y datos
mkdir -p logs
mkdir -p postgres-data

# Permisos
chmod 755 ~/taller-app
```

## 🗄️ Paso 8: Configurar PostgreSQL

### Opción A: PostgreSQL en Docker (Recomendado)

Ya está configurado en tu `docker-compose.yml`. Solo necesitas crear el volumen:

```bash
# Docker Compose creará el volumen automáticamente
# pero puedes verificar después con:
docker volume ls
```

### Opción B: PostgreSQL en VPS (Alternativa)

```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear base de datos y usuario
sudo -u postgres psql << EOF
CREATE DATABASE taller_prod;
CREATE USER taller_user WITH PASSWORD 'tu_password_segura_aqui';
GRANT ALL PRIVILEGES ON DATABASE taller_prod TO taller_user;
\q
EOF

# Configurar acceso (si usas PostgreSQL local)
sudo nano /etc/postgresql/*/main/postgresql.conf
# Buscar: listen_addresses = 'localhost'

sudo nano /etc/postgresql/*/main/pg_hba.conf
# Agregar: host    taller_prod    taller_user    127.0.0.1/32    md5

# Reiniciar
sudo systemctl restart postgresql
```

## 🌐 Paso 9: Configurar Dominio (Opcional pero Recomendado)

### Si tienes un dominio:

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/taller

# Pega esta configuración:
```

```nginx
# Frontend
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 80;
    server_name api.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activar configuración
sudo ln -s /etc/nginx/sites-available/taller /etc/nginx/sites-enabled/

# Remover default
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Habilitar al inicio
sudo systemctl enable nginx
```

### Configurar SSL con Let's Encrypt:

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificados
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com -d api.tu-dominio.com

# Renovación automática
sudo certbot renew --dry-run
```

## 🔑 Paso 10: Configurar Secrets en GitHub

### 1. Ve a tu repositorio en GitHub
### 2. Settings → Secrets and variables → Actions
### 3. Click "New repository secret"

### Agrega estos secrets:

#### VPS_HOST
```
Valor: TU_IP_DEL_VPS o tu-dominio.com
```

#### VPS_USER
```
Valor: taller (o el usuario que creaste)
```

#### VPS_SSH_PRIVATE_KEY
```
# El contenido completo del archivo taller_deploy (PRIVADA)
# Incluyendo -----BEGIN OPENSSH PRIVATE KEY----- y -----END OPENSSH PRIVATE KEY-----

Ejemplo:
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtz
c2gtZWQyNTUxOQAAACDG8KONGxZqZFMC...
[más líneas]
...xxxxxxxxxxxxxxxxxxxxx=
-----END OPENSSH PRIVATE KEY-----
```

#### VPS_URL
```
Valor: https://tu-dominio.com
o
Valor: http://TU_IP_DEL_VPS:3000
```

#### DATABASE_URL
```
# Si usas Docker Compose (PostgreSQL en contenedor):
Valor: postgresql://taller_user:taller_password@postgres:5432/taller_db

# Si usas PostgreSQL en VPS:
Valor: postgresql://taller_user:tu_password_segura_aqui@localhost:5432/taller_prod
```

#### JWT_SECRET
```
# Genera una clave aleatoria segura
# En PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Ejemplo de valor:
kJ8mN2pQ5rS9tU7vW3xY1zA4bC6dE8fG0hI2jK4lM6nO8pQ0rS2tU4vW6xY8zA
```

#### NEXT_PUBLIC_API_URL
```
# Si usas dominio:
Valor: https://api.tu-dominio.com

# Si usas IP:
Valor: http://TU_IP_DEL_VPS:3002
```

## 🎯 Paso 11: Deployment Manual (Primera Vez)

Antes de usar GitHub Actions, hagamos un deploy manual para verificar todo:

```bash
# En el VPS
cd ~/taller-app

# Clonar repositorio
git clone https://github.com/TU_USUARIO/TU_REPO.git .

# Crear archivo .env para backend
cd backend
nano .env
```

Pega esto en el archivo .env:
```env
DATABASE_URL=postgresql://taller_user:taller_password@postgres:5432/taller_db
JWT_SECRET=tu_jwt_secret_aqui
PORT=3002
NODE_ENV=production
```

```bash
# Crear archivo .env para frontend
cd ../frontend
nano .env.production
```

Pega esto:
```env
NEXT_PUBLIC_API_URL=http://TU_IP_DEL_VPS:3002
```

```bash
# Volver al directorio raíz
cd ~/taller-app

# Iniciar servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Esperar a que todos los servicios estén listos (30-60 segundos)
# Ctrl+C para salir de los logs

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# Verificar servicios
docker-compose ps
```

## ✅ Paso 12: Verificar Funcionamiento

### Verificar Backend:

```bash
# En el VPS
curl http://localhost:3002

# Debería responder algo como: {"statusCode":404,"message":"Cannot GET /"}
# Esto es OK, significa que el servidor funciona

# Probar un endpoint real
curl http://localhost:3002/auth/login
```

### Verificar Frontend:

```bash
curl http://localhost:3000
# Debería devolver HTML
```

### Desde tu navegador:

```
http://TU_IP_DEL_VPS:3000  (Frontend)
http://TU_IP_DEL_VPS:3002  (Backend API)
```

## 🔧 Paso 13: Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ CUIDADO: elimina datos)
docker-compose down -v

# Ver uso de recursos
docker stats

# Ver procesos
docker-compose ps

# Ejecutar comandos en contenedor
docker-compose exec backend sh
docker-compose exec postgres psql -U taller_user -d taller_db

# Ver logs de sistema
journalctl -u docker -f
```

## 🚨 Troubleshooting

### Error: Puerto ya en uso

```bash
# Ver qué usa el puerto 3002
sudo lsof -i :3002

# Matar proceso
sudo kill -9 PID_DEL_PROCESO
```

### Error: Permission denied

```bash
# Dar permisos
sudo chown -R $USER:$USER ~/taller-app
chmod -R 755 ~/taller-app
```

### Error: Cannot connect to Docker daemon

```bash
# Reiniciar Docker
sudo systemctl restart docker

# Verificar status
sudo systemctl status docker
```

### Error: Database connection failed

```bash
# Ver logs de PostgreSQL
docker-compose logs postgres

# Verificar que el contenedor esté corriendo
docker-compose ps postgres

# Probar conexión
docker-compose exec postgres psql -U taller_user -d taller_db -c "SELECT 1;"
```

### Frontend no carga

```bash
# Reconstruir frontend
docker-compose up -d --build frontend

# Ver logs
docker-compose logs frontend

# Verificar variables de entorno
docker-compose exec frontend printenv
```

## 🎉 Paso 14: Primer Deploy con GitHub Actions

Una vez que todo funcione manualmente:

```bash
# En tu computadora local
git add .
git commit -m "feat: ready for production deployment"
git push origin main
```

El workflow se ejecutará automáticamente y:
1. Correrá los tests
2. Construirá las imágenes Docker
3. Conectará al VPS por SSH
4. Copiará archivos
5. Ejecutará docker-compose
6. Aplicará migraciones
7. Verificará health checks

Monitorea en: **GitHub → Actions**

## 📊 Paso 15: Monitoreo Post-Deployment

```bash
# En el VPS - Ver recursos
htop
# Si no está instalado: sudo apt install htop

# Ver uso de disco
df -h

# Ver logs de aplicación
tail -f ~/taller-app/backend/logs/combined-*.log
tail -f ~/taller-app/backend/logs/error-*.log

# Monitoreo continuo de Docker
watch docker-compose ps
```

## 🔐 Paso 16: Seguridad Adicional (Recomendado)

```bash
# Deshabilitar login con contraseña SSH
sudo nano /etc/ssh/sshd_config
# Cambiar: PasswordAuthentication no
# Guardar y salir

sudo systemctl restart sshd

# Instalar fail2ban (protección contra fuerza bruta)
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configurar actualizaciones automáticas
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## ✅ Checklist Final

- [ ] VPS accesible por SSH
- [ ] Usuario no-root creado
- [ ] SSH key configurado
- [ ] Firewall configurado (UFW)
- [ ] Docker instalado y funcionando
- [ ] Docker Compose instalado
- [ ] Directorio ~/taller-app creado
- [ ] PostgreSQL funcionando (Docker o local)
- [ ] Nginx instalado (si usas dominio)
- [ ] SSL configurado (si usas dominio)
- [ ] Secrets configurados en GitHub
- [ ] Deploy manual exitoso
- [ ] Backend responde en puerto 3002
- [ ] Frontend carga en puerto 3000
- [ ] Database migrations aplicadas
- [ ] GitHub Actions workflow probado
- [ ] Logs funcionando
- [ ] Monitoreo configurado

## 🎓 Próximos Pasos

1. **Backups Automáticos**
```bash
# Crear script de backup
nano ~/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/taller/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)

docker-compose exec -T postgres pg_dump -U taller_user taller_db > "$BACKUP_DIR/backup_$DATE.sql"

# Mantener solo últimos 7 días
find $BACKUP_DIR -type f -mtime +7 -delete
```

```bash
chmod +x ~/backup-db.sh

# Agregar a crontab
crontab -e
# Agregar: 0 2 * * * /home/taller/backup-db.sh
```

2. **Monitoring con Prometheus + Grafana** (Opcional)
3. **CI/CD más avanzado** (staging environment)
4. **CDN para assets estáticos** (Cloudflare)

## 🆘 Soporte

Si encuentras problemas:

1. **Revisa los logs**:
   ```bash
   docker-compose logs --tail=100
   ```

2. **Verifica el estado de servicios**:
   ```bash
   docker-compose ps
   systemctl status nginx
   ```

3. **Comprueba conectividad**:
   ```bash
   ping google.com
   curl http://localhost:3000
   ```

4. **GitHub Actions logs**: Ve a tu repositorio → Actions → Click en el workflow fallido

---

**¡Listo! Tu aplicación debería estar funcionando en producción.** 🚀

**Creado**: 2025-12-14  
**VPS**: Configuración completa desde cero  
**Tiempo estimado**: 30-60 minutos
