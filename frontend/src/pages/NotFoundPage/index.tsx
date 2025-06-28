import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { KappiAvatar } from '@/widgets/Chatbot';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md mx-auto">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-6xl font-bold text-white/20 mb-4">
            404
          </div>
          <div className="flex justify-center">
            <KappiAvatar size="lg" expression="sleeping" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            ¡Oops! Página no encontrada
          </h1>
          <p className="text-white/80 text-lg">
            Parece que la página que buscas no existe o fue movida.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            icon={<Home className="w-5 h-5" />}
            onClick={() => window.location.href = '/'}
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            Ir al inicio
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            icon={<ArrowLeft className="w-5 h-5" />}
            onClick={() => window.history.back()}
            className="text-white hover:bg-white/10"
          >
            Volver atrás
          </Button>
        </div>

        {/* Help */}
        <div className="mt-8 p-4 bg-white/10 rounded-xl">
          <p className="text-white/80 text-sm mb-2">
            ¿Necesitas ayuda? Kappi puede orientarte.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/chat'}
            className="text-white hover:bg-white/10"
          >
            Hablar con Kappi
          </Button>
        </div>
      </div>
    </div>
  );
};