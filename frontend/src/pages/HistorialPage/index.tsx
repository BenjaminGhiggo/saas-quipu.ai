import React, { useState } from 'react';
import { Calendar, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

export const HistorialPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'ventas' | 'compras' | 'total'>('ventas');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'ventas', label: 'Ventas', count: 45 },
    { id: 'compras', label: 'Compras', count: 23 },
    { id: 'total', label: 'Total', count: 68 },
  ];

  const mockData = [
    {
      id: '1',
      date: '2024-04-15',
      type: 'boleta',
      number: 'B001-00000123',
      client: 'Juan Pérez',
      amount: 118.00,
      status: 'accepted',
    },
    {
      id: '2',
      date: '2024-04-14',
      type: 'factura',
      number: 'F001-00000456',
      client: 'Empresa ABC SAC',
      amount: 590.00,
      status: 'accepted',
    },
    {
      id: '3',
      date: '2024-04-13',
      type: 'boleta',
      number: 'B001-00000122',
      client: 'María García',
      amount: 85.50,
      status: 'accepted',
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Calendar View Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          icon={<Calendar className="w-5 h-5" />}
          className="text-primary-600"
        >
          Ver calendario
        </Button>
        <Button
          variant="ghost"
          icon={<Download className="w-5 h-5" />}
          className="text-gray-600"
        >
          Exportar
        </Button>
      </div>

      {/* Date Filters */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desde
          </label>
          <Input
            type="date"
            defaultValue="2024-04-01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hasta
          </label>
          <Input
            type="date"
            defaultValue="2024-04-30"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por cliente, número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <Button
          variant="ghost"
          icon={<Filter className="w-5 h-5" />}
          className="px-3"
        >
          Filtros
        </Button>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {mockData.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.type === 'boleta' 
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {item.type.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(item.date).toLocaleDateString('es-PE')}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1">
                  {item.number}
                </h3>
                
                <p className="text-sm text-gray-600">
                  {item.client}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  S/ {item.amount.toFixed(2)}
                </p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Aceptado
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center pt-4">
        <Button variant="ghost">
          Cargar más registros
        </Button>
      </div>
    </div>
  );
};