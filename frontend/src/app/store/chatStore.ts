import { create } from 'zustand';
import { ChatMessage, ChatSession } from '@/shared/types';

interface ChatStore {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  loading: boolean;
  error: string | null;
  isTyping: boolean;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  createSession: () => void;
  loadSession: (sessionId: string) => void;
  clearCurrentSession: () => void;
  getSuggestions: () => Promise<string[]>;
  
  setTyping: (isTyping: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  currentSession: null,
  sessions: [],
  loading: false,
  error: null,
  isTyping: false,

  sendMessage: async (content: string) => {
    const { currentSession } = get();
    
    if (!currentSession) {
      get().createSession();
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    set(state => ({
      currentSession: state.currentSession 
        ? {
            ...state.currentSession,
            messages: [...state.currentSession.messages, userMessage],
            updatedAt: new Date().toISOString(),
          }
        : null,
      isTyping: true,
      error: null,
    }));

    try {
      // Mock API call to Kappi
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Mock Kappi responses
      const kappiResponses = {
        "¿cuánto debo declarar este mes?": "Según tus registros, debes declarar S/ 2,422.89 este mes. Esto incluye IGV por S/ 540 y renta por S/ 150.",
        "¿qué impuestos me tocan?": "Como empresa RER, te corresponden: IGV mensual (18%), Renta mensual (1.5% de ingresos netos), y EsSalud si tienes trabajadores.",
        "¿cuánto llevo declarando?": "Has declarado un total de S/ 15,847.32 en lo que va del año 2024.",
        "ayuda": "¡Hola! Soy Kappi, tu asistente contable. Puedo ayudarte con declaraciones, cálculos de impuestos, dudas sobre SUNAT y más. ¿En qué te ayudo hoy?",
      };

      const normalizedContent = content.toLowerCase().trim();
      const response = kappiResponses[normalizedContent] || 
                      kappiResponses["ayuda"] || 
                      "Interesante pregunta. Basándome en tu información, te recomiendo revisar tus declaraciones anteriores. ¿Te gustaría que analice algo específico?";

      const kappiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'kappi',
        timestamp: new Date().toISOString(),
        type: 'text',
        metadata: Math.random() > 0.7 ? {
          suggestions: [
            "¿Cuándo vence mi declaración?",
            "¿Cómo calculo el IGV?",
            "Ver mis métricas",
          ],
        } : undefined,
      };

      set(state => ({
        currentSession: state.currentSession 
          ? {
              ...state.currentSession,
              messages: [...state.currentSession.messages, kappiMessage],
              updatedAt: new Date().toISOString(),
            }
          : null,
        isTyping: false,
      }));

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, no pude procesar tu mensaje en este momento. ¿Puedes intentar de nuevo?',
        sender: 'kappi',
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      set(state => ({
        currentSession: state.currentSession 
          ? {
              ...state.currentSession,
              messages: [...state.currentSession.messages, errorMessage],
              updatedAt: new Date().toISOString(),
            }
          : null,
        isTyping: false,
        error: 'Error sending message',
      }));
    }
  },

  createSession: () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      userId: 'user1',
      title: 'Nueva conversación',
      messages: [
        {
          id: '1',
          content: '¡Hola! Soy Kappi, tu asistente para emprendedores. ¿En qué te puedo ayudar hoy?',
          sender: 'kappi',
          timestamp: new Date().toISOString(),
          type: 'text',
          metadata: {
            suggestions: [
              "¿Cuánto debo declarar este mes?",
              "¿Cuánto llevo declarando?",
              "¿Qué impuestos me tocan?",
              "¿Cómo calculo el IGV?",
            ],
          },
        },
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set(state => ({
      currentSession: newSession,
      sessions: [newSession, ...state.sessions],
    }));
  },

  loadSession: (sessionId: string) => {
    const { sessions } = get();
    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
      set({ currentSession: session });
    }
  },

  clearCurrentSession: () => {
    set({ currentSession: null });
  },

  getSuggestions: async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return [
        "¿Cuánto debo declarar este mes?",
        "¿Cuánto llevo declarando?",
        "¿Qué impuestos me tocan?",
        "¿Cómo calculo el IGV?",
        "¿Cuándo vence mi declaración?",
      ];
    } catch (error) {
      throw new Error('Error getting suggestions');
    }
  },

  setTyping: (isTyping: boolean) => set({ isTyping }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));