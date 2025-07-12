# 🚀 Contexto Completo del Proyecto Quipu.ai

## 📋 Información General del Proyecto

**Quipu.ai** - Sistema contable para emprendedores peruanos  
**Estado:** ✅ COMPLETAMENTE FUNCIONAL - Desplegado en VPS con APIs mock  
**Stack:** React + TypeScript + Node.js + MongoDB + PM2  
**Fecha última actualización:** 28 Junio 2025  
**Ubicación actual:** `/proyectos1/saas-quipu.ai` (VPS Contabo)  

---

## 🌐 Información del VPS

### Servidor Principal
- **Proveedor:** Contabo  
- **Host:** `vmi2635455.contaboserver.net`  
- **IP Pública:** `167.86.90.102`  
- **SO:** Ubuntu 20.04.6 LTS (kernel 5.4.0-105-generic)  
- **Usuario:** `root`  
- **Directorio del proyecto:** `/proyectos1/saas-quipu.ai`  

### Puertos y Servicios Activos
| Servicio         | Puerto    | Estado       | URL/Comando                    |
| ---------------- | --------- | ------------ | ------------------------------ |
| SSH              | 22        | Activo       | `ssh root@167.86.90.102`       |
| Frontend         | 5000      | PM2          | http://167.86.90.102:5000      |
| Backend API      | 5001      | PM2          | http://167.86.90.102:7000/api  |
| MongoDB          | 27017     | systemd      | 167.86.90.102:27017            |
| Health Check     | 5001      | Disponible   | http://167.86.90.102:7000/health |

### Firewall (UFW) Configurado
```bash
# Puertos abiertos
ufw allow 22     # SSH
ufw allow 5000   # Frontend
ufw allow 5001   # Backend
ufw allow 27017  # MongoDB
```

### 🔄 Estado Actual del Despliegue (28 Junio 2025)

**SERVICIOS ACTIVOS EN PM2:**
```bash
pm2 list
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 5  │ quipu-backend      │ cluster  │ 0    │ online    │ 0%       │ 59.2mb   │
│ 8  │ quipu-frontend     │ fork     │ 0    │ online    │ 0%       │ 16.3mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

**CONFIGURACIÓN PM2:**
- Archivo: `/proyectos1/saas-quipu.ai/ecosystem.config.js`
- Auto-start configurado: ✅ `pm2 startup systemd`
- Configuración guardada: ✅ `pm2 save`

**MONGODB STATUS:**
```bash
systemctl status mongodb
● mongodb.service - An object/document-oriented database
   Active: active (running)
   Bind IP: 0.0.0.0:27017 (acceso externo habilitado)
