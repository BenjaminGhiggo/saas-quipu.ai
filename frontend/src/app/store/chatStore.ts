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
      // Call backend chat API
      const apiUrl = 'http://167.86.90.102:7000/api';
      const response = await fetch(`${apiUrl}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ message: content }),
      });

      const result = await response.json();
      
      if (result.success) {
        const kappiMessage: ChatMessage = {
          ...result.data,
          id: (Date.now() + 1).toString(),
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
      } else {
        throw new Error(result.message || 'Error en respuesta de chat');
      }
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