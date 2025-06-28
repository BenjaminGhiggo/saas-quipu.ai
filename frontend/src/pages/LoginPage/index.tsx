import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Key } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { KappiAvatar } from '@/widgets/Chatbot';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNotifications } from '@/app/providers/NotificationProvider';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithSunat } = useAuth();
  const { addNotification } = useNotifications();
  
  const [loginType, setLoginType] = useState<'standard' | 'sunat'>('standard');
  const [loading, setLoading] = useState(false);
  
  // Standard login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // SUNAT login form
  const [ruc, setRuc] = useState('');
  const [sunatUser, setSunatUser] = useState('');
  const [sunatPassword, setSunatPassword] = useState('');

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Por favor complete todos los campos',
      });
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      
      addNotification({
        type: 'success',
        title: '¡Bienvenido!',
        message: 'Has iniciado sesión correctamente',
      });
      
      navigate('/');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error de autenticación',
        message: error instanceof Error ? error.message : 'Credenciales inválidas',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSunatLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ruc || !sunatUser || !sunatPassword) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Por favor complete todos los campos',
      });
      return;
    }

    if (ruc.length !== 11) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'El RUC debe tener 11 dígitos',
      });
      return;
    }

    try {
      setLoading(true);
      await loginWithSunat(ruc, sunatUser, sunatPassword);
      
      addNotification({
        type: 'success',
        title: '¡Conectado con SUNAT!',
        message: 'Has iniciado sesión correctamente',
      });
      
      navigate('/');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error de conexión SUNAT',
        message: error instanceof Error ? error.message : 'No se pudo conectar con SUNAT',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-4">
      <div className="max-w-sm mx-auto w-full">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            ¡Bienvenido!
          </h2>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <KappiAvatar size="md" expression="happy" />
            <p className="text-white/90">
              Kappi te está esperando...
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {loginType === 'standard' ? (
            <form onSubmit={handleStandardLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="correo@sitioincreible.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                disabled={loading}
              />
              
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                showPasswordToggle
                disabled={loading}
              />

              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                className="mt-6"
              >
                Iniciar sesión
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSunatLogin} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Iniciar sesión con SUNAT
                </h3>
                <div className="flex items-center justify-center space-x-2">
                  <KappiAvatar size="sm" expression="thinking" />
                  <p className="text-sm text-gray-600">
                    Conecta directamente con SUNAT
                  </p>
                </div>
              </div>

              <Input
                type="text"
                placeholder="RUC (11 dígitos)"
                value={ruc}
                onChange={(e) => setRuc(e.target.value.replace(/\D/g, '').slice(0, 11))}
                disabled={loading}
                maxLength={11}
              />
              
              <Input
                type="text"
                placeholder="Usuario SOL"
                value={sunatUser}
                onChange={(e) => setSunatUser(e.target.value)}
                icon={<User className="w-5 h-5" />}
                disabled={loading}
              />
              
              <Input
                type="password"
                placeholder="Clave SOL"
                value={sunatPassword}
                onChange={(e) => setSunatPassword(e.target.value)}
                icon={<Key className="w-5 h-5" />}
                showPasswordToggle
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                className="mt-6"
              >
                CONECTAR CON SUNAT
              </Button>
            </form>
          )}

          {/* Toggle Login Type */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setLoginType(loginType === 'standard' ? 'sunat' : 'standard')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {loginType === 'standard' 
                ? '¿Prefieres conectar con SUNAT?' 
                : '¿Prefieres login estándar?'
              }
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              ¿Aún no tienes una cuenta?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Únete aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};