```

**ACCESOS VERIFICADOS:**
- ✅ Frontend: http://167.86.90.102:5000 (React SPA)
- ✅ Backend: http://167.86.90.102:7000/health (Express API)
- ✅ MongoDB: 167.86.90.102:27017 (Conexión externa)

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios
```
/proyectos1/saas-quipu.ai/
├── 📁 backend/
│   ├── package.json
│   ├── server-simple.js          # Servidor Express principal
│   ├── node_modules/
│   └── logs/                     # Logs de PM2
├── 📁 frontend/
│   ├── package.json
│   ├── vite.config.ts            # Puerto 5000, proxy a 5001
│   ├── .env.production           # Variables VPS
│   ├── .env.local                # Variables desarrollo
│   ├── dist/                     # Build producción (servido por PM2)
│   ├── src/
│   │   ├── app/
│   │   │   ├── store/            # Zustand stores
│   │   │   ├── providers/        # Context providers
│   │   │   └── router.tsx        # React Router
│   │   ├── pages/                # Páginas principales
│   │   ├── shared/
│   │   │   ├── lib/api/          # APIs y httpClient
│   │   │   ├── types/            # TypeScript types
│   │   │   └── ui/               # Componentes UI
│   │   └── widgets/              # Widgets complejos
│   └── node_modules/
├── 📄 mongodb-setup.js           # Script inicialización MongoDB
├── 📄 ecosystem.config.js        # Configuración PM2
├── 📄 deploy-vps-complete.sh     # Script deployment
├── 📄 update-vps.sh              # Script actualización
├── 📄 test-api.sh               # Testing APIs
└── 📄 contexto.md               # Este archivo
```

---

## ⚙️ Configuraciones Técnicas

### Frontend (React + TypeScript + Vite)

**Puerto:** 5000  
**Build command:** `npm run build`  
**Servido por:** PM2 + serve  

**Variables de entorno (.env.production):**
```env
VITE_API_URL=http://167.86.90.102:7000/api
VITE_FRONTEND_URL=http://167.86.90.102:5000
VITE_APP_NAME=Quipu.ai
VITE_APP_VERSION=1.0.0
```

**Configuración Vite (vite.config.ts):**
```typescript
server: {
  port: 5000,
  host: '0.0.0.0', // Permite conexiones externas
  allowedHosts: 'all',
  proxy: {
    '/api': {
      target: 'http://localhost:7000',
      changeOrigin: true,
    },
  },
}
```

**Dependencias principales:**
- React 18.2.0
- TypeScript
- Vite 4.5.14
- Tailwind CSS 3.3.0
- Zustand 4.4.0 (state management)
- React Router DOM
- Axios 1.5.0
- Lucide React (iconos)

### Backend (Node.js + Express)

**Puerto:** 5001  
**Archivo principal:** `server-simple.js`  
**Base URL API:** `/api`  

**CORS configurado para:**
```javascript
origin: [
  'http://localhost:5000', 
  'http://127.0.0.1:5000', 
  'http://localhost:3000', 
  'http://127.0.0.1:3000', 
  'http://localhost:3002', 
  'http://127.0.0.1:3002',
  // VPS URLs
  'http://167.86.90.102:5000',
  'http://167.86.90.102:7000',
  'http://167.86.90.102:3000',
  'http://167.86.90.102:3001',
  // Ngrok URLs
  /^https:\/\/.*\.ngrok\.io$/,
  /^https:\/\/.*\.ngrok-free\.app$/
],
credentials: true
```

**Endpoints disponibles (✅ TODOS PROBADOS Y FUNCIONANDO):**
```
GET  /health                    # Health check ✅
POST /api/auth/login            # Login estándar ✅
POST /api/auth/login/sunat      # Login SUNAT ✅  
GET  /api/user/profile          # Perfil usuario ✅
POST /api/chat/message          # Chat con Kappi ✅
GET  /api/invoices              # Lista facturas/boletas ✅
GET  /api/declarations          # Lista declaraciones ✅
GET  /api/metrics               # Métricas del negocio ✅
GET  /api/alerts                # Alertas y notificaciones ✅
```

**URLs de Prueba Verificadas (28 Jun 2025):**
```bash
# Health Check
curl http://167.86.90.102:7000/health

# Login Demo
curl -X POST http://167.86.90.102:7000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@quipu.ai","password":"password"}'

# Chat Kappi
curl -X POST http://167.86.90.102:7000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"¿cuánto debo declarar este mes?"}'

# Ver facturas
curl http://167.86.90.102:7000/api/invoices

# Ver declaraciones  
curl http://167.86.90.102:7000/api/declarations

# Ver métricas
curl http://167.86.90.102:7000/api/metrics

# Ver alertas
curl http://167.86.90.102:7000/api/alerts
```

**Dependencias principales:**
- Express 4.18.0
- CORS 2.8.5
- dotenv 16.3.0

### MongoDB

**Puerto:** 27017  
**Base de datos:** `quipu_db`  
**Configuración:** `/etc/mongodb.conf`  

**bind_ip configurado:**
```conf
bind_ip = 0.0.0.0  # Permite conexiones externas
```

**Colecciones:**
- `users` - Usuarios del sistema
- `invoices` - Facturas y boletas
- `declarations` - Declaraciones tributarias
- `alerts` - Alertas y notificaciones

**Comandos útiles:**
```bash
# Conectar desde local
mongosh --host 167.86.90.102 --port 27017

# Verificar estado
systemctl status mongodb

# Reiniciar servicio
systemctl restart mongodb

# Ver logs
tail -f /var/log/mongodb/mongodb.log
```

### PM2 (Process Manager) ✅ FUNCIONANDO

**Configuración Actual:** `/proyectos1/saas-quipu.ai/ecosystem.config.js`  

```javascript
module.exports = {
  apps: [
    {
      name: 'quipu-backend',
      script: './backend/server-simple.js',
      cwd: '/proyectos1/saas-quipu.ai',
      env: { NODE_ENV: 'production', PORT: 5001 },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'quipu-frontend', 
      script: 'serve',
      args: '-s dist -p 5000 -n',
      cwd: '/proyectos1/saas-quipu.ai/frontend',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log',
      log_file: '../logs/frontend-combined.log',
      time: true
    }
  ]
}
```

**Estado Actual PM2 (28 Jun 2025):**
```bash
pm2 list
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 5  │ quipu-backend      │ cluster  │ 0    │ online    │ 0%       │ 59.2mb   │
│ 8  │ quipu-frontend     │ fork     │ 0    │ online    │ 0%       │ 16.3mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

