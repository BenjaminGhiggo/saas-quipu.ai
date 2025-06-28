import React from 'react';
import { Bell, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export const AlertasPage: React.FC = () => {
  const alerts = [
    {
      id: '1',
      title: 'Declaración de abril vence pronto',
      description: 'Tu declaración mensual vence el 19 de mayo',
      type: 'declaration_due',
      priority: 'high',
      date: '2024-05-19',
      isRead: false,
      time: '2 días',
    },
    {
      id: '2',
      title: 'Nuevo comprobante procesado',
      description: 'Se procesó correctamente la boleta B001-00000124',
      type: 'system',
      priority: 'medium',
      date: new Date().toISOString(),
      isRead: false,
      time: '1 hora',
    },
    {
      id: '3',
      title: 'Pago de suscripción exitoso',
      description: 'Tu plan Quipu Crece se renovó automáticamente',
      type: 'payment',
      priority: 'low',
      date: new Date().toISOString(),
      isRead: true,
      time: '3 días',
    },
  ];

  const getAlertIcon = (type: string, priority: string) => {
    if (priority === 'high') {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    if (type === 'declaration_due') {
      return <Calendar className="w-5 h-5 text-yellow-500" />;
    }
    if (type === 'system') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <Bell className="w-5 h-5 text-blue-500" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Alertas
          </h1>
          <p className="text-gray-600 text-sm">
            {alerts.filter(a => !a.isRead).length} alertas sin leer
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Mark all as read
            console.log('Mark all as read');
          }}
        >
          Marcar todas como leídas
        </Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border-l-4 transition-all duration-200 ${
              getPriorityColor(alert.priority)
            } ${
              alert.isRead ? 'opacity-60' : 'shadow-sm'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.type, alert.priority)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-semibold ${
                    alert.isRead ? 'text-gray-600' : 'text-gray-900'
                  }`}>
                    {alert.title}
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {alert.time}
                    </span>
                    {!alert.isRead && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                
                <p className={`text-sm ${
                  alert.isRead ? 'text-gray-500' : 'text-gray-700'
                }`}>
                  {alert.description}
                </p>

                {alert.type === 'declaration_due' && !alert.isRead && (
                  <div className="mt-3 flex space-x-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => window.location.href = '/declarar'}
                    >
                      Ir a declarar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        // Snooze alert
                        console.log('Snooze alert');
                      }}
                    >
                      Recordar después
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (if no alerts) */}
      {alerts.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes alertas
          </h3>
          <p className="text-gray-600">
            Te notificaremos cuando haya algo importante.
          </p>
        </div>
      )}

      {/* Settings */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <h4 className="font-semibold text-gray-900 mb-2">
          Configuración de alertas
        </h4>
        <p className="text-gray-600 text-sm mb-3">
          Personaliza qué notificaciones quieres recibir y cuándo.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-600"
        >
          Configurar alertas
        </Button>
      </div>
    </div>
  );
};