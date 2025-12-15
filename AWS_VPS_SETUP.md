# Guía Completa de Configuración en AWS EC2

Esta guía te llevará paso a paso para desplegar tu aplicación en Amazon Web Services (AWS).

## 📋 Requisitos Previos

- Cuenta de AWS (puedes usar Free Tier)
- Tarjeta de crédito/débito para verificar cuenta
- Cliente SSH (incluido en Windows 10+)

## 🚀 Parte 1: Crear Instancia EC2 en AWS

### Paso 1.1: Acceder a AWS Console

1. Ve a https://aws.amazon.com/
2. Click en "Sign In to the Console"
3. Ingresa con tu cuenta AWS

### Paso 1.2: Lanzar Instancia EC2

1. **Buscar EC2**:
   - En la barra de búsqueda superior, escribe "EC2"
   - Click en "EC2" (Virtual Servers in the Cloud)

2. **Launch Instance**:
   - Click en el botón naranja "Launch Instance"

3. **Configurar Instancia**:

   **Name and tags**:
   ```
   Name: taller-app-server
   ```

   **Application and OS Images (AMI)**:
   ```
   ✅ Ubuntu Server 22.04 LTS (Free tier eligible)
   - Architecture: 64-bit (x86)
   ```

   **Instance type**:
   ```
   ✅ t2.micro (Free tier eligible)
   - 1 vCPU
   - 1 GiB Memory
   
   💡 Para producción real, considera:
   - t2.small (1 vCPU, 2 GiB) - ~$17/mes
   - t2.medium (2 vCPU, 4 GiB) - ~$34/mes
   ```

   **Key pair (login)**:
   ```
   Click en "Create new key pair"
   
   Key pair name: taller-app-key
   Key pair type: RSA
   Private key file format: .pem (para OpenSSH)
   
   Click "Create key pair"
   ```
   ⚠️ **IMPORTANTE**: Se descargará `taller-app-key.pem` - ¡Guárdalo en un lugar seguro!
   ```
   Muévelo a: C:\Users\TU_USUARIO\.ssh\taller-app-key.pem
   ```

   **Network settings**:
   ```
   ✅ Create security group
   Security group name: taller-app-sg
   Description: Security group for Taller App
   
   Reglas de firewall (Security Group Rules):
   ✅ SSH (22) - Source: My IP (tu IP actual)
   ✅ Click "Add security group rule" para agregar:
      - Type: HTTP (80) - Source: Anywhere (0.0.0.0/0)
      - Type: HTTPS (443) - Source: Anywhere (0.0.0.0/0)
      - Type: Custom TCP (3000) - Source: Anywhere (0.0.0.0/0) - Frontend
      - Type: Custom TCP (3002) - Source: Anywhere (0.0.0.0/0) - Backend API
   ```

   **Configure storage**:
   ```
   ✅ 20 GiB gp3 (Free tier: hasta 30 GB)
   
   💡 Para producción, considera 30-50 GB
   ```

4. **Launch**:
   - Revisa el resumen en el panel derecho
   - Click en "Launch instance"
   - ✅ Verás "Successfully initiated launch of instance i-xxxxx"
   - Click en el ID de instancia (i-xxxxx) para ver detalles

### Paso 1.3: Obtener IP Pública

1. En la consola EC2, selecciona tu instancia
2. En el panel inferior, busca:
   ```
   Public IPv4 address: XX.XX.XX.XX
   Public IPv4 DNS: ec2-xx-xx-xx-xx.compute-1.amazonaws.com
   ```
3. **Copia la IP pública** - la usarás para conectarte

## 🔐 Parte 2: Conectarse a la Instancia

### Paso 2.1: Configurar Permisos del Key File (Windows)

En PowerShell:

```powershell
# Navegar a tu carpeta .ssh
cd C:\Users\TU_USUARIO\.ssh

# Verificar que el archivo existe
dir taller-app-key.pem

# Configurar permisos (solo lectura para ti)
icacls taller-app-key.pem /inheritance:r
icacls taller-app-key.pem /grant:r "$($env:USERNAME):(R)"
```

### Paso 2.2: Conectar por SSH

