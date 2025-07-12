import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building, FileText, MapPin, Phone } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { KappiAvatar } from '@/widgets/Chatbot';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNotifications } from '@/app/providers/NotificationProvider';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addNotification } = useNotifications();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form data
  const [formData, setFormData] = useState({
    // Personal data
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Business data
    businessName: '',
    ruc: '',
    address: '',
    
    // Tax data
    taxRegime: 'RER' as 'RUS' | 'RER' | 'RG',
    businessType: 'Servicios' as 'Servicios' | 'Comercio' | 'Manufactura' | 'Construcción' | 'Otros',
    
    // Terms
    acceptTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'El nombre de la empresa es requerido';
    }
    
    if (!formData.ruc.trim()) {
      newErrors.ruc = 'El RUC es requerido';
    } else if (formData.ruc.length !== 11) {
      newErrors.ruc = 'El RUC debe tener 11 dígitos';
    } else if (!/^\d{11}$/.test(formData.ruc)) {
      newErrors.ruc = 'El RUC solo debe contener números';
    }
    
    if (formData.phone && formData.phone.trim() && formData.phone.length < 7) {
      newErrors.phone = 'El teléfono debe tener al menos 7 dígitos';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    try {
      setLoading(true);
      
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        ruc: formData.ruc,
        businessName: formData.businessName,
        phone: formData.phone,
        address: formData.address,
        taxRegime: formData.taxRegime,
        businessType: formData.businessType
      });
      
      addNotification({
        type: 'success',
        title: '¡Registro exitoso!',
        message: 'Tu cuenta ha sido creada correctamente',
      });
      
      navigate('/');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al registrarse',
        message: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-4">
      <div className="max-w-md mx-auto w-full">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            ¡Únete a Quipu.ai!
          </h2>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <KappiAvatar size="md" expression="happy" />
            <p className="text-white/90">
              Kappi te ayudará con tu contabilidad
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {step === 1 && (
              <>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Información Personal
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cuéntanos un poco sobre ti
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="Nombre"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    icon={<User className="w-5 h-5" />}
                    disabled={loading}
                    error={errors.firstName}
                  />
                  
                  <Input
                    type="text"
                    placeholder="Apellido"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    icon={<User className="w-5 h-5" />}
                    disabled={loading}
                    error={errors.lastName}
                  />
                </div>

                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  icon={<Mail className="w-5 h-5" />}
                  disabled={loading}
                  error={errors.email}
                />

                <Input
                  type="tel"
                  placeholder="Teléfono (opcional)"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  icon={<Phone className="w-5 h-5" />}
                  disabled={loading}
                />

                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  icon={<Lock className="w-5 h-5" />}
                  showPasswordToggle
                  disabled={loading}
                  error={errors.password}
                />

                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  icon={<Lock className="w-5 h-5" />}
                  showPasswordToggle
                  disabled={loading}
                  error={errors.confirmPassword}
                />

                <Input
                  type="tel"
                  placeholder="Teléfono (opcional)"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  icon={<Phone className="w-5 h-5" />}
                  disabled={loading}
                  error={errors.phone}
                />

                <Button
                  type="button"
                  onClick={handleNextStep}
                  fullWidth
                  className="mt-6"
                >
                  Continuar
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Información Empresarial
                  </h3>
                  <p className="text-sm text-gray-600">
                    Datos de tu empresa
                  </p>
                </div>

                <Input
                  type="text"
                  placeholder="Nombre de la empresa"
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  icon={<Building className="w-5 h-5" />}
                  disabled={loading}
                  error={errors.businessName}
                />

                <Input
                  type="text"
                  placeholder="RUC (11 dígitos)"
                  value={formData.ruc}
                  onChange={(e) => handleChange('ruc', e.target.value.replace(/\D/g, '').slice(0, 11))}
                  icon={<FileText className="w-5 h-5" />}
                  disabled={loading}
                  error={errors.ruc}
                  maxLength={11}
                />

                <Input
                  type="text"
                  placeholder="Dirección (opcional)"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  icon={<MapPin className="w-5 h-5" />}
                  disabled={loading}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Régimen Tributario
                    </label>
                    <select
                      value={formData.taxRegime}
                      onChange={(e) => handleChange('taxRegime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={loading}
                    >
                      <option value="RUS">RUS</option>
                      <option value="RER">RER</option>
                      <option value="RG">Régimen General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Negocio
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => handleChange('businessType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={loading}
                    >
                      <option value="Servicios">Servicios</option>
                      <option value="Comercio">Comercio</option>
                      <option value="Manufactura">Manufactura</option>
                      <option value="Construcción">Construcción</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                    className="mt-1"
                    disabled={loading}
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                    Acepto los{' '}
                    <a href="/terms" className="text-primary-600 hover:text-primary-700">
                      términos y condiciones
                    </a>
                    {' '}y la{' '}
                    <a href="/privacy" className="text-primary-600 hover:text-primary-700">
                      política de privacidad
                    </a>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-red-500 text-sm">{errors.acceptTerms}</p>
                )}

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    onClick={handlePrevStep}
                    variant="secondary"
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                  
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex-1"
                  >
                    Crear Cuenta
                  </Button>
                </div>
              </>
            )}
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};