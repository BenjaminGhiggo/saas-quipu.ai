import React from 'react';
import { Check, Zap, Crown, User } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { KappiAvatar } from '@/widgets/Chatbot';

export const SuscripcionPage: React.FC = () => {
  const plans = [
    {
      name: 'Plan Quipu Emprende',
      icon: <User className="w-8 h-8" />,
      color: 'bg-blue-500',
      price: 29,
      features: [
        'Hasta 50 comprobantes/mes',
        'Declaraciones automáticas',
        'Soporte básico',
        'Kappi IA básico',
      ],
    },
    {
      name: 'Plan Quipu Crece',
      icon: <Zap className="w-8 h-8" />,
      color: 'bg-green-500',
      price: 59,
      popular: true,
      features: [
        'Hasta 200 comprobantes/mes',
        'Declaraciones automáticas',
        'Soporte prioritario',
        'Kappi IA avanzado',
        'Reportes detallados',
      ],
    },
    {
      name: 'Plan Quipu Pro',
      icon: <Crown className="w-8 h-8" />,
      color: 'bg-purple-500',
      price: 99,
      features: [
        'Comprobantes ilimitados',
        'Declaraciones automáticas',
        'Soporte premium 24/7',
        'Kappi IA completo',
        'API personalizada',
        'Contador dedicado',
      ],
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Suscripción
        </h1>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <KappiAvatar size="sm" expression="happy" />
          <p className="text-gray-600">
            Nos acomodamos a tus necesidades
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="space-y-4">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative bg-white rounded-xl border-2 p-6 ${
              plan.popular 
                ? 'border-green-500 shadow-lg' 
                : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Más Popular
                </span>
              </div>
            )}

            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className={`p-3 rounded-xl text-white ${plan.color}`}>
                {plan.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    S/ {plan.price}
                  </span>
                  <span className="text-gray-600">
                    /mes
                  </span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  fullWidth
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className={plan.popular ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  {plan.popular ? 'Elegir Plan' : 'Ver Plan'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="bg-orange-50 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <KappiAvatar size="sm" expression="thinking" />
          <div>
            <h4 className="font-semibold text-orange-900 mb-1">
              ¿Necesitas ayuda para elegir?
            </h4>
            <p className="text-orange-800 text-sm">
              Kappi puede ayudarte a encontrar el plan perfecto para tu negocio.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-orange-700 hover:bg-orange-100"
          onClick={() => window.location.href = '/chat'}
        >
          Consultar con Kappi
        </Button>
      </div>
    </div>
  );
};