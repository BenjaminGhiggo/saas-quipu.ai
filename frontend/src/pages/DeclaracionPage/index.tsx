import React from 'react';
import { Calendar, Download, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export const DeclaracionPage: React.FC = () => {
  const declarations = [
    {
      month: 'Abril',
      amount: 'S/ 2,422.89',
      dueDate: '19 mayo',
      status: 'pending',
      canDeclare: true,
    },
    {
      month: 'Marzo',
      amount: 'S/ 1,824.54',
      dueDate: 'Completado',
      status: 'completed',
      canDeclare: false,
    },
    {
      month: 'Febrero',
      amount: 'S/ 1,630.12',
      dueDate: 'Completado',
      status: 'completed',
      canDeclare: false,
    },
    {
      month: 'Enero',
      amount: 'S/ 1,630.12',
      dueDate: 'Completado',
      status: 'completed',
      canDeclare: false,
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full mb-4">
          <Calendar className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-700 font-medium">Declaración del mes</span>
        </div>
      </div>

      {/* Declarations List */}
      <div className="space-y-4">
        {declarations.map((declaration, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border ${
              declaration.status === 'pending'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {declaration.month}
                  </h3>
                  {declaration.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {declaration.status === 'pending' && (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                
                <p className="text-xl font-bold text-gray-900 mb-1">
                  {declaration.amount}
                </p>
                
                <p className={`text-sm ${
                  declaration.status === 'pending' 
                    ? 'text-yellow-700' 
                    : 'text-green-600'
                }`}>
                  {declaration.status === 'pending' 
                    ? `Fecha límite ${declaration.dueDate}`
                    : declaration.dueDate
                  }
                </p>
              </div>

              <div className="flex flex-col space-y-2">
                {declaration.canDeclare ? (
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    Declarar
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                  >
                    Descargar
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 p-4 rounded-xl">
        <h4 className="font-semibold text-blue-900 mb-2">
          ¿Necesitas ayuda?
        </h4>
        <p className="text-blue-800 text-sm mb-3">
          Kappi puede ayudarte a entender tus declaraciones y calcular los impuestos.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-700 hover:bg-blue-100"
          onClick={() => window.location.href = '/chat'}
        >
          Consultar con Kappi
        </Button>
      </div>
    </div>
  );
};