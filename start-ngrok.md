# 🌐 Configuración Ngrok para Quipu.ai

## Pasos para exponer la aplicación con ngrok:

### 1. Instalar ngrok
```bash
# En Ubuntu/WSL:
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Registrarse en https://ngrok.com y obtener el authtoken
ngrok authtoken TU_AUTH_TOKEN
```

### 2. Iniciar los servidores locales
```bash
# Terminal 1 - Backend
cd backend
node server-simple.js

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 3. Exponer con ngrok
```bash
# Terminal 3 - Backend ngrok
ngrok http 3001

# Terminal 4 - Frontend ngrok  
ngrok http 3000
```

### 4. Configurar las URLs
Después de ejecutar ngrok, obtendrás URLs como:
- Backend: `https://abc123.ngrok.io` 
- Frontend: `https://def456.ngrok.io`

### 5. Actualizar configuración
Edita `frontend/.env.local`:
```env
VITE_API_URL=https://abc123.ngrok.io/api
```

### 6. Reiniciar frontend
```bash
# Ctrl+C para parar el frontend y luego:
npm run dev
```

## 🔧 Troubleshooting

### Error CORS
- Verifica que las URLs ngrok estén en el backend CORS (ya configurado con regex)
- Asegúrate de usar https:// en las URLs de ngrok

### Error 404 en rutas
- El archivo `_redirects` ya está configurado
- Verifica que ngrok esté apuntando al puerto correcto (3000)

### Error de proxy
- Si usas el proxy de Vite, cambia a usar VITE_API_URL directamente
- El httpClient ya está configurado para usar la variable de entorno

## 📱 URLs esperadas:
- **Frontend público:** https://def456.ngrok.io
- **Backend API:** https://abc123.ngrok.io/api
- **Health check:** https://abc123.ngrok.io/health