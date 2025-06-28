import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  Bell, 
  Menu,
  Bot // We'll use Bot as Kappi icon
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  isSpecial?: boolean; // For the central + button
}

const navigationItems: NavigationItem[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: <Home className="w-5 h-5" />,
    path: '/',
  },
  {
    id: 'kappi',
    label: 'Kappi',
    icon: <Bot className="w-5 h-5" />,
    path: '/chat',
  },
  {
    id: 'declarar',
    label: 'Declarar',
    icon: <Plus className="w-6 h-6" />,
    path: '/declarar',
    isSpecial: true,
  },
  {
    id: 'alertas',
    label: 'Alertas',
    icon: <Bell className="w-5 h-5" />,
    path: '/alertas',
  },
  {
    id: 'menu',
    label: 'Menú',
    icon: <Menu className="w-5 h-5" />,
    path: '/menu',
  },
];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="bottom-nav safe-area-bottom">
      <div className="flex items-center justify-around">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.isSpecial) {
            // Special styling for the central "Declarar" button
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.path)}
                className={clsx(
                  'flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-200 transform',
                  isActive 
                    ? 'bg-primary-600 text-white scale-110 shadow-lg' 
                    : 'bg-primary-600 text-white hover:scale-105 shadow-md'
                )}
                aria-label={item.label}
              >
                {item.icon}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.path)}
              className={clsx(
                'bottom-nav-item',
                isActive ? 'active' : 'inactive'
              )}
              aria-label={item.label}
            >
              <div className="flex flex-col items-center space-y-1">
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};