```powershell
# Conectar a la instancia
ssh -i C:\Users\TU_USUARIO\.ssh\taller-app-key.pem ubuntu@TU_IP_PUBLICA_AWS

# Ejemplo:
# ssh -i C:\Users\zowya\.ssh\taller-app-key.pem ubuntu@18.205.123.45

# La primera vez preguntará:
# "Are you sure you want to continue connecting?"
# Escribe: yes
```

✅ **Si conecta correctamente, verás**:
```
Welcome to Ubuntu 22.04.3 LTS
ubuntu@ip-172-31-xx-xx:~$
```

## 👤 Parte 3: Configuración Inicial del Servidor

### Paso 3.1: Actualizar Sistema

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Esto puede tomar 5-10 minutos
```

### Paso 3.2: Configurar Firewall UFW (Adicional)

AWS Security Groups ya actúa como firewall, pero UFW añade una capa extra:

```bash
# Instalar UFW
sudo apt install ufw -y

# Configurar reglas
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 3000/tcp    # Frontend
sudo ufw allow 3002/tcp    # Backend

# Activar (⚠️ asegúrate de permitir SSH antes!)
sudo ufw --force enable

# Verificar
sudo ufw status
```

## 🐳 Parte 4: Instalar Docker y Docker Compose

```bash
# Instalar Docker usando el script oficial
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario ubuntu al grupo docker
sudo usermod -aG docker ubuntu

# Aplicar cambios de grupo (importante)
newgrp docker

# Verificar instalación
docker --version
# Debe mostrar: Docker version 24.x.x

# Probar Docker sin sudo
docker run hello-world
# Debe descargar y ejecutar correctamente
```

### Instalar Docker Compose

```bash
# Descargar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/docker-compose

# Verificar
docker-compose --version
# Debe mostrar: Docker Compose version v2.x.x
```

## 📁 Parte 5: Preparar Directorios

```bash
# Crear estructura
mkdir -p ~/taller-app
cd ~/taller-app

# Crear directorios adicionales
mkdir -p logs postgres-data

# Verificar
pwd
# Debe mostrar: /home/ubuntu/taller-app
```

## 🔑 Parte 6: Configurar SSH para GitHub Actions

GitHub Actions necesita una clave SSH diferente a la de AWS (.pem).

### Paso 6.1: Generar Nueva SSH Key EN EL SERVIDOR AWS

```bash
# En el servidor AWS, generar nueva key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Presiona Enter 3 veces (sin passphrase)

# Ver la clave pública
cat ~/.ssh/github_deploy.pub

# Agregar a authorized_keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# Permisos correctos
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_deploy
chmod 644 ~/.ssh/github_deploy.pub
```

### Paso 6.2: Obtener la Clave Privada

```bash
# Mostrar la clave PRIVADA (para GitHub Secret)
cat ~/.ssh/github_deploy

# Copia TODO el contenido (desde BEGIN hasta END)
```

⚠️ **IMPORTANTE**: Copia este contenido completo - lo usarás en GitHub Secrets como `VPS_SSH_PRIVATE_KEY`

### Paso 6.3: Probar Conexión con Nueva Key

En tu PC (PowerShell):

```powershell
# Guardar la clave privada en tu PC
notepad C:\Users\TU_USUARIO\.ssh\github_deploy

# Pega el contenido de la clave privada y guarda

# Probar conexión
ssh -i C:\Users\TU_USUARIO\.ssh\github_deploy ubuntu@TU_IP_AWS

# Debería conectar sin pedir contraseña
```

## 🗄️ Parte 7: Preparar Variables de Entorno

```bash
cd ~/taller-app

# Crear .env para backend
mkdir -p backend
nano backend/.env
```

Pega esto:
```env
DATABASE_URL=postgresql://taller_user:taller_password@postgres:5432/taller_db
JWT_SECRET=CAMBIA_ESTO_POR_UNA_CLAVE_SEGURA_64_CARACTERES
PORT=3002
NODE_ENV=production
```

Presiona `Ctrl+O` para guardar, `Enter`, luego `Ctrl+X` para salir.

```bash
# Crear .env.production para frontend
mkdir -p frontend
nano frontend/.env.production
```

Pega esto (reemplaza con tu IP):
```env
NEXT_PUBLIC_API_URL=http://TU_IP_AWS:3002
```

### Generar JWT_SECRET Seguro

En el servidor AWS:
```bash
# Generar clave aleatoria de 64 caracteres
openssl rand -base64 48

