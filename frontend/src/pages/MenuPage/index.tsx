import React from 'react';
import { 
  User, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  FileText, 
  Shield, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/shared/ui/Button';

export const MenuPage: React.FC = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: 'profile',
      title: 'Mi Perfil',
      description: 'Información personal y de empresa',
      icon: <User className="w-5 h-5" />,
      path: '/perfil',
    },
    {
      id: 'subscription',
      title: 'Suscripción',
      description: 'Plan actual y facturación',
      icon: <CreditCard className="w-5 h-5" />,
      path: '/suscripcion',
    },
    {
      id: 'settings',
      title: 'Configuración',
      description: 'Preferencias y notificaciones',
      icon: <Settings className="w-5 h-5" />,
      path: '/configuracion',
    },
    {
      id: 'documents',
      title: 'Mis Documentos',
      description: 'Comprobantes y declaraciones',
      icon: <FileText className="w-5 h-5" />,
      path: '/historial',
    },
    {
      id: 'help',
      title: 'Ayuda y Soporte',
      description: 'FAQ y contacto',
      icon: <HelpCircle className="w-5 h-5" />,
      path: '/faq',
    },
    {
      id: 'privacy',
      title: 'Privacidad y Seguridad',
      description: 'Términos y condiciones',
      icon: <Shield className="w-5 h-5" />,
      path: '/privacidad',
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the auth provider
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* User Profile Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-bold text-xl">
              {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {user?.fullName || 'Usuario'}
            </h2>
            <p className="text-gray-600 text-sm">
              {user?.email}
            </p>
            {user?.businessName && (
              <p className="text-gray-500 text-sm">
                {user.businessName}
              </p>
            )}
          </div>
        </div>

        {/* Subscription Badge */}
        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
          Plan {user?.subscription?.planType ? user.subscription.planType.charAt(0).toUpperCase() + user.subscription.planType.slice(1) : 'Emprende'}
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.path) {
                window.location.href = item.path;
              }
            }}
            className="w-full bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="text-gray-600">
                {item.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>
              </div>
              
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>

      {/* App Info */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <h4 className="font-semibold text-gray-900 mb-2">
          Quipu.ai
        </h4>
        <p className="text-gray-600 text-sm mb-2">
          Versión 1.0.0
        </p>
        <p className="text-gray-500 text-xs">
          © 2024 Quipu.ai - Tu contador virtual con IA
        </p>
      </div>

      {/* Logout Button */}
      <div className="pt-4">
        <Button
          variant="ghost"
          fullWidth
          icon={<LogOut className="w-5 h-5" />}
          onClick={handleLogout}
          className="text-red-600 hover:bg-red-50"
        >
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};