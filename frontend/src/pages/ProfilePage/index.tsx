import React, { useState } from 'react';
import { User, Building, FileText, Mail, Phone, Shield, Bell, Save } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNotifications } from '@/app/providers/NotificationProvider';
import { KappiAvatar } from '@/widgets/Chatbot';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotifications();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'business' | 'preferences'>('personal');
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    businessName: user?.businessName || '',
    ruc: user?.ruc || '',
    taxRegime: user?.profile?.taxRegime || 'RER',
    businessType: user?.profile?.businessType || 'Servicios',
    notifications: {
      email: user?.preferences?.notifications?.email || true,
      sms: user?.preferences?.notifications?.sms || false,
      push: user?.preferences?.notifications?.push || true,
    },
    theme: user?.preferences?.theme || 'light',
    language: user?.preferences?.language || 'es',
  });

  const handleChange = (field: string, value: any) => {
    if (field.includes('notifications.')) {
      const notificationField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Here you would typically call an API to update the user
      // For now, we'll just update the local state
      updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        businessName: formData.businessName,
        preferences: {
          ...user?.preferences,
          notifications: formData.notifications,
          theme: formData.theme,
          language: formData.language,
          timezone: user?.preferences?.timezone || 'America/Lima',
        }
      });
      
      addNotification({
        type: 'success',
        title: 'Perfil actualizado',
        message: 'Tu información ha sido guardada correctamente',
      });
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar tu perfil. Inténtalo nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const TabButton: React.FC<{ id: string; label: string; icon: React.ReactNode }> = ({ id, label, icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === id
          ? 'bg-primary-100 text-primary-700 border-primary-200'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <KappiAvatar size="lg" expression="happy" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex space-x-2 mb-6">
          <TabButton
            id="personal"
            label="Información Personal"
            icon={<User className="w-5 h-5" />}
          />
          <TabButton
            id="business"
            label="Datos Empresariales"
            icon={<Building className="w-5 h-5" />}
          />
          <TabButton
            id="preferences"
            label="Preferencias"
            icon={<Shield className="w-5 h-5" />}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Nombre"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  icon={<User className="w-5 h-5" />}
                  disabled={loading}
                />
                
                <Input
                  type="text"
                  label="Apellido"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  icon={<User className="w-5 h-5" />}
                  disabled={loading}
                />
              </div>

              <Input
                type="email"
                label="Correo Electrónico"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                disabled={true}
                helperText="No puedes cambiar tu correo electrónico"
              />

              <Input
                type="tel"
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                icon={<Phone className="w-5 h-5" />}
                disabled={loading}
                placeholder="Número de teléfono"
              />
            </div>
          )}

          {/* Business Information Tab */}
          {activeTab === 'business' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Empresariales</h3>
              
              <Input
                type="text"
                label="Nombre de la Empresa"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                icon={<Building className="w-5 h-5" />}
                disabled={loading}
              />

              <Input
                type="text"
                label="RUC"
                value={formData.ruc}
                onChange={(e) => handleChange('ruc', e.target.value)}
                icon={<FileText className="w-5 h-5" />}
                disabled={true}
                helperText="No puedes cambiar tu RUC"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferencias</h3>
              
              {/* Notifications */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notificaciones
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.notifications.email}
                      onChange={(e) => handleChange('notifications.email', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">Notificaciones por email</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.notifications.sms}
                      onChange={(e) => handleChange('notifications.sms', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">Notificaciones por SMS</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.notifications.push}
                      onChange={(e) => handleChange('notifications.push', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">Notificaciones push</span>
                  </label>
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={loading}
                >
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="system">Sistema</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={loading}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button
              type="submit"
              loading={loading}
              className="px-6"
            >
              <Save className="w-5 h-5 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};