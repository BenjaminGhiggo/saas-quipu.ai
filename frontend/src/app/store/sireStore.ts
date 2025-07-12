import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SunatCredentials, SireAuthToken, SirePeriod, SireTicket, SireProcess } from '@/shared/types';
import { sireApi } from '@/shared/lib/api/sireApi';

interface SireState {
  // Credenciales
  credentials: SunatCredentials | null;
  isConfigured: boolean;
  
  // Autenticación
  token: SireAuthToken | null;
  isAuthenticated: boolean;
  
  // Datos
  periodos: SirePeriod[];
  tickets: SireTicket[];
  procesos: SireProcess[];
  
  // Estados
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  setCredentials: (credentials: SunatCredentials) => void;
  clearCredentials: () => void;
  authenticate: () => Promise<void>;
  logout: () => void;
  
  // Consultas
  loadPeriodos: () => Promise<void>;
  consultarTicket: (numTicket: string) => Promise<SireTicket>;
  
  // Procesos SIRE
  descargarPropuesta: (perTributario: string) => Promise<string>;
  aceptarPropuesta: (perTributario: string) => Promise<string>;
  registrarPreliminar: (perTributario: string) => Promise<void>;
  descargarArchivo: (numTicket: string) => Promise<Blob>;
  
  // Utilidades
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addProceso: (proceso: SireProcess) => void;
  updateProceso: (id: string, updates: Partial<SireProcess>) => void;
}

