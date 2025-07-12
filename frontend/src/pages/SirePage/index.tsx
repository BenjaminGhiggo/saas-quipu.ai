import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Calendar,
  Settings,
  RefreshCw,
  Archive,
  TrendingUp,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { KappiAvatar } from '@/widgets/Chatbot';
import { useNotifications } from '@/app/providers/NotificationProvider';
import { useSireStore } from '@/app/store/sireStore';
import { SireProcess } from '@/shared/types';

export const SirePage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  
  const {
    isConfigured,
    isAuthenticated,
    isLoading,
    periodos,
    procesos,
    loadPeriodos,
    descargarPropuesta,
    aceptarPropuesta,
    registrarPreliminar,
    consultarTicket,
    authenticate
  } = useSireStore();

  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'procesos' | 'periodos'>('dashboard');

  useEffect(() => {
    if (!isConfigured) {
      navigate('/sunat-config');
      return;
    }

    if (isConfigured && !isAuthenticated) {
      handleAuthenticate();
    }

    if (isAuthenticated && periodos.length === 0) {
      loadPeriodosData();
    }
  }, [isConfigured, isAuthenticated]);

  const handleAuthenticate = async () => {
    try {
      await authenticate();
      addNotification({
        type: 'success',
        title: 'Conectado a SUNAT',
        message: 'Autenticación exitosa con los servicios SIRE'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error de autenticación',
        message: 'No se pudo conectar con SUNAT. Verifica tus credenciales.'
      });
    }
  };

  const loadPeriodosData = async () => {
    try {
      await loadPeriodos();
      
      // Seleccionar período actual por defecto
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const currentPeriod = `${currentYear}${String(currentMonth).padStart(2, '0')}`;
      setSelectedPeriod(currentPeriod);
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al cargar períodos',
        message: error instanceof Error ? error.message : 'Error inesperado'
      });
    }
  };

  const handleDescargarPropuesta = async (periodo: string) => {
    try {
      const ticket = await descargarPropuesta(periodo);
      
      addNotification({
        type: 'info',
        title: 'Descarga iniciada',
        message: `Se ha iniciado la descarga de la propuesta. Ticket: ${ticket}`
      });

      // Consultar estado del ticket cada 5 segundos
      const interval = setInterval(async () => {
        try {
          const ticketStatus = await consultarTicket(ticket);
          if (ticketStatus.estado === 'Terminado') {
            clearInterval(interval);
            addNotification({
              type: 'success',
              title: 'Propuesta descargada',
              message: 'La propuesta está lista para revisar'
            });
          } else if (ticketStatus.estado === 'Error') {
            clearInterval(interval);
            addNotification({
              type: 'error',
              title: 'Error en descarga',
              message: ticketStatus.mensajeError || 'Error desconocido'
            });
          }
        } catch (err) {
          clearInterval(interval);
        }
      }, 5000);

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al descargar propuesta',
        message: error instanceof Error ? error.message : 'Error inesperado'
      });
    }
  };

  const handleAceptarPropuesta = async (periodo: string) => {
    try {
      const ticket = await aceptarPropuesta(periodo);
      
      addNotification({
        type: 'success',
        title: 'Propuesta aceptada',
        message: `Se ha aceptado la propuesta SUNAT. Ticket: ${ticket}`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al aceptar propuesta',
        message: error instanceof Error ? error.message : 'Error inesperado'
      });
    }
  };

  const handleRegistrarPreliminar = async (periodo: string) => {
    try {
      await registrarPreliminar(periodo);
      
      addNotification({
        type: 'success',
        title: 'Preliminar registrado',
        message: 'El registro preliminar ha sido enviado a SUNAT exitosamente'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al registrar preliminar',
        message: error instanceof Error ? error.message : 'Error inesperado'
      });
    }
  };

  const getProcesosByPeriod = (periodo: string) => {
    return procesos.filter(p => p.periodo === periodo);
  };

  const getProcessStatusIcon = (estado: SireProcess['estado']) => {
    switch (estado) {
      case 'completado':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'procesando':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatPeriod = (periodo: string) => {
    if (periodo.length === 6) {
      const year = periodo.substring(0, 4);
      const month = periodo.substring(4, 6);
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }
    return periodo;
  };

  // Verificar si no está configurado
  if (!isConfigured) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <div className="bg-yellow-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Settings className="w-10 h-10 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Configuración Requerida
          </h3>
          <p className="text-gray-600 mb-6">
            Debes configurar tus credenciales de SUNAT antes de usar SIRE VENTAS
          </p>
          <Button onClick={() => navigate('/sunat-config')}>
            <Settings className="w-5 h-5 mr-2" />
            Configurar SUNAT
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SIRE VENTAS</h1>
              <p className="text-gray-600">Sistema Integrado Registro Electrónico</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/sunat-config')}
            >
              <Settings className="w-5 h-5 mr-2" />
              Configuración
            </Button>
            
            <Button
              variant="outline"
              onClick={loadPeriodosData}
              loading={isLoading}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Estado de Conexión */}
      {!isAuthenticated && (
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <div>
                <h3 className="font-semibold text-gray-900">No autenticado</h3>
                <p className="text-sm text-gray-600">
                  Necesitas autenticarte con SUNAT para usar los servicios SIRE
                </p>
              </div>
            </div>
            <Button
              onClick={handleAuthenticate}
              loading={isLoading}
            >
              Conectar con SUNAT
            </Button>
          </div>
        </div>
      )}

      {/* Navegación por pestañas */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'dashboard', label: 'Panel Principal', icon: TrendingUp },
              { id: 'procesos', label: 'Procesos', icon: Clock },
              { id: 'periodos', label: 'Períodos', icon: Calendar }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard Principal */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Selector de Período */}
              <div className="flex items-center space-x-4">
                <label className="font-medium text-gray-700">Período:</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={!isAuthenticated}
                >
                  <option value="">Seleccionar período</option>
                  {periodos.flatMap(ejercicio => 
                    ejercicio.lisPeriodos.map(periodo => (
                      <option key={periodo.perTributario} value={periodo.perTributario}>
                        {formatPeriod(periodo.perTributario)} - {periodo.desEstado}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Acciones Principales */}
              {selectedPeriod && isAuthenticated && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Download className="w-6 h-6 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Descargar Propuesta</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Descarga la propuesta de SUNAT con los comprobantes del período
                    </p>
                    <Button
                      onClick={() => handleDescargarPropuesta(selectedPeriod)}
                      loading={isLoading}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Aceptar Propuesta</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Acepta la propuesta de SUNAT para registrar el preliminar
                    </p>
                    <Button
                      onClick={() => handleAceptarPropuesta(selectedPeriod)}
                      loading={isLoading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aceptar
                    </Button>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Upload className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">Registrar Preliminar</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Envía el registro preliminar final a SUNAT
                    </p>
                    <Button
                      onClick={() => handleRegistrarPreliminar(selectedPeriod)}
                      loading={isLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Registrar
                    </Button>
                  </div>
                </div>
              )}

              {/* Procesos del Período Seleccionado */}
              {selectedPeriod && getProcesosByPeriod(selectedPeriod).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Procesos para {formatPeriod(selectedPeriod)}
                  </h3>
                  <div className="space-y-3">
                    {getProcesosByPeriod(selectedPeriod).map(proceso => (
                      <div key={proceso.id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getProcessStatusIcon(proceso.estado)}
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {proceso.tipo}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(proceso.fechaInicio).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            proceso.estado === 'completado' ? 'bg-green-100 text-green-800' :
                            proceso.estado === 'procesando' ? 'bg-yellow-100 text-yellow-800' :
                            proceso.estado === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {proceso.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab de Procesos */}
          {activeTab === 'procesos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Historial de Procesos</h3>
                <span className="text-sm text-gray-600">{procesos.length} procesos</span>
              </div>
              
              {procesos.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay procesos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {procesos.map(proceso => (
                    <div key={proceso.id} className="bg-white border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getProcessStatusIcon(proceso.estado)}
                          <div>
                            <h4 className="font-medium text-gray-900 capitalize">
                              {proceso.tipo} - {formatPeriod(proceso.periodo)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Iniciado: {new Date(proceso.fechaInicio).toLocaleString()}
                              {proceso.fechaFin && ` • Finalizado: ${new Date(proceso.fechaFin).toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            proceso.estado === 'completado' ? 'bg-green-100 text-green-800' :
                            proceso.estado === 'procesando' ? 'bg-yellow-100 text-yellow-800' :
                            proceso.estado === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {proceso.estado}
                          </span>
                          {proceso.ticket && (
                            <span className="text-xs text-gray-500 font-mono">
                              {proceso.ticket}
                            </span>
                          )}
                        </div>
                      </div>
                      {proceso.error && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-600">{proceso.error}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab de Períodos */}
          {activeTab === 'periodos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Períodos Disponibles</h3>
                <Button
                  variant="outline"
                  onClick={loadPeriodosData}
                  loading={isLoading}
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </div>
              
              {periodos.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No se encontraron períodos disponibles</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {periodos.map(ejercicio => (
                    <div key={ejercicio.numEjercicio} className="bg-white border rounded-lg">
                      <div className="px-4 py-3 border-b bg-gray-50">
                        <h4 className="font-semibold text-gray-900">
                          Ejercicio {ejercicio.numEjercicio} - {ejercicio.desEstado}
                        </h4>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {ejercicio.lisPeriodos.map(periodo => (
                            <button
                              key={periodo.perTributario}
                              onClick={() => setSelectedPeriod(periodo.perTributario)}
                              className={`p-3 rounded-lg border text-left transition-colors ${
                                selectedPeriod === periodo.perTributario
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">
                                  {formatPeriod(periodo.perTributario)}
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                periodo.codEstado === '1' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {periodo.desEstado}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ayuda de Kappi */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
        <div className="flex items-start space-x-4">
          <KappiAvatar size="md" expression="happy" />
          <div>
            <h3 className="font-semibold text-primary-900 mb-2">
              ¡Kappi está aquí para ayudarte!
            </h3>
            <p className="text-primary-700 text-sm mb-4">
              SIRE VENTAS automatiza tu registro de ventas electrónico con SUNAT. 
              El proceso típico es: Descargar Propuesta → Revisar → Aceptar → Registrar Preliminar.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/chat')}
              className="border-primary-300 text-primary-700 hover:bg-primary-200"
            >
              Pregúntale a Kappi
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};