# Copia el resultado y reemplázalo en backend/.env
nano backend/.env
```

## 🔑 Parte 8: Configurar GitHub Secrets

### Ve a tu repositorio en GitHub:

1. **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** para cada uno:

### Secrets a configurar:

#### VPS_HOST
```
Name: VPS_HOST
Value: TU_IP_PUBLICA_AWS (ejemplo: 18.205.123.45)
```

#### VPS_USER
```
Name: VPS_USER
Value: ubuntu
```
⚠️ En AWS Ubuntu, el usuario por defecto es `ubuntu`, no `root`

#### VPS_SSH_PRIVATE_KEY
```
Name: VPS_SSH_PRIVATE_KEY
Value: [Contenido completo de ~/.ssh/github_deploy del servidor]

Debe incluir:
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmU...
[todas las líneas]
-----END OPENSSH PRIVATE KEY-----
```

#### VPS_URL
```
Name: VPS_URL
Value: http://TU_IP_AWS:3000

Ejemplo: http://18.205.123.45:3000
```

#### DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://taller_user:taller_password@postgres:5432/taller_db
```
⚠️ Usa las mismas credenciales que en backend/.env

#### JWT_SECRET
```
Name: JWT_SECRET
Value: [El mismo valor que generaste con openssl rand -base64 48]
```

#### NEXT_PUBLIC_API_URL
```
Name: NEXT_PUBLIC_API_URL
Value: http://TU_IP_AWS:3002

Ejemplo: http://18.205.123.45:3002
```

## 🎯 Parte 9: Deploy Manual (Primera Vez)

Antes de usar GitHub Actions, verifica que todo funcione:

```bash
# En el servidor AWS
cd ~/taller-app

# Clonar tu repositorio
git clone https://github.com/TU_USUARIO/TU_REPO.git .

# Si el directorio no está vacío:
# rm -rf ~/taller-app/*
# git clone https://github.com/TU_USUARIO/TU_REPO.git ~/taller-app

# Verificar archivos
ls -la

# Deberías ver:
# backend/  frontend/  docker-compose.yml  README.md  etc.
```

### Iniciar con Docker Compose

```bash
# Construir e iniciar servicios
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f

# Espera a ver:
# ✅ backend  | [NestApplication] Nest application successfully started
# ✅ frontend | ready - started server on 0.0.0.0:3000

# Presiona Ctrl+C para salir de logs
```

### Ejecutar Migraciones

```bash
# Aplicar migraciones de Prisma
docker-compose exec backend npx prisma migrate deploy

# Deberías ver:
# ✅ Applied migration: 20xx...
```

### Verificar Servicios

```bash
# Ver estado de contenedores
docker-compose ps

# Todos deben estar "Up" y "healthy"
```

## ✅ Parte 10: Verificar Funcionamiento

### Desde el servidor AWS:

```bash
# Probar backend
curl http://localhost:3002
# Debe responder: {"statusCode":404,"message":"Cannot GET /"}
# Esto es normal, el servidor funciona

# Probar frontend
curl http://localhost:3000
# Debe devolver HTML
```

### Desde tu navegador:

Abre estas URLs (reemplaza con tu IP):

```
Frontend: http://18.205.123.45:3000
Backend:  http://18.205.123.45:3002
```

✅ **Si ambos cargan, ¡el deploy manual fue exitoso!**

## 🚀 Parte 11: Deploy Automático con GitHub Actions

### Paso 11.1: Verificar Workflows

En tu repositorio local, verifica que existan:
```
.github/workflows/test.yml
.github/workflows/deploy.yml
```

### Paso 11.2: Actualizar deploy.yml para AWS

El workflow ya está configurado, pero verifica estas líneas:

```yaml
# En .github/workflows/deploy.yml
env:
  DEPLOY_PATH: /home/ubuntu/taller-app  # ✅ Correcto para AWS
  BACKUP_PATH: /home/ubuntu/taller-app-backup
```

### Paso 11.3: Ejecutar Deploy

```bash
# En tu PC, asegúrate de tener todos los cambios
git status

# Commit si hay cambios
git add .
git commit -m "feat: configuración AWS lista para deploy"

# Push a main (activa el workflow automáticamente)
git push origin main
```

