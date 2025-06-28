# 🚀 Guía de Despliegue - Quipu.ai

## 📋 Requisitos Previos

1. **Cuenta GitHub** - Para subir el código
2. **Cuenta MongoDB Atlas** - Base de datos en la nube (gratuita)
3. **Cuenta Vercel** - Para frontend (gratuita)
4. **Cuenta Railway/Render** - Para backend (gratuita)

## 🗄️ PASO 1: Configurar MongoDB Atlas

### 1.1 Crear cluster gratuito
```bash
# 1. Ve a https://cloud.mongodb.com/
# 2. Crea una cuenta gratuita
# 3. Crea un nuevo cluster (M0 - FREE)
# 4. Configura usuario y contraseña
# 5. Añade tu IP a la whitelist (0.0.0.0/0 para acceso completo)
```

### 1.2 Obtener cadena de conexión
```bash
# En MongoDB Atlas:
# 1. Cluster → Connect → Connect your application
# 2. Copia la cadena de conexión
# Ejemplo: mongodb+srv://username:password@cluster.mongodb.net/quipu_db
```

## 🖥️ PASO 2: Desplegar Backend

### Opción A: Railway (Recomendado)

```bash
# 1. Ve a https://railway.app/
# 2. Conecta tu cuenta GitHub
# 3. New Project → Deploy from GitHub repo
# 4. Selecciona tu repositorio
# 5. Configura variables de entorno:

PORT=3001
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/quipu_db
JWT_SECRET=tu-clave-secreta-muy-segura
CORS_ORIGIN=https://tu-frontend-url.vercel.app
```

### Opción B: Render

```bash
# 1. Ve a https://render.com/
# 2. New → Web Service
# 3. Conecta GitHub y selecciona repo
# 4. Configuración:
#    - Build Command: cd backend && npm install && npm run build
#    - Start Command: cd backend && npm start
#    - Environment: Node
```

### Opción C: Heroku

```bash
# 1. Instala Heroku CLI
# 2. En la carpeta backend/:
heroku create tu-app-backend
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/quipu_db
heroku config:set JWT_SECRET=tu-clave-secreta
git subtree push --prefix backend heroku main
```

## 🌐 PASO 3: Desplegar Frontend

### Opción A: Vercel (Recomendado)

```bash
# 1. Ve a https://vercel.com/
# 2. Import Git Repository
# 3. Selecciona tu repositorio
# 4. Configuración:
#    - Framework Preset: Vite
#    - Root Directory: frontend
#    - Build Command: npm run build
#    - Output Directory: dist
#    - Environment Variables:
#      VITE_API_URL=https://tu-backend-url.railway.app/api
```

### Opción B: Netlify

```bash
# 1. Ve a https://netlify.com/
# 2. Sites → Add new site → Import from Git
# 3. Configuración:
#    - Base directory: frontend
#    - Build command: npm run build
#    - Publish directory: frontend/dist
```

## 🔧 PASO 4: Configuración Final

### 4.1 Actualizar variables de entorno

**Backend (.env.production):**
```env
MONGO_URI=tu-cadena-mongodb-atlas
JWT_SECRET=clave-super-secreta-de-produccion
CORS_ORIGIN=https://tu-frontend-url.vercel.app
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://tu-backend-url.railway.app/api
```

### 4.2 Verificar CORS
Asegúrate de que el backend permita requests desde tu dominio de frontend.

### 4.3 Test de conectividad
```bash
# Verifica que el backend responda:
curl https://tu-backend-url.railway.app/health

# Verifica que el frontend cargue:
curl https://tu-frontend-url.vercel.app
```

## 🎯 URLs Esperadas

Una vez desplegado, tendrás:

**Frontend:** `https://quipu-ai-frontend.vercel.app`
**Backend:** `https://quipu-ai-backend.railway.app`
**Health Check:** `https://quipu-ai-backend.railway.app/health`

## 🔐 Credenciales de Demo

**Login estándar:**
- Email: `demo@quipu.ai`
- Password: `password`

**Login SUNAT:**
- RUC: `12345678901`
- Usuario: `DEMO123`
- Clave: `demo123`

## 🐛 Troubleshooting

### Error de CORS
```bash
# En backend/.env.production, asegúrate de tener:
CORS_ORIGIN=https://tu-dominio-frontend-exacto.vercel.app
```

### Error de conexión MongoDB
```bash
# Verifica que:
# 1. La IP esté en la whitelist (0.0.0.0/0)
# 2. Usuario/contraseña sean correctos
# 3. El nombre de la base de datos coincida
```

### Error de build frontend
```bash
# En frontend/, verifica que todas las dependencias estén instaladas:
npm install
npm run build
```

### Error de build backend
```bash
# En backend/, verifica TypeScript:
npm run build
# Si hay errores, arregla los tipos y vuelve a intentar
```

## 🚀 Comandos Rápidos

```bash
# Clonar e instalar todo
git clone tu-repo
cd frontend && npm install
cd ../backend && npm install

# Desarrollo local
docker-compose up -d  # MongoDB
cd backend && npm run dev
cd frontend && npm run dev

# Build de producción
cd frontend && npm run build
cd backend && npm run build
```

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs en tu plataforma de hosting
2. Verifica las variables de entorno
3. Asegúrate de que MongoDB Atlas esté configurado correctamente
4. Verifica que el CORS esté configurado para tu dominio frontend

¡Tu aplicación Quipu.ai estará lista para demostrar! 🎉