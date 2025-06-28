import React from 'react';
import { Calculator } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col">
      {/* Header with Logo */}
      <div className="flex-shrink-0 pt-12 pb-8 px-4 text-center safe-area-top">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          
          {/* Brand */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Quipu.ai</h1>
            {/* Colorful abacus representation */}
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-red-300 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
              <div className="w-2 h-2 bg-red-300 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
              <div className="w-2 h-2 bg-red-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 text-center safe-area-bottom">
        <p className="text-white/70 text-sm">
          © 2024 Quipu.ai - Tu contador virtual con IA
        </p>
      </div>
    </div>
  );
};