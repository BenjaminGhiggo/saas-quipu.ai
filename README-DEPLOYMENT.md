# 🚀 Quipu.ai - Deployment Guide Completo

## 📋 Resumen del Proyecto

**Quipu.ai** es una aplicación completa de gestión contable para emprendedores peruanos que incluye:

- ✅ **Frontend React + TypeScript + Vite + Tailwind CSS**
- ✅ **Backend Node.js + Express con APIs mock completas**
- ✅ **Base de datos MongoDB con schemas y datos de prueba**
- ✅ **Sistema de autenticación (Login estándar y SUNAT)**
- ✅ **Chat con Kappi (asistente IA)**
- ✅ **Gestión de facturas y boletas**
- ✅ **Declaraciones de impuestos**
- ✅ **Métricas y gráficas**
- ✅ **Sistema de alertas**
- ✅ **Responsive design mobile-first**

## 🎯 URLs de Producción

**VPS Contabo - IP: 167.86.90.102**

- **Frontend:** http://167.86.90.102:5000
- **Backend API:** http://167.86.90.102:5001/api
- **Health Check:** http://167.86.90.102:5001/health
- **MongoDB:** 167.86.90.102:27017

## 🔑 Credenciales Demo

### Login Estándar
- **Email:** demo@quipu.ai
- **Password:** password

### Login SUNAT
- **RUC:** 12345678901
- **Usuario:** DEMO123
- **Clave:** demo123

## 🛠️ Deployment en VPS

### Opción 1: Script Automático (Recomendado)

```bash
# 1. Subir archivos al VPS en /proyectos1/quipus/
scp -r quipus/ root@167.86.90.102:/proyectos1/

# 2. Conectar al VPS
ssh root@167.86.90.102

# 3. Ejecutar script de deployment
cd /proyectos1/quipus
chmod +x deploy-vps-complete.sh
./deploy-vps-complete.sh
```

### Opción 2: Deployment Manual

```bash
# En el VPS como root

# 1. Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 2. Instalar MongoDB
apt-get update && apt-get install -y mongodb
sed -i 's/bind_ip = 127.0.0.1/bind_ip = 0.0.0.0/' /etc/mongodb.conf
systemctl restart mongodb
systemctl enable mongodb

# 3. Instalar PM2
npm install -g pm2 serve

# 4. Configurar firewall
ufw --force enable
ufw allow ssh
ufw allow 5000
ufw allow 5001
ufw allow 27017

# 5. Instalar dependencias del proyecto
cd /proyectos1/quipus/backend
npm install
cd ../frontend
npm install
npm run build

# 6. Setup MongoDB
mongosh < ../mongodb-setup.js

# 7. Iniciar servicios con PM2
pm2 start ../ecosystem.config.js
pm2 save
pm2 startup
```

## 🧪 Testing del Deployment

### Test Backend
```bash
# Ejecutar script de testing
./test-api.sh http://167.86.90.102:5001

# O pruebas manuales
curl http://167.86.90.102:5001/health
curl http://167.86.90.102:5001/api/invoices
```

### Test Frontend
```bash
# Verificar que el frontend esté sirviendo
curl -I http://167.86.90.102:5000

# Abrir en navegador
open http://167.86.90.102:5000
```

### Test MongoDB
```bash
# Conectar desde WSL/local
mongosh --host 167.86.90.102 --port 27017

# Verificar datos
use quipu_db
db.users.find()
db.invoices.find()
```

## 📊 APIs Disponibles

### Autenticación
- `POST /api/auth/login` - Login estándar
- `POST /api/auth/login/sunat` - Login SUNAT
- `GET /api/user/profile` - Perfil usuario

### Gestión
- `GET /api/invoices` - Lista facturas/boletas
- `GET /api/declarations` - Lista declaraciones
- `GET /api/metrics` - Métricas del negocio
- `GET /api/alerts` - Alertas y notificaciones

### Chat Kappi
- `POST /api/chat/message` - Enviar mensaje a Kappi

### Salud
- `GET /health` - Estado del servidor

## 🔧 Gestión del Sistema

### PM2 Commands
```bash
pm2 list                    # Ver servicios
pm2 restart all             # Reiniciar todos
pm2 logs                    # Ver logs
pm2 monit                   # Monitor en tiempo real
```

### MongoDB Commands
```bash
systemctl status mongodb    # Estado de MongoDB
mongosh                     # Cliente MongoDB
```

### Logs
```bash
# Logs de PM2
pm2 logs quipu-backend
pm2 logs quipu-frontend

# Logs del sistema
tail -f /var/log/mongodb/mongodb.log
```

## 🏗️ Estructura del Proyecto

```
quipus/
├── 📁 backend/
│   ├── package.json
│   ├── server-simple.js          # Servidor Express con APIs mock
│   └── node_modules/
├── 📁 frontend/
│   ├── package.json
│   ├── vite.config.ts            # Config Vite (puerto 5000)
│   ├── src/
│   │   ├── app/store/            # Zustand stores
│   │   ├── pages/                # Páginas React
│   │   ├── shared/lib/api/       # APIs del frontend
│   │   └── ...
│   ├── dist/                     # Build producción
│   └── node_modules/
├── 📄 mongodb-setup.js           # Script setup MongoDB
├── 📄 ecosystem.config.js        # Configuración PM2
├── 📄 deploy-vps-complete.sh     # Script deployment
├── 📄 test-api.sh               # Script testing APIs
└── 📄 README-DEPLOYMENT.md      # Esta guía
```

## 🔄 Actualizaciones

Para actualizar el proyecto:

```bash
# 1. Subir nuevos archivos
scp -r quipus/ root@167.86.90.102:/proyectos1/

# 2. En el VPS
cd /proyectos1/quipus
npm run build --prefix frontend
pm2 restart all
```

## 🐛 Troubleshooting

### Puerto ocupado
```bash
lsof -ti:5000 | xargs kill -9
lsof -ti:5001 | xargs kill -9
```

### MongoDB no conecta
```bash
# Verificar configuración
cat /etc/mongodb.conf | grep bind_ip
# Debe mostrar: bind_ip = 0.0.0.0

# Reiniciar MongoDB
systemctl restart mongodb
```

### Frontend no carga
```bash
# Verificar build
cd /proyectos1/quipus/frontend
npm run build
pm2 restart quipu-frontend
```

### CORS errors
```bash
# Verificar variables de entorno
echo $VITE_API_URL
# Debe ser: http://167.86.90.102:5001/api
```

## 🎉 ¡Listo!

Tu aplicación Quipu.ai está completamente funcional con:

✅ **Frontend responsive en puerto 5000**  
✅ **Backend API completa en puerto 5001**  
✅ **MongoDB con datos de prueba en puerto 27017**  
✅ **Sistema de gestión con PM2**  
✅ **Firewall configurado**  
✅ **Scripts de testing y deployment**  

**URL principal:** http://167.86.90.102:5000

---

*Proyecto desarrollado con Claude Code - Ready for production! 🚀*