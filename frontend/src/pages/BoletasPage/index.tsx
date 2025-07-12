import React, { useState } from 'react';
import { Upload, Camera, Edit3, FileText } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { CreateInvoiceForm } from './CreateInvoiceForm';
import { UploadInvoiceForm } from './UploadInvoiceForm';

export const BoletasPage: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<'upload' | 'scan' | 'manual' | null>(null);
  const [currentView, setCurrentView] = useState<'selection' | 'create' | 'upload'>('selection');

  const methods = [
    {
      id: 'upload',
      title: 'Subir archivo',
      description: 'Sube un PDF, imagen o Excel',
      icon: <Upload className="w-8 h-8" />,
      color: 'bg-blue-500',
    },
    {
      id: 'scan',
      title: 'Escanear',
      description: 'Toma una foto del comprobante',
      icon: <Camera className="w-8 h-8" />,
      color: 'bg-green-500',
    },
    {
      id: 'manual',
      title: 'Manual',
      description: 'Ingresa los datos manualmente',
      icon: <Edit3 className="w-8 h-8" />,
      color: 'bg-orange-500',
    },
  ];

  const handleBackToSelection = () => {
    setCurrentView('selection');
    setSelectedMethod(null);
  };

  const handleInvoiceCreated = () => {
    setCurrentView('selection');
    setSelectedMethod(null);
    // TODO: Show success message or navigate to invoice list
  };

  if (currentView === 'create') {
    return (
      <CreateInvoiceForm
        onBack={handleBackToSelection}
        onSuccess={handleInvoiceCreated}
      />
    );
  }

  if (currentView === 'upload') {
    return (
      <UploadInvoiceForm
        onBack={handleBackToSelection}
        onSuccess={handleInvoiceCreated}
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Page Title */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <span className="text-blue-700 font-medium">Emisor de boletas/facturas</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¿Cómo quieres crear tu comprobante?
        </h1>
        <p className="text-gray-600">
          Elige el método que prefieras para crear boletas o facturas
        </p>
      </div>

      {/* Method Selection */}
      <div className="space-y-4">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id as any)}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-200 ${
              selectedMethod === method.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl text-white ${method.color}`}>
                {method.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  {method.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {method.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Continue Button */}
      {selectedMethod && (
        <div className="pt-4">
          <Button
            fullWidth
            size="lg"
            onClick={() => {
              if (selectedMethod === 'manual') {
                setCurrentView('create');
              } else if (selectedMethod === 'upload') {
                setCurrentView('upload');
              } else {
                // TODO: Implement scan method
                console.log(`Navigate to ${selectedMethod} method`);
              }
            }}
          >
            Continuar con {methods.find(m => m.id === selectedMethod)?.title}
          </Button>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-orange-50 p-4 rounded-xl">
        <p className="text-orange-800 text-sm">
          💡 <strong>Tip:</strong> Puedes combinar métodos. Por ejemplo, escanear primero y luego editar manualmente si es necesario.
        </p>
      </div>
    </div>
  );
};