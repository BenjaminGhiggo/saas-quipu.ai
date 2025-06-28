import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import { clsx } from 'clsx';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showLogo?: boolean;
  rightContent?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient';
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  showLogo = true,
  rightContent,
  className,
  variant = 'gradient',
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <header
      className={clsx(
        'flex items-center justify-between px-4 py-4 safe-area-top',
        variant === 'gradient' && 'bg-gradient-primary',
        variant === 'default' && 'bg-white border-b border-gray-200',
        className
      )}
    >
      {/* Left side */}
      <div className="flex items-center space-x-3">
        {showBackButton && (
          <button
            onClick={handleBackClick}
            className={clsx(
              'p-2 rounded-full transition-colors',
              variant === 'gradient' 
                ? 'text-white hover:bg-white/10' 
                : 'text-gray-600 hover:bg-gray-100'
            )}
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {showLogo && (
          <div className="flex items-center space-x-2">
            <div className={clsx(
              'p-1 rounded-lg',
              variant === 'gradient' ? 'bg-white/10' : 'bg-primary-100'
            )}>
              <Calculator className={clsx(
                'w-6 h-6',
                variant === 'gradient' ? 'text-white' : 'text-primary-600'
              )} />
            </div>
            <div>
              <h1 className={clsx(
                'text-xl font-bold',
                variant === 'gradient' ? 'text-white' : 'text-primary-900'
              )}>
                Quipu.ai
              </h1>
              {/* Colorful abacus representation */}
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {title && !showLogo && (
          <h1 className={clsx(
            'text-lg font-semibold',
            variant === 'gradient' ? 'text-white' : 'text-gray-900'
          )}>
            {title}
          </h1>
        )}
      </div>

      {/* Right side */}
      {rightContent && (
        <div className="flex items-center space-x-2">
          {rightContent}
        </div>
      )}
    </header>
  );
};