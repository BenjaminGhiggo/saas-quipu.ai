import React, { useState } from 'react';
import { ArrowLeft, Calculator, Save, Send, User, Building } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceForm {
  type: 'boleta' | 'factura';
  client: {
    documentType: 'DNI' | 'RUC';
    documentNumber: string;
    name: string;
    address?: string;
    email?: string;
  };
  items: InvoiceItem[];
  amounts: {
    subtotal: number;
    igv: number;
    total: number;
  };
}

interface CreateInvoiceFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({ onBack, onSuccess }) => {
  const [form, setForm] = useState<InvoiceForm>({
    type: 'boleta',
    client: {
      documentType: 'DNI',
      documentNumber: '',
      name: '',
      address: '',
      email: ''
    },
    items: [
      {
        id: '1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      }
    ],
    amounts: {
      subtotal: 0,
      igv: 0,
      total: 0
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calcular totales automáticamente
  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const igv = subtotal * 0.18; // 18% IGV
    const total = subtotal + igv;
    
    return { subtotal, igv, total };
  };

  // Actualizar item
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calcular total del item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    // Calcular totales generales
    const amounts = calculateTotals(newItems);
    
    setForm(prev => ({
      ...prev,
      items: newItems,
      amounts
    }));
  };

  // Agregar item
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    
    setForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Remover item
  const removeItem = (index: number) => {
    if (form.items.length > 1) {
      const newItems = form.items.filter((_, i) => i !== index);
      const amounts = calculateTotals(newItems);
      
      setForm(prev => ({
        ...prev,
        items: newItems,
        amounts
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.client.documentNumber) {
      newErrors.documentNumber = 'Número de documento es requerido';
    }
    
    if (!form.client.name) {
      newErrors.name = 'Nombre es requerido';
    }
    
    if (form.type === 'factura' && form.client.documentType === 'DNI') {
      newErrors.documentType = 'Las facturas requieren RUC';
    }
    
    form.items.forEach((item, index) => {
      if (!item.description) {
        newErrors[`item_${index}_description`] = 'Descripción es requerida';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Cantidad debe ser mayor a 0';
      }
      if (item.unitPrice <= 0) {
        newErrors[`item_${index}_unitPrice`] = 'Precio debe ser mayor a 0';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (action: 'draft' | 'send') => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('http://167.86.90.102:5001/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          ...form,
          status: action === 'draft' ? 'draft' : 'sent',
          sunat: {
            status: action === 'draft' ? 'pending' : 'sent'
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // If creating and sending, also generate PDF
        if (action === 'send') {
          try {
            const pdfResponse = await fetch(`http://167.86.90.102:5001/api/invoices/${result.data._id}/pdf`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
              }
            });

            if (pdfResponse.ok) {
              const blob = await pdfResponse.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${result.data.type}_${result.data.series}_${result.data.number}.pdf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            }
          } catch (pdfError) {
            console.error('Error downloading PDF:', pdfError);
            // Don't fail the whole operation if PDF fails
          }
        }
        
        onSuccess();
      } else {
        throw new Error(result.message || 'Error al crear el comprobante');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'Error al crear el comprobante' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Crear Comprobante</h1>
          <p className="text-sm text-gray-600">Ingresa los datos manualmente</p>
        </div>
      </div>

      {/* Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Tipo de Comprobante
        </label>
        <div className="flex space-x-4">
          <button
            onClick={() => setForm(prev => ({ ...prev, type: 'boleta' }))}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
              form.type === 'boleta' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Boleta</span>
          </button>
          <button
            onClick={() => setForm(prev => ({ ...prev, type: 'factura' }))}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
              form.type === 'factura' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 text-gray-700'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Factura</span>
          </button>
        </div>
      </div>

      {/* Client Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Datos del Cliente</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento
            </label>
            <select
              value={form.client.documentType}
              onChange={(e) => setForm(prev => ({
                ...prev,
                client: { ...prev.client, documentType: e.target.value as 'DNI' | 'RUC' }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
            </select>
            {errors.documentType && (
              <p className="text-red-500 text-sm mt-1">{errors.documentType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Documento
            </label>
            <input
              type="text"
              value={form.client.documentNumber}
              onChange={(e) => setForm(prev => ({
                ...prev,
                client: { ...prev.client, documentNumber: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={form.client.documentType === 'DNI' ? '12345678' : '20123456789'}
            />
            {errors.documentNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.documentNumber}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre/Razón Social
          </label>
          <input
            type="text"
            value={form.client.name}
            onChange={(e) => setForm(prev => ({
              ...prev,
              client: { ...prev.client, name: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ingresa el nombre completo o razón social"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {form.type === 'factura' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              value={form.client.address}
              onChange={(e) => setForm(prev => ({
                ...prev,
                client: { ...prev.client, address: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Dirección fiscal"
            />
          </div>
        )}
      </div>

      {/* Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Productos/Servicios</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={addItem}
            className="text-blue-600"
          >
            + Agregar Item
          </Button>
        </div>

        {form.items.map((item, index) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
              {form.items.length > 1 && (
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Eliminar
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción del producto o servicio"
              />
              {errors[`item_${index}_description`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`item_${index}_description`]}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  step="1"
                />
                {errors[`item_${index}_quantity`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`item_${index}_quantity`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Unit.
                </label>
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
                {errors[`item_${index}_unitPrice`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`item_${index}_unitPrice`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total
                </label>
                <input
                  type="text"
                  value={`S/ ${item.total.toFixed(2)}`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex items-center space-x-2 text-gray-700">
          <Calculator className="w-4 h-4" />
          <span className="font-medium">Resumen</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>S/ {form.amounts.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>IGV (18%):</span>
            <span>S/ {form.amounts.igv.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t pt-2">
            <span>Total:</span>
            <span>S/ {form.amounts.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-4">
        <Button
          variant="secondary"
          onClick={() => handleSubmit('draft')}
          disabled={loading}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar Borrador
        </Button>
        <Button
          onClick={() => handleSubmit('send')}
          disabled={loading}
          className="flex-1"
        >
          <Send className="w-4 h-4 mr-2" />
          Crear y Enviar
        </Button>
      </div>
    </div>
  );
};