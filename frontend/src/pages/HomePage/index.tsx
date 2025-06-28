import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  History, 
  CreditCard, 
  BarChart3, 
  HelpCircle,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { KappiAvatar } from '@/widgets/Chatbot';

interface QuickActionCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const quickActions: QuickActionCard[] = [
  {
    id: 'emisor',
    title: 'Emisión de',
    subtitle: 'boletas y Facturas',
    icon: <FileText className="w-8 h-8" />,
    path: '/boletas',
    color: 'bg-blue-500',
  },
  {
    id: 'historial',
    title: 'Historial de',
    subtitle: 'comprobantes',
    icon: <History className="w-8 h-8" />,
    path: '/historial',
    color: 'bg-green-500',
  },
  {
    id: 'suscripcion',
    title: 'Suscripción',
    subtitle: '',
    icon: <CreditCard className="w-8 h-8" />,
    path: '/suscripcion',
    color: 'bg-purple-500',
  },
  {
    id: 'kappi',
    title: 'Kappi',
    subtitle: '',
    icon: <KappiAvatar size="sm" showHat={false} />,
    path: '/chat',
    color: 'bg-orange-500',
  },
  {
    id: 'faq',
    title: 'Preguntas frecuentes',
    subtitle: '',
    icon: <HelpCircle className="w-8 h-8" />,
    path: '/faq',
    color: 'bg-indigo-500',
  },
  {
    id: 'metricas',
    title: 'Métricas',
    subtitle: '',
    icon: <BarChart3 className="w-8 h-8" />,
    path: '/metricas',
    color: 'bg-teal-500',
  },
];

const additionalActions = [
  {
    id: 'declaracion',
    title: 'Declaración del mes',
    icon: <Calendar className="w-6 h-6" />,
    path: '/declarar',
    color: 'bg-yellow-500',
  },
  {
    id: 'alertas',
    title: 'Alertas',
    icon: <Calendar className="w-6 h-6" />,
    path: '/alertas',
    color: 'bg-red-500',
  },
  {
    id: 'configuracion',
    title: 'Configuración',
    icon: <Calendar className="w-6 h-6" />,
    path: '/menu',
    color: 'bg-gray-500',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Buenos días';
    
    if (hour >= 12 && hour < 18) {
      greeting = 'Buenas tardes';
    } else if (hour >= 18) {
      greeting = 'Buenas noches';
    }

    return `${greeting}, ${user?.firstName || 'Usuario'}!`;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <div className="mb-4 text-primary-900">
          <span className="bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium">
            Principal
          </span>
        </div>
        
        <div className="flex items-center justify-center space-x-3 mb-4">
          <h2 className="text-2xl font-bold text-primary-900">
            ¡Hola! soy Kappi,
          </h2>
          <KappiAvatar size="md" expression="happy" />
        </div>
        
        <p className="text-lg text-primary-700">
          tu contador<br />
          virtual...
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleCardClick(action.path)}
            className="bg-white rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all duration-200 text-left group"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className={`p-3 rounded-xl ${action.color} text-white group-hover:scale-105 transition-transform`}>
                {action.icon}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                  {action.title}
                </h3>
                {action.subtitle && (
                  <p className="text-gray-600 text-xs mt-1">
                    {action.subtitle}
                  </p>
                )}
              </div>
              <button className="w-full bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                {action.id === 'emisor' ? 'Crear' : 'Ver'}
              </button>
            </div>
          </button>
        ))}
      </div>

      {/* Additional Actions */}
      <div className="space-y-3">
        {additionalActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleCardClick(action.path)}
            className="w-full bg-white rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all duration-200 flex items-center space-x-4"
          >
            <div className={`p-2 rounded-lg ${action.color} text-white`}>
              {action.icon}
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900">
                {action.title}
              </h3>
            </div>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              Ver
            </button>
          </button>
        ))}
      </div>

      {/* Welcome Message */}
      <div className="text-center py-4">
        <p className="text-gray-600">
          {getWelcomeMessage()}
        </p>
      </div>
    </div>
  );
};