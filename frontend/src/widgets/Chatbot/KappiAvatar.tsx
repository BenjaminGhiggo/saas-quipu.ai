import React from 'react';
import { Bot } from 'lucide-react';
import { clsx } from 'clsx';

interface KappiAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  isActive?: boolean;
  showHat?: boolean;
  expression?: 'happy' | 'thinking' | 'talking' | 'sleeping';
  className?: string;
}

const avatarSizes = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const iconSizes = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const KappiAvatar: React.FC<KappiAvatarProps> = ({
  size = 'md',
  onClick,
  isActive = false,
  showHat = true,
  expression = 'happy',
  className,
}) => {
  const isClickable = !!onClick;

  const getExpressionStyles = () => {
    switch (expression) {
      case 'thinking':
        return 'animate-bounce-soft';
      case 'talking':
        return 'animate-pulse';
      case 'sleeping':
        return 'opacity-75';
      default:
        return '';
    }
  };

  const avatarContent = (
    <div
      className={clsx(
        'kappi-avatar relative transition-all duration-200',
        avatarSizes[size],
        isActive && 'ring-2 ring-orange-300 bg-orange-200',
        isClickable && 'cursor-pointer hover:scale-105 hover:bg-orange-200',
        getExpressionStyles(),
        className
      )}
    >
      <Bot className={clsx(iconSizes[size], 'text-orange-600')} />
      
      {/* Peruvian hat */}
      {showHat && (
        <div className="absolute -top-1 -right-1">
          <div className="w-4 h-3 bg-orange-500 rounded-t-full border border-orange-600 relative">
            {/* Hat pattern */}
            <div className="absolute top-0.5 left-0.5 w-3 h-1 bg-red-500 rounded-full opacity-60"></div>
            <div className="absolute top-1 left-1 w-2 h-0.5 bg-yellow-400 rounded-full opacity-60"></div>
            {/* Hat tip */}
            <div className="absolute -top-1 right-0 w-1 h-1 bg-orange-600 rounded-full"></div>
          </div>
        </div>
      )}
      
      {/* Orange scarf */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1">
        <div className="w-6 h-2 bg-orange-400 rounded-b-lg border-t border-orange-500 opacity-80"></div>
      </div>

      {/* Expression indicators */}
      {expression === 'thinking' && (
        <div className="absolute -top-2 -right-2">
          <div className="flex space-x-0.5">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      {expression === 'talking' && (
        <div className="absolute -bottom-1 -right-1">
          <div className="w-2 h-2 bg-white rounded-full border border-gray-300 flex items-center justify-center">
            <div className="w-1 h-1 bg-orange-500 rounded-full animate-ping"></div>
          </div>
        </div>
      )}
    </div>
  );

  if (isClickable) {
    return (
      <button onClick={onClick} className="focus:outline-none focus:ring-2 focus:ring-orange-300 rounded-full">
        {avatarContent}
      </button>
    );
  }

  return avatarContent;
};