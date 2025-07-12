# 🚀 Deployment en VPS - Quipu.ai

## Información del servidor:
- **IP:** 167.86.90.102
- **Usuario:** root
- **Directorio:** /proyectos1
- **Puertos:** Frontend: 5000, Backend: 5001

## 📋 Comandos para deployment:

### 1. En el VPS - Instalar dependencias
```bash
# Asegúrate de tener Node.js y npm instalados
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 2. En el VPS - Instalar dependencias del proyecto
```bash
cd /proyectos1/quipus

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. En el VPS - Build del frontend
```bash
cd /proyectos1/quipus/frontend
npm run build
```

### 4. En el VPS - Iniciar servicios
```bash
# Terminal 1 - Backend
cd /proyectos1/quipus/backend
node server-simple.js

# Terminal 2 - Frontend (development)
cd /proyectos1/quipus/frontend
npm run dev

# O para producción con servidor estático:
# npm install -g serve
# serve -s dist -p 5000
```

### 5. Configurar firewall (si es necesario)
```bash
# Permitir puertos 5000 y 5001
ufw allow 5000
ufw allow 5001
ufw reload
```

### 6. URLs públicas:
- **Frontend:** http://167.86.90.102:5000
- **Backend API:** http://167.86.90.102:7000/api
- **Health Check:** http://167.86.90.102:7000/health

## 🔧 Para usar con PM2 (recomendado para producción):

```bash
# Instalar PM2
npm install -g pm2

# Crear ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'quipu-backend',
      script: './backend/server-simple.js',
      cwd: '/proyectos1/quipus',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      }
    },
    {
      name: 'quipu-frontend',
      script: 'serve',
      args: '-s dist -p 5000',
      cwd: '/proyectos1/quipus/frontend',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔐 Credenciales de demo:
- **Login estándar:** demo@quipu.ai / password
- **Login SUNAT:** RUC: 12345678901, Usuario: DEMO123, Clave: demo123

## 🐛 Troubleshooting:
- Si no puedes acceder externamente, verifica firewall
- Si hay errores CORS, verifica que las IPs estén en server-simple.js
- Para HTTPS, considera usar nginx como proxy reverso