### Paso 11.4: Monitorear Deploy

1. Ve a tu repositorio en GitHub
2. Click en **"Actions"** (parte superior)
3. Verás el workflow **"Deploy to VPS"** ejecutándose
4. Click en él para ver detalles
5. Expande cada paso para ver logs

✅ **Deploy exitoso si todos los pasos tienen ✓ verde**

## 📊 Parte 12: Comandos Útiles AWS

### Ver Logs de Aplicación

```bash
# Logs en tiempo real
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Últimas 100 líneas
docker-compose logs --tail=100
```

### Reiniciar Servicios

```bash
# Reiniciar todo
docker-compose restart

# Reiniciar servicio específico
docker-compose restart backend

# Rebuild completo
docker-compose up -d --build
```

### Monitorear Recursos

```bash
# Uso de recursos de Docker
docker stats

# Uso de disco
df -h

# Memoria y CPU del sistema
top
# Presiona 'q' para salir

# Instalar htop (mejor que top)
sudo apt install htop -y
htop
```

### Limpiar Docker

```bash
# Eliminar imágenes no usadas
docker image prune -a

# Eliminar volúmenes no usados
docker volume prune

# Limpiar todo (⚠️ cuidado)
docker system prune -a
```

## 🔒 Parte 13: Seguridad AWS Adicional

### Paso 13.1: Restringir SSH Solo a Tu IP

1. Ve a **EC2 Console** → **Security Groups**
2. Selecciona `taller-app-sg`
3. Tab **"Inbound rules"** → **"Edit inbound rules"**
4. En la regla SSH (22):
   - Cambia Source de `0.0.0.0/0` a **"My IP"**
   - Esto permite SSH solo desde tu IP actual

### Paso 13.2: Deshabilitar Password Authentication

```bash
# Editar config SSH
sudo nano /etc/ssh/sshd_config

# Busca y cambia estas líneas:
PasswordAuthentication no
PubkeyAuthentication yes

# Guardar: Ctrl+O, Enter, Ctrl+X

# Reiniciar SSH
sudo systemctl restart sshd
```

### Paso 13.3: Instalar Fail2Ban

```bash
# Protección contra ataques de fuerza bruta
sudo apt install fail2ban -y

# Iniciar y habilitar
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Verificar
sudo fail2ban-client status
```

### Paso 13.4: Actualizaciones Automáticas

```bash
# Instalar unattended-upgrades
sudo apt install unattended-upgrades -y

# Configurar
sudo dpkg-reconfigure --priority=low unattended-upgrades
# Selecciona "Yes"
```

## 🌐 Parte 14: Configurar Dominio (Opcional)

### Si tienes un dominio:

#### Paso 14.1: Configurar DNS

En tu proveedor de dominio (GoDaddy, Namecheap, etc.):

```
Tipo    Nombre              Valor
A       @                   TU_IP_AWS
A       www                 TU_IP_AWS
A       api                 TU_IP_AWS
```

Espera 5-60 minutos para propagación DNS.

#### Paso 14.2: Instalar Nginx

```bash
# Instalar
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/taller
```

Pega esto (reemplaza `tu-dominio.com`):

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
```

#### Paso 14.3: Instalar SSL (HTTPS)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificados SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com -d api.tu-dominio.com

# Sigue las instrucciones:
# 1. Ingresa tu email
# 2. Acepta términos (Y)
# 3. Opción 2: Redirect HTTP to HTTPS

# Probar renovación automática
sudo certbot renew --dry-run
```

Ahora accede con:
```
https://tu-dominio.com
https://api.tu-dominio.com
```

## 🎓 Parte 15: Backups Automáticos

### Crear Script de Backup

```bash
# Crear script
nano ~/backup-db.sh
```

Pega esto:
```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="backup_$DATE.sql"

# Backup de PostgreSQL
cd ~/taller-app
docker-compose exec -T postgres pg_dump -U taller_user taller_db > "$BACKUP_DIR/$FILENAME"

# Comprimir
gzip "$BACKUP_DIR/$FILENAME"

# Mantener solo últimos 7 días
find $BACKUP_DIR -type f -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completado: $FILENAME.gz"
```