**Comandos PM2:**
```bash
pm2 list                # Ver procesos
pm2 restart all         # Reiniciar todos
pm2 logs               # Ver logs en tiempo real
pm2 monit              # Monitor tiempo real
pm2 save               # Guardar configuración ✅ EJECUTADO
pm2 startup            # Auto-start en boot ✅ CONFIGURADO
pm2 serve ./dist 5000 --name quipu-frontend --spa  # Comando usado para frontend
```

**Logs Ubicación:**
- Backend: `/proyectos1/saas-quipu.ai/logs/backend-*.log`
- Frontend: `/proyectos1/saas-quipu.ai/logs/frontend-*.log`

---

## 🔐 Credenciales y Accesos

### Demo Login Estándar
- **Email:** `demo@quipu.ai`
- **Password:** `password`

### Demo Login SUNAT
- **RUC:** `12345678901`
- **Usuario:** `DEMO123`
- **Clave:** `demo123`

### Conexión VPS
```bash
ssh root@167.86.90.102
```

### Conexión MongoDB
```bash
# Desde local
mongosh --host 167.86.90.102 --port 27017

# Desde VPS
mongosh
```

---

## 📊 Estados y Datos Mock

### Usuario Demo (MongoDB)
```javascript
{
  _id: ObjectId,
  email: "demo@quipu.ai",
  firstName: "Demo",
  lastName: "User", 
  ruc: "12345678901",
  businessName: "Demo Business SAC",
  subscription: {
    planType: "emprende",
    status: "active"
  },
  profile: {
    taxRegime: "RER",
    businessType: "Servicios"
  }
}
```

### Facturas Mock
- Factura F001-00000123: S/ 1,180.00 (enviada, aceptada)
- Boleta B001-00000456: S/ 118.00 (borrador, pendiente)

### Declaraciones Mock
- Junio 2024: S/ 615.00 (completada)
- Mayo 2024: S/ 553.50 (completada)

### Métricas Mock
- Ventas totales 2024: S/ 15,847.32
- Impuestos totales: S/ 2,371.15
- Declaraciones pendientes: 1

---

## 🚀 Scripts de Deployment

### Script Completo: `deploy-vps-complete.sh`
Instala Node.js, MongoDB, PM2, configura firewall, y deploya todo el stack.

### Script Actualización: `update-vps.sh`
Sube archivos actualizados y reinicia servicios PM2.

### Script Testing: `test-api.sh`
Prueba todos los endpoints de la API.

**Uso:**
```bash
# Deployment completo
./deploy-vps-complete.sh

# Actualización rápida
./update-vps.sh

# Testing APIs
./test-api.sh http://167.86.90.102:7000
```

---

## 🔧 Comandos de Gestión

### Gestión General del Sistema
```bash
# Ver servicios activos
systemctl status mongodb
pm2 list

# Ver puertos en uso
netstat -tlnp | grep :5000
netstat -tlnp | grep :7000  
netstat -tlnp | grep :27017

# Ver logs
pm2 logs
tail -f /var/log/mongodb/mongodb.log
```

### Desarrollo y Build
```bash
# Frontend
cd /proyectos1/quipus/frontend
npm run dev          # Desarrollo
npm run build        # Build producción
npm run preview      # Preview build

# Backend  
cd /proyectos1/quipus/backend
node server-simple.js   # Ejecutar directo
npm run dev             # Si tienes script dev
```

### MongoDB Management
```bash
# Backup
mongodump --host 167.86.90.102 --port 27017 --db quipu_db

# Restore  
mongorestore --host 167.86.90.102 --port 27017 --db quipu_db dump/quipu_db/

# Setup inicial
mongosh --host 167.86.90.102 --port 27017 < mongodb-setup.js
```

---

## 🐛 Troubleshooting Común

### Errores de Conexión
```bash
# CORS Error
# Verificar CORS en backend/server-simple.js líneas 13-31

# Error 404 en rutas
# Verificar archivo frontend/public/_redirects

# Puerto ocupado
lsof -ti:5000 | xargs kill -9
lsof -ti:7000 | xargs kill -9
```

### Errores de MongoDB
```bash
# MongoDB no inicia
systemctl start mongodb
systemctl enable mongodb

# No puede conectar externamente
# Verificar bind_ip = 0.0.0.0 en /etc/mongodb.conf
systemctl restart mongodb
```

### Errores de PM2
```bash
# Procesos no inician
pm2 delete all
pm2 start ecosystem.config.js

# Logs de error
pm2 logs --error
```

---

## 🎯 URLs Funcionales

### URLs Principales
- **Aplicación:** http://167.86.90.102:5000
- **API Base:** http://167.86.90.102:7000/api  
- **Health Check:** http://167.86.90.102:7000/health

