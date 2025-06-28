import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  showPasswordToggle = false,
  fullWidth = true,
  className,
  type = 'text',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [internalType, setInternalType] = React.useState(type);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  React.useEffect(() => {
    if (type === 'password' && showPasswordToggle) {
      setInternalType(showPassword ? 'text' : 'password');
    } else {
      setInternalType(type);
    }
  }, [type, showPassword, showPasswordToggle]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const hasError = !!error;
  const hasIcon = !!icon;
  const hasRightAction = showPasswordToggle && type === 'password';

  return (
    <div className={clsx('relative', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {hasIcon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={clsx(
              'w-5 h-5',
              hasError ? 'text-red-500' : 'text-gray-400'
            )}>
              {icon}
            </div>
          </div>
        )}

        <input
          ref={ref}
          type={internalType}
          id={inputId}
          className={clsx(
            // Base styles
            'block w-full rounded-lg border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset transition-colors duration-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
            // Padding adjustments for icons
            hasIcon && iconPosition === 'left' && 'pl-10',
            hasIcon && iconPosition === 'right' && 'pr-10',
            hasRightAction && 'pr-10',
            hasIcon && iconPosition === 'left' && hasRightAction && 'pl-10 pr-10',
            // Error states
            hasError 
              ? 'ring-red-300 placeholder:text-red-300 focus:ring-red-500' 
              : 'ring-gray-300 focus:ring-primary-600',
            // Disabled state
            props.disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
            // Custom className
            className
          )}
          {...props}
        />

        {hasIcon && iconPosition === 'right' && !hasRightAction && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className={clsx(
              'w-5 h-5',
              hasError ? 'text-red-500' : 'text-gray-400'
            )}>
              {icon}
            </div>
          </div>
        )}

        {hasRightAction && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
      </div>

      {hasError && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {helperText && !hasError && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});