# Quick VPS Setup - Comandos Rápidos

Para quienes tienen experiencia o quieren un setup rápido.

## 🚀 Setup Completo en 10 Minutos

### 1. Preparación Inicial (2 min)

```bash
# Conectar al VPS
ssh root@YOUR_VPS_IP

# Crear usuario
adduser taller && usermod -aG sudo taller && su - taller

# Actualizar sistema
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Docker (3 min)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER && newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version && docker-compose --version
```

### 3. Configurar Firewall (1 min)

```bash
sudo apt install ufw -y
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw allow 3002/tcp
sudo ufw --force enable
```

### 4. SSH Key para GitHub Actions (2 min)

**En tu PC (PowerShell):**
```powershell
ssh-keygen -t ed25519 -C "github" -f $HOME\.ssh\taller_deploy
Get-Content $HOME\.ssh\taller_deploy.pub
```

**En el VPS:**
```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Pegar la public key
chmod 600 ~/.ssh/authorized_keys
```

### 5. Preparar Directorios (30 seg)

```bash
mkdir -p ~/taller-app && cd ~/taller-app
```

### 6. Variables de Entorno (1 min)

```bash
# backend/.env
cat > backend/.env << EOF
DATABASE_URL=postgresql://taller_user:taller_password@postgres:5432/taller_db
JWT_SECRET=$(openssl rand -base64 48)
PORT=3002
NODE_ENV=production
EOF

# frontend/.env.production
cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:3002
EOF
```

### 7. GitHub Secrets (1 min)

En GitHub → Settings → Secrets → Actions:

```yaml
VPS_HOST: YOUR_VPS_IP
VPS_USER: taller
VPS_SSH_PRIVATE_KEY: [contenido de taller_deploy]
VPS_URL: http://YOUR_VPS_IP:3000
DATABASE_URL: postgresql://taller_user:taller_password@postgres:5432/taller_db
JWT_SECRET: [tu jwt secret]
NEXT_PUBLIC_API_URL: http://YOUR_VPS_IP:3002
```

### 8. Deploy

```bash
# Push a main para activar workflow
git push origin main

# O deploy manual:
git clone YOUR_REPO ~/taller-app
cd ~/taller-app
docker-compose up -d --build
docker-compose exec backend npx prisma migrate deploy
```

## ✅ Verificar

```bash
# Check services
docker-compose ps

# Check logs
docker-compose logs --tail=50

# Test endpoints
curl http://localhost:3002
curl http://localhost:3000
```

## 🔧 One-Liner Commands

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar todo
docker-compose restart

# Rebuild específico
docker-compose up -d --build backend

# Ver recursos
docker stats

# Backup DB
docker-compose exec postgres pg_dump -U taller_user taller_db > backup.sql

# Restore DB
cat backup.sql | docker-compose exec -T postgres psql -U taller_user taller_db

# Limpiar Docker
docker system prune -af
```

## 🆘 Quick Fixes

### Puerto ocupado
```bash
sudo lsof -i :3002 && sudo kill -9 PID
```

### Permisos
```bash
sudo chown -R $USER:$USER ~/taller-app
```

### Reiniciar Docker
```bash
sudo systemctl restart docker
```

### Ver errores
```bash
docker-compose logs backend --tail=100 | grep -i error
```

---

**Setup Completo**: 10 minutos  
**Deploy**: automático con GitHub Actions