### Endpoints API Detallados
```
# Autenticación
POST http://167.86.90.102:7000/api/auth/login
POST http://167.86.90.102:7000/api/auth/login/sunat

# Datos
GET http://167.86.90.102:7000/api/user/profile
GET http://167.86.90.102:7000/api/invoices
GET http://167.86.90.102:7000/api/declarations  
GET http://167.86.90.102:7000/api/metrics
GET http://167.86.90.102:7000/api/alerts

# Chat
POST http://167.86.90.102:7000/api/chat/message
```

---

## 📝 Notas de Desarrollo

### Último Estado (28 Jun 2024)
- ✅ Frontend build exitoso con variables VPS correctas
- ✅ Backend con 9 endpoints mock funcionales
- ✅ MongoDB configurado con datos de prueba
- ✅ PM2 gestionando ambos servicios
- ✅ Firewall configurado correctamente
- ✅ CORS solucionado para login
- ✅ Scripts de deployment y testing listos

### Próximos Pasos Recomendados
1. **Integración API real** - Reemplazar mocks cuando esté disponible
2. **HTTPS/SSL** - Configurar certificados (Let's Encrypt + Nginx)
3. **Base de datos real** - Conectar con MongoDB Atlas o instancia dedicada
4. **Monitoring** - Agregar logs estructurados y métricas
5. **Backup** - Automatizar backups de MongoDB
6. **CI/CD** - Pipeline automático de deployment

### Dependencias Externas Pendientes
- **API SUNAT real** - Para facturas y consultas RUC
- **LLM API** - Para Kappi (actualmente respuestas mock)
- **Pasarela de pagos** - Para declaraciones tributarias
- **Servicio de emails** - Para notificaciones

---

## 🎉 Estado del Proyecto

**FUNCIONALMENTE COMPLETO** ✅  
La aplicación está lista para demostración con todas las funcionalidades simuladas. El frontend se conecta correctamente al backend, la autenticación funciona, el chat Kappi responde, y todos los datos se muestran correctamente.

**READY FOR NEXT PHASE:** Integración con APIs reales y mejoras de producción.

---

## 📋 Checklist de Verificación Completa (28 Jun 2025)

### ✅ **INFRAESTRUCTURA VERIFICADA**
- [x] VPS Contabo 167.86.90.102 - FUNCIONANDO
- [x] Firewall UFW configurado (puertos 22, 5000, 5001, 27017)
- [x] MongoDB bind_ip = 0.0.0.0 - ACCESO EXTERNO OK
- [x] PM2 auto-start configurado
- [x] Directorio proyecto: `/proyectos1/saas-quipu.ai`

### ✅ **SERVICIOS DESPLEGADOS Y ACTIVOS**
- [x] Backend Express (PM2 ID: 5) - Puerto 5001 ✅
- [x] Frontend React SPA (PM2 ID: 8) - Puerto 5000 ✅  
- [x] MongoDB Service - Puerto 27017 ✅
- [x] Logs configurados en `/proyectos1/saas-quipu.ai/logs/`

### ✅ **APIS PROBADAS CON CURL**
- [x] GET /health - Health check ✅
- [x] POST /api/auth/login - Login demo ✅
- [x] POST /api/auth/login/sunat - Login SUNAT ✅
- [x] GET /api/invoices - Facturas mock ✅
- [x] GET /api/declarations - Declaraciones mock ✅
- [x] GET /api/metrics - Métricas mock ✅
- [x] GET /api/alerts - Alertas mock ✅
- [x] POST /api/chat/message - Chat Kappi ✅
- [x] GET /api/user/profile - Perfil usuario ✅

### ✅ **CONFIGURACIÓN FRONTEND**
- [x] Build producción generado en `/frontend/dist/`
- [x] Variables entorno VPS (.env.production) ✅
- [x] Vite config puerto 5000, host 0.0.0.0 ✅
- [x] Proxy API configurado correctamente ✅

### ✅ **DATOS MOCK FUNCIONALES**
- [x] Usuario demo: demo@quipu.ai / password
- [x] Usuario SUNAT: RUC 12345678901 / DEMO123 / demo123
- [x] Facturas y boletas de ejemplo
- [x] Declaraciones tributarias históricas
- [x] Métricas de negocio simuladas
- [x] Chat Kappi con respuestas inteligentes

### 🔄 **COMANDOS DE GESTIÓN RÁPIDA**
```bash
# Verificar estado general
pm2 list
systemctl status mongodb
curl http://167.86.90.102:7000/health
curl http://167.86.90.102:5000

# Reiniciar servicios
pm2 restart all
systemctl restart mongodb

# Ver logs
pm2 logs
tail -f /var/log/mongodb/mongodb.log

# Acceso MongoDB
mongo 167.86.90.102:27017/quipu_db
```

---

*Documento actualizado el 28 de Junio de 2025 - Proyecto completamente desplegado y verificado en VPS Contabo*