```bash
# Dar permisos de ejecución
chmod +x ~/backup-db.sh

# Probar
~/backup-db.sh

# Verificar
ls -lh ~/backups/
```

### Programar Backups con Cron

```bash
# Editar crontab
crontab -e

# Selecciona nano (opción 1)

# Agregar al final (backup diario a las 2 AM):
0 2 * * * /home/ubuntu/backup-db.sh >> /home/ubuntu/backup.log 2>&1

# Guardar: Ctrl+O, Enter, Ctrl+X

# Verificar
crontab -l
```

## 🚨 Troubleshooting AWS

### Error: Connection Refused

```bash
# 1. Verificar Security Group
# EC2 Console → Security Groups → taller-app-sg
# Asegúrate que los puertos estén abiertos

# 2. Verificar servicios en el servidor
docker-compose ps

# 3. Ver logs
docker-compose logs --tail=100
```

### Error: Permission Denied (SSH)

```powershell
# En tu PC, verificar permisos del .pem
icacls C:\Users\TU_USUARIO\.ssh\taller-app-key.pem

# Debe mostrar solo tu usuario con permisos de lectura
```

### Error: Out of Memory

```bash
# Ver uso de memoria
free -h

# Si usas t2.micro (1GB), considera agregar swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Hacer permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verificar
free -h
```

### Error: Disk Full

```bash
# Ver uso de disco
df -h

# Limpiar Docker
docker system prune -a

# Limpiar logs antiguos
sudo journalctl --vacuum-time=7d

# Eliminar backups viejos
find ~/backups -type f -mtime +7 -delete
```

## 💰 Parte 16: Costos AWS

### Free Tier (12 meses):
```
✅ t2.micro: 750 horas/mes (suficiente para 1 instancia 24/7)
✅ 30 GB EBS Storage
✅ 15 GB bandwidth salida
```

### Después del Free Tier:
```
- t2.micro: ~$8-10/mes
- t2.small: ~$17/mes
- 20 GB EBS: ~$2/mes
- Bandwidth: ~$0.09/GB
```

### Optimizar Costos:

1. **Elastic IP**: Si no usas Elastic IP, no hay cargo
2. **Snapshots**: Solo crea snapshots cuando sea necesario
3. **Monitoreo**: Usa CloudWatch basic (gratis)
4. **Apagar instancia**: Cuando no la uses (solo pagas storage)

```bash
# Ver estado de facturación en AWS Console
# Billing Dashboard → Bills
```

## ✅ Checklist Completo AWS

- [ ] Cuenta AWS creada y verificada
- [ ] Instancia EC2 lanzada (Ubuntu 22.04)
- [ ] Security Group configurado (puertos 22, 80, 443, 3000, 3002)
- [ ] Key pair (.pem) descargado y guardado
- [ ] Conectado por SSH exitosamente
- [ ] Sistema actualizado (apt update && upgrade)
- [ ] Docker instalado y funcionando
- [ ] Docker Compose instalado
- [ ] Directorio ~/taller-app creado
- [ ] SSH key para GitHub Actions generado
- [ ] Variables de entorno (.env) creadas
- [ ] 7 Secrets configurados en GitHub
- [ ] Deploy manual exitoso
- [ ] Backend responde (puerto 3002)
- [ ] Frontend carga (puerto 3000)
- [ ] Migraciones aplicadas
- [ ] GitHub Actions workflow ejecutado
- [ ] UFW firewall configurado
- [ ] Fail2ban instalado
- [ ] Backups automáticos configurados
- [ ] Nginx instalado (si usas dominio)
- [ ] SSL configurado (si usas dominio)

## 🎉 ¡Listo!

Tu aplicación está desplegada en AWS EC2. 

### URLs de acceso:
```
Frontend: http://TU_IP_AWS:3000
Backend:  http://TU_IP_AWS:3002
```

### Próximos pasos recomendados:
1. ✅ Configurar dominio personalizado
2. ✅ Monitorear logs con CloudWatch
3. ✅ Configurar alarmas de facturación
4. ✅ Implementar CI/CD completo
5. ✅ Agregar monitoring (Prometheus + Grafana)

---

**Creado**: 2025-12-14  
**Plataforma**: AWS EC2  
**OS**: Ubuntu 22.04 LTS  
**Tiempo estimado**: 45-60 minutos