export const useSireStore = create<SireState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      credentials: null,
      isConfigured: false,
      token: null,
      isAuthenticated: false,
      periodos: [],
      tickets: [],
      procesos: [],
      isLoading: false,
      error: null,

      // ========================================
      // GESTIÓN DE CREDENCIALES
      // ========================================
      
      setCredentials: (credentials: SunatCredentials) => {
        set({
          credentials: {
            ...credentials,
            isConfigured: true,
            lastSync: new Date().toISOString()
          },
          isConfigured: true,
          error: null
        });
      },

      clearCredentials: () => {
        set({
          credentials: null,
          isConfigured: false,
          token: null,
          isAuthenticated: false,
          periodos: [],
          tickets: [],
          procesos: [],
          error: null
        });
        sireApi.logout();
      },

      // ========================================
      // AUTENTICACIÓN
      // ========================================

      authenticate: async () => {
        const { credentials } = get();
        if (!credentials) {
          throw new Error('No hay credenciales configuradas');
        }

        try {
          set({ isLoading: true, error: null });
          
          const token = await sireApi.authenticate(credentials);
          
          set({
            token,
            isAuthenticated: true,
            isLoading: false,
            credentials: {
              ...credentials,
              lastSync: new Date().toISOString()
            }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error de autenticación';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            token: null
          });
          throw error;
        }
      },

      logout: () => {
        set({
          token: null,
          isAuthenticated: false,
          periodos: [],
          tickets: [],
          error: null
        });
        sireApi.logout();
      },

      // ========================================
      // CONSULTAS
      // ========================================

      loadPeriodos: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const periodos = await sireApi.consultarPeriodos();
          
          set({
            periodos,
            isLoading: false
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al cargar períodos';
          set({
            error: errorMessage,
            isLoading: false
          });
          throw error;
        }
      },

      consultarTicket: async (numTicket: string) => {
        try {
          const ticket = await sireApi.consultarEstadoTicket(numTicket);
          
          // Actualizar lista de tickets
          const { tickets } = get();
          const updatedTickets = tickets.filter(t => t.numTicket !== numTicket);
          updatedTickets.push(ticket);
          
          set({ tickets: updatedTickets });
          
          return ticket;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al consultar ticket';
          set({ error: errorMessage });
          throw error;
        }
      },

      // ========================================
      // PROCESOS SIRE
      // ========================================

      descargarPropuesta: async (perTributario: string) => {
        const procesoId = `propuesta_${perTributario}_${Date.now()}`;
        
        try {
          // Crear proceso
          const proceso: SireProcess = {
            id: procesoId,
            tipo: 'propuesta',
            periodo: perTributario,
            estado: 'iniciado',
            fechaInicio: new Date().toISOString()
          };
          
          get().addProceso(proceso);
          set({ isLoading: true, error: null });
          
          // Actualizar estado a procesando
          get().updateProceso(procesoId, { estado: 'procesando' });
          
          const result = await sireApi.descargarPropuesta(perTributario);
          
          // Completar proceso
          get().updateProceso(procesoId, {
            estado: 'completado',
            fechaFin: new Date().toISOString(),
            ticket: result.numTicket,
            resultado: result
          });
          
          set({ isLoading: false });
          
          return result.numTicket;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al descargar propuesta';
          
          get().updateProceso(procesoId, {
            estado: 'error',
            fechaFin: new Date().toISOString(),
            error: errorMessage
          });
          
          set({
            error: errorMessage,
            isLoading: false
          });
          
          throw error;
        }
      },

      aceptarPropuesta: async (perTributario: string) => {
        const procesoId = `aceptar_${perTributario}_${Date.now()}`;
        
        try {
          const proceso: SireProcess = {
            id: procesoId,
            tipo: 'propuesta',
            periodo: perTributario,
            estado: 'iniciado',
            fechaInicio: new Date().toISOString()
          };
          
          get().addProceso(proceso);
          set({ isLoading: true, error: null });
          
          get().updateProceso(procesoId, { estado: 'procesando' });
          
          const result = await sireApi.aceptarPropuesta(perTributario);
          
          get().updateProceso(procesoId, {
            estado: 'completado',
            fechaFin: new Date().toISOString(),
            ticket: result.numTicket,
            resultado: result
          });
          
          set({ isLoading: false });
          
          return result.numTicket;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al aceptar propuesta';
          
          get().updateProceso(procesoId, {
            estado: 'error',
            fechaFin: new Date().toISOString(),
            error: errorMessage
          });
          
          set({
            error: errorMessage,
            isLoading: false
          });
          
          throw error;
        }
      },

      registrarPreliminar: async (perTributario: string) => {
        const procesoId = `preliminar_${perTributario}_${Date.now()}`;
        
        try {
          const proceso: SireProcess = {
            id: procesoId,
            tipo: 'preliminar',
            periodo: perTributario,
            estado: 'iniciado',
            fechaInicio: new Date().toISOString()
          };
          
          get().addProceso(proceso);
          set({ isLoading: true, error: null });
          
          get().updateProceso(procesoId, { estado: 'procesando' });
          
          const result = await sireApi.registrarPreliminar(perTributario);
          
          get().updateProceso(procesoId, {
            estado: 'completado',
            fechaFin: new Date().toISOString(),
            resultado: result
          });
          
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al registrar preliminar';
          
          get().updateProceso(procesoId, {
            estado: 'error',
            fechaFin: new Date().toISOString(),
            error: errorMessage
          });
          
          set({
            error: errorMessage,
            isLoading: false
          });
          
          throw error;
        }
      },

      descargarArchivo: async (numTicket: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const blob = await sireApi.descargarArchivo(numTicket);
          
          set({ isLoading: false });
          
          return blob;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al descargar archivo';
          set({
            error: errorMessage,
            isLoading: false
          });
          throw error;
        }
      },

      // ========================================
      // UTILIDADES
      // ========================================

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      addProceso: (proceso: SireProcess) => {
        const { procesos } = get();
        set({ procesos: [...procesos, proceso] });
      },

      updateProceso: (id: string, updates: Partial<SireProcess>) => {
        const { procesos } = get();
        const updatedProcesos = procesos.map(p => 
          p.id === id ? { ...p, ...updates } : p
        );
        set({ procesos: updatedProcesos });
      }
    }),
    {
      name: 'sire-storage',
      partialize: (state) => ({
        credentials: state.credentials,
        isConfigured: state.isConfigured,
        procesos: state.procesos.filter(p => p.estado === 'completado'), // Solo persistir procesos completados
      }),
    }
  )
);