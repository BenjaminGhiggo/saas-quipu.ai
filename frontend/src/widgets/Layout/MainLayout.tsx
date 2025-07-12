import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/widgets/Header';
import { BottomNavigation } from '@/widgets/Navigation';
import { KappiAvatar } from '@/widgets/Chatbot';
import { useAuth } from '@/app/providers/AuthProvider';

interface MainLayoutProps {
  children: React.ReactNode;
}

// Define which pages should show the Kappi avatar
const pagesWithKappi = ['/', '/declarar', '/boletas', '/facturas', '/historial', '/metricas'];

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const showKappi = pagesWithKappi.includes(location.pathname);
  const isHomePage = location.pathname === '/';

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return undefined; // Show logo on home
      case '/chat':
        return 'Asistente Kappi';
      case '/declarar':
        return 'Declaración del mes';
      case '/boletas':
        return 'Emisor de boletas/facturas';
      case '/facturas':
        return 'Emisor de boletas/facturas';
      case '/historial':
        return 'Historial de comprobantes';
      case '/suscripcion':
        return 'Suscripción';
      case '/alertas':
        return 'Alertas';
      case '/metricas':
        return 'Métricas';
      case '/faq':
        return 'Preguntas frecuentes';
      case '/menu':
        return 'Menú';
      case '/perfil':
        return 'Mi Perfil';
      case '/sunat-config':
        return 'Configuración SUNAT';
      case '/sire':
        return 'SIRE VENTAS';
      default:
        return '';
    }
  };

  const getUserAvatar = () => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.fullName}
          className="w-10 h-10 rounded-full border-2 border-white/20"
        />
      );
    }
    
    return (
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
        <span className="text-white font-semibold text-sm">
          {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <Header
        title={getPageTitle()}
        showBackButton={!isHomePage}
        showLogo={isHomePage}
        rightContent={isHomePage ? getUserAvatar() : undefined}
        variant="gradient"
      />

      {/* Main Content */}
      <main className="relative">
        {children}
        
        {/* Floating Kappi Avatar */}
        {showKappi && (
          <div className="fixed bottom-24 right-4 z-40">
            <KappiAvatar
              size="lg"
              onClick={() => {
                // Navigate to chat or toggle chat widget
                window.location.href = '/chat';
              }}
              expression="happy"
              showHat={true}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};