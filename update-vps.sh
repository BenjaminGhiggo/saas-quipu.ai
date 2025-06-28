#!/bin/bash

# Script para actualizar Quipu.ai en VPS
# Ejecutar desde tu máquina local

VPS_IP="167.86.90.102"
VPS_USER="root"
PROJECT_DIR="/proyectos1/quipus"

echo "🚀 Actualizando Quipu.ai en VPS..."

# 1. Subir archivos actualizados
echo "📤 Subiendo archivos al VPS..."
scp -r backend/server-simple.js ${VPS_USER}@${VPS_IP}:${PROJECT_DIR}/backend/
scp -r frontend/.env.production ${VPS_USER}@${VPS_IP}:${PROJECT_DIR}/frontend/
scp -r frontend/dist/ ${VPS_USER}@${VPS_IP}:${PROJECT_DIR}/frontend/
scp mongodb-setup.js ${VPS_USER}@${VPS_IP}:${PROJECT_DIR}/

# 2. Reiniciar servicios en VPS
echo "🔄 Reiniciando servicios..."
ssh ${VPS_USER}@${VPS_IP} << 'EOF'
cd /proyectos1/quipus
pm2 restart quipu-backend
pm2 restart quipu-frontend
pm2 list
echo "✅ Servicios reiniciados"
EOF

echo "🎉 Actualización completada!"
echo "Frontend: http://${VPS_IP}:5000"
echo "Backend: http://${VPS_IP}:5001/api"

# Test de conectividad
echo "🧪 Probando conectividad..."
curl -s http://${VPS_IP}:5001/health | grep -q "ok" && echo "✅ Backend OK" || echo "❌ Backend Error"
curl -s -I http://${VPS_IP}:5000 | grep -q "200 OK" && echo "✅ Frontend OK" || echo "❌ Frontend Error"