import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export const MetricsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const periods = [
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
    { value: 'quarter', label: 'Trimestre' },
    { value: 'year', label: 'Año' },
  ];

  const metrics = {
    sales: {
      total: 45230.50,
      count: 127,
      growth: 12.5,
    },
    purchases: {
      total: 23450.30,
      count: 89,
      growth: -5.2,
    },
    taxes: {
      igv: 4072.14,
      rent: 678.46,
      total: 4750.60,
    },
  };

  const chartData = [
    { month: 'Ene', ventas: 4000, compras: 2400, igv: 720 },
    { month: 'Feb', ventas: 3000, compras: 1398, igv: 540 },
    { month: 'Mar', ventas: 2000, compras: 9800, igv: 360 },
    { month: 'Abr', ventas: 2780, compras: 3908, igv: 500 },
    { month: 'May', ventas: 1890, compras: 4800, igv: 340 },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          Métricas
        </h1>
        
        {/* Period Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4">
        {/* Sales */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">
              Ventas Totales
            </h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="metric-value">
            S/ {metrics.sales.total.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="metric-label">
              {metrics.sales.count} comprobantes
            </span>
            <span className="metric-change-positive">
              +{metrics.sales.growth}%
            </span>
          </div>
        </div>

        {/* Purchases */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">
              Compras Totales
            </h3>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div className="metric-value">
            S/ {metrics.purchases.total.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="metric-label">
              {metrics.purchases.count} comprobantes
            </span>
            <span className="metric-change-negative">
              {metrics.purchases.growth}%
            </span>
          </div>
        </div>

        {/* Taxes */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">
              Impuestos
            </h3>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="metric-value">
            S/ {metrics.taxes.total.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="metric-label">
              IGV: S/ {metrics.taxes.igv.toLocaleString()}
            </span>
            <span className="metric-label">
              Renta: S/ {metrics.taxes.rent.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Evolución Mensual
        </h3>
        
        {/* Simple bar chart visualization */}
        <div className="space-y-3">
          {chartData.map((data) => (
            <div key={data.month} className="flex items-center space-x-3">
              <span className="w-8 text-sm text-gray-600">
                {data.month}
              </span>
              
              <div className="flex-1 flex space-x-2">
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(data.ventas / 5000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    Ventas: S/ {data.ventas.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(data.compras / 10000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    Compras: S/ {data.compras.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <Button
          variant="primary"
          icon={<Calendar className="w-4 h-4" />}
          fullWidth
        >
          Exportar reporte
        </Button>
        <Button
          variant="ghost"
          fullWidth
          onClick={() => window.location.href = '/chat'}
        >
          Consultar con Kappi
        </Button>
      </div>
    </div>
  );
};