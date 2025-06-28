import React from 'react';
import { clsx } from 'clsx';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
}

const spinnerSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const spinnerColors = {
  primary: 'border-primary-600',
  secondary: 'border-secondary-500',
  white: 'border-white',
  gray: 'border-gray-600',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
}) => {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-transparent',
        spinnerSizes[size],
        `border-t-current`,
        spinnerColors[color],
        className
      )}
      role="status"
      aria-label="Cargando..."
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
};

export interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
}

const dotSizes = {
  sm: 'w-1 h-1',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
};

const dotColors = {
  primary: 'bg-primary-600',
  secondary: 'bg-secondary-500',
  white: 'bg-white',
  gray: 'bg-gray-400',
};

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  color = 'primary',
  className,
}) => {
  return (
    <div className={clsx('flex space-x-1', className)} role="status" aria-label="Cargando...">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={clsx(
            'rounded-full animate-pulse',
            dotSizes[size],
            dotColors[color]
          )}
          style={{
            animationDelay: `${index * 0.15}s`,
            animationDuration: '1s',
          }}
        />
      ))}
      <span className="sr-only">Cargando...</span>
    </div>
  );
};