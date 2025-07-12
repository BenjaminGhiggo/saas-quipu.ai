import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Building, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { KappiAvatar } from '@/widgets/Chatbot';
import { useNotifications } from '@/app/providers/NotificationProvider';
import { useSireStore } from '@/app/store/sireStore';
import { SunatCredentials } from '@/shared/types';

export const SunatConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { 
    credentials, 
    isConfigured, 
    isAuthenticated, 
    isLoading, 
    error,
    setCredentials, 
    clearCredentials, 
    authenticate 
  } = useSireStore();

  const [formData, setFormData] = useState<SunatCredentials>({
    ruc: credentials?.ruc || '',
    usuarioSOL: credentials?.usuarioSOL || '',
    claveSOL: credentials?.claveSOL || '',
    clientId: credentials?.clientId || '',
    clientSecret: credentials?.clientSecret || '',
    isConfigured: false
  });

  const [showPasswords, setShowPasswords] = useState({
    claveSOL: false,
    clientSecret: false
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    if (credentials) {
      setFormData(credentials);
    }
  }, [credentials]);

  const handleChange = (field: keyof SunatCredentials, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.ruc) {
      errors.ruc = 'El RUC es requerido';
    } else if (!/^\d{11}$/.test(formData.ruc)) {
      errors.ruc = 'El RUC debe tener 11 dígitos';
    }

    if (!formData.usuarioSOL) {
      errors.usuarioSOL = 'El usuario SOL es requerido';
    }

    if (!formData.claveSOL) {
      errors.claveSOL = 'La clave SOL es requerida';
    }

    // Client ID y Secret son opcionales para el modo mock
    const isMockMode = import.meta.env.VITE_SIRE_MOCK_MODE === 'true';
    
    if (!isMockMode) {
      if (!formData.clientId) {
        errors.clientId = 'El Client ID es requerido para el entorno de producción';
      }

      if (!formData.clientSecret) {
        errors.clientSecret = 'El Client Secret es requerido para el entorno de producción';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      addNotification({
        type: 'error',
        title: 'Error de validación',
        message: 'Por favor corrige los errores en el formulario'
      });
      return;
    }

    try {
      setCredentials(formData);
      
      addNotification({
        type: 'success',
        title: 'Credenciales guardadas',
        message: 'La configuración ha sido guardada correctamente'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al guardar',
        message: error instanceof Error ? error.message : 'Error inesperado'
      });
    }
  };

  const handleTestConnection = async () => {
    if (!validateForm()) {
      addNotification({
        type: 'error',
        title: 'Error de validación',
        message: 'Por favor corrige los errores antes de probar la conexión'
      });
      return;
    }

    try {
      setTestingConnection(true);
      
      // Guardar credenciales temporalmente
      setCredentials(formData);
      
      // Probar autenticación
      await authenticate();
      
      addNotification({
        type: 'success',
        title: '¡Conexión exitosa!',
        message: 'Las credenciales son válidas y la conexión con SUNAT funciona correctamente'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error de conexión',
        message: error instanceof Error ? error.message : 'No se pudo conectar con SUNAT'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleClearCredentials = () => {
    clearCredentials();
    setFormData({
      ruc: '',
      usuarioSOL: '',
      claveSOL: '',
      clientId: '',
      clientSecret: '',
      isConfigured: false
    });
    
    addNotification({
      type: 'info',
      title: 'Credenciales eliminadas',
      message: 'Se han eliminado todas las credenciales de SUNAT'
    });
  };

  const isMockMode = import.meta.env.VITE_SIRE_MOCK_MODE === 'true';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-primary-100 p-3 rounded-lg">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración SUNAT</h1>
            <p className="text-gray-600">
              Configura tus credenciales para conectar con los servicios de SUNAT
            </p>
          </div>
        </div>
      </div>

      {/* Estado de Conexión */}
      {isConfigured && (
        <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
          isAuthenticated ? 'border-green-500' : 'border-yellow-500'
        }`}>
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {isAuthenticated ? 'Conectado a SUNAT' : 'Credenciales configuradas'}
              </h3>
              <p className="text-sm text-gray-600">
                {isAuthenticated 
                  ? `RUC: ${credentials?.ruc} - Última sincronización: ${new Date(credentials?.lastSync || '').toLocaleString()}`
                  : 'Haz clic en "Probar conexión" para validar las credenciales'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modo Mock Alert */}
      {isMockMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <KappiAvatar size="sm" expression="thinking" />
            <div>
              <h4 className="font-medium text-blue-900">Modo de Desarrollo</h4>
              <p className="text-sm text-blue-700 mt-1">
                Estás en modo de desarrollo. Las conexiones con SUNAT están simuladas. 
                Los Client ID y Secret son opcionales en este modo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Datos de la Empresa
            </h3>
            
            <div className="space-y-4">
              <Input
                type="text"
                label="RUC de la Empresa"
                value={formData.ruc}
                onChange={(e) => handleChange('ruc', e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="12345678901"
                maxLength={11}
                error={validationErrors.ruc}
                helperText="RUC de 11 dígitos registrado en SUNAT"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Credenciales SOL
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Usuario SOL"
                value={formData.usuarioSOL}
                onChange={(e) => handleChange('usuarioSOL', e.target.value)}
                placeholder="USUARIO01"
                error={validationErrors.usuarioSOL}
                helperText="Usuario asignado para el Portal SOL"
              />

              <div className="relative">
                <Input
                  type={showPasswords.claveSOL ? 'text' : 'password'}
                  label="Clave SOL"
                  value={formData.claveSOL}
                  onChange={(e) => handleChange('claveSOL', e.target.value)}
                  placeholder="••••••••"
                  error={validationErrors.claveSOL}
                  helperText="Contraseña del Portal SOL"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, claveSOL: !prev.claveSOL }))}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.claveSOL ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Credenciales API SUNAT
              {!isMockMode && <span className="text-red-500 ml-1">*</span>}
            </h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Para obtener estas credenciales, ingresa al{' '}
                <a 
                  href="https://e-menu.sunat.gob.pe/cl-ti-itmenu/MenuInternet.htm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 inline-flex items-center"
                >
                  Portal SOL de SUNAT
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
                {' '}y ve a: Empresas → Credenciales de API SUNAT → Gestión Credenciales de API SUNAT
              </p>
            </div>
            
            <div className="space-y-4">
              <Input
                type="text"
                label={`Client ID ${!isMockMode ? '(Requerido)' : '(Opcional en modo desarrollo)'}`}
                value={formData.clientId}
                onChange={(e) => handleChange('clientId', e.target.value)}
                placeholder="9cae24a9-10d7-48b0-bee0-e94bd56947e3"
                error={validationErrors.clientId}
                helperText="UUID generado por SUNAT para tu aplicación"
              />

              <div className="relative">
                <Input
                  type={showPasswords.clientSecret ? 'text' : 'password'}
                  label={`Client Secret ${!isMockMode ? '(Requerido)' : '(Opcional en modo desarrollo)'}`}
                  value={formData.clientSecret}
                  onChange={(e) => handleChange('clientSecret', e.target.value)}
                  placeholder="••••••••••••••••••••••••••••••••"
                  error={validationErrors.clientSecret}
                  helperText="Clave secreta generada por SUNAT"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, clientSecret: !prev.clientSecret }))}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.clientSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Error de Configuración</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              onClick={handleTestConnection}
              loading={testingConnection || isLoading}
              className="flex-1"
              variant="secondary"
            >
              <Shield className="w-5 h-5 mr-2" />
              Probar Conexión
            </Button>

            <Button
              onClick={handleSave}
              loading={isLoading}
              className="flex-1"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Guardar Configuración
            </Button>

            {isConfigured && (
              <Button
                onClick={handleClearCredentials}
                variant="outline"
                className="flex-1"
              >
                Limpiar Credenciales
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navegación */}
      {isConfigured && isAuthenticated && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">¡Configuración completa!</h3>
              <p className="text-sm text-gray-600">Ya puedes usar los servicios SIRE de SUNAT</p>
            </div>
            <Button
              onClick={() => navigate('/sire')}
              className="bg-green-600 hover:bg-green-700"
            >
              Ir a SIRE VENTAS
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};