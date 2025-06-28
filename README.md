# Quipu.ai - Contador Virtual

Aplicación de contabilidad virtual que permite gestionar boletas, facturas, declaraciones de impuestos y métricas financieras con la ayuda de Kappi, un asistente de IA.

## 🚀 Quick Start

```bash
# 1. Levantar MongoDB
docker-compose up -d

# 2. Backend
cd backend && npm install && npm run dev

# 3. Frontend  
cd frontend && npm install && npm run dev
```

## 📱 Características

- **Gestión de Comprobantes**: Emisión de boletas y facturas
- **Declaraciones de Impuestos**: Cálculo automático de IGV, ISRL
- **Chat Kappi**: Asistente IA para consultas contables
- **Métricas**: Análisis de ventas, compras y gráficas
- **Historial**: Búsqueda y filtrado por fechas
- **Alertas**: Recordatorios de vencimientos
- **Suscripciones**: Planes Emprende, Crece, Pro

## 🏗️ Arquitectura

- **Frontend**: React + TypeScript + Vite + Tailwind
- **Backend**: Node.js + Express + MongoDB
- **Base de datos**: MongoDB (puerto 27017)
- **Estado**: Zustand
- **Gráficas**: Recharts
- **Iconos**: Lucide React

## 🎨 Diseño

Diseño mobile-first basado en 65 prototipos con:
- Gradiente naranja-amarillo
- Cards blancas con sombras
- Bottom navigation principal
- Kappi como mascota (oso peruano)