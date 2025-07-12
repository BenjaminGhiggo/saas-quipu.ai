import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from '../app/store/chatStore';
import { ChatMessage } from '../shared/types';

// Mock fetch
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage
});

describe('ChatStore', () => {
  beforeEach(() => {
    // Reset store state
    useChatStore.setState({
      currentSession: null,
      sessions: [],
      loading: false,
      error: null,
      isTyping: false,
    });
    
    // Reset mocks
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  describe('createSession', () => {
    it('should create a new session with welcome message', () => {
      const { createSession, currentSession } = useChatStore.getState();
      
      createSession();
      
      const newSession = useChatStore.getState().currentSession;
      
      expect(newSession).not.toBeNull();
      expect(newSession?.title).toBe('Nueva conversación');
      expect(newSession?.messages).toHaveLength(1);
      expect(newSession?.messages[0].content).toContain('¡Hola! Soy Kappi');
      expect(newSession?.messages[0].sender).toBe('kappi');
      expect(newSession?.messages[0].metadata?.suggestions).toHaveLength(4);
    });

    it('should add session to sessions array', () => {
      const { createSession } = useChatStore.getState();
      
      createSession();
      
      const { sessions } = useChatStore.getState();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].title).toBe('Nueva conversación');
    });
  });

  describe('sendMessage', () => {
    it('should add user message to current session', async () => {
      const { createSession, sendMessage } = useChatStore.getState();
      
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: '123',
            content: 'Respuesta de Kappi',
            sender: 'kappi',
            timestamp: new Date().toISOString(),
            suggestions: ['Sugerencia 1', 'Sugerencia 2']
          }
        })
      } as Response);

      createSession();
      
      await sendMessage('¿Cuánto debo declarar?');
      
      const { currentSession } = useChatStore.getState();
      const messages = currentSession?.messages || [];
      
      // Should have welcome message + user message + kappi response
      expect(messages).toHaveLength(3);
      expect(messages[1].content).toBe('¿Cuánto debo declarar?');
      expect(messages[1].sender).toBe('user');
      expect(messages[2].content).toBe('Respuesta de Kappi');
      expect(messages[2].sender).toBe('kappi');
    });

    it('should handle API errors gracefully', async () => {
      const { createSession, sendMessage } = useChatStore.getState();
      
      // Mock API error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      createSession();
      
      await sendMessage('Test message');
      
      const { currentSession } = useChatStore.getState();
      const messages = currentSession?.messages || [];
      
      // Should have welcome message + user message + error message
      expect(messages).toHaveLength(3);
      expect(messages[2].content).toContain('Lo siento, no pude procesar tu mensaje');
      expect(messages[2].sender).toBe('kappi');
    });

    it('should set typing state during message processing', async () => {
      const { createSession, sendMessage } = useChatStore.getState();
      
      // Mock API with delay
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: {
                id: '123',
                content: 'Respuesta',
                sender: 'kappi',
                timestamp: new Date().toISOString()
              }
            })
          } as Response), 100)
        )
      );

      createSession();
      
      // Start sending message
      const messagePromise = sendMessage('Test');
      
      // Check that typing is set to true
      expect(useChatStore.getState().isTyping).toBe(true);
      
      // Wait for completion
      await messagePromise;
      
      // Check that typing is set to false
      expect(useChatStore.getState().isTyping).toBe(false);
    });

    it('should use correct API endpoint with environment variable', async () => {
      const { createSession, sendMessage } = useChatStore.getState();
      
      // Mock environment variable
      vi.stubEnv('VITE_API_URL', 'http://test-api.com/api');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: '123',
            content: 'Response',
            sender: 'kappi',
            timestamp: new Date().toISOString()
          }
        })
      } as Response);

      createSession();
      
      await sendMessage('Test message');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/api/chat/message',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }),
          body: JSON.stringify({ message: 'Test message' })
        })
      );
    });

    it('should create session automatically if none exists', async () => {
      const { sendMessage } = useChatStore.getState();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: '123',
            content: 'Response',
            sender: 'kappi',
            timestamp: new Date().toISOString()
          }
        })
      } as Response);

      // Don't create session manually
      expect(useChatStore.getState().currentSession).toBeNull();
      
      await sendMessage('Test message');
      
      // Should have created session automatically
      expect(useChatStore.getState().currentSession).not.toBeNull();
    });
  });

  describe('loadSession', () => {
    it('should load existing session by ID', () => {
      const { createSession, loadSession } = useChatStore.getState();
      
      createSession();
      const sessionId = useChatStore.getState().currentSession?.id || '';
      
      // Clear current session
      useChatStore.setState({ currentSession: null });
      
      // Load session
      loadSession(sessionId);
      
      const { currentSession } = useChatStore.getState();
      expect(currentSession?.id).toBe(sessionId);
    });

    it('should not change current session if ID not found', () => {
      const { createSession, loadSession } = useChatStore.getState();
      
      createSession();
      const originalSession = useChatStore.getState().currentSession;
      
      // Try to load non-existent session
      loadSession('non-existent-id');
      
      const { currentSession } = useChatStore.getState();
      expect(currentSession).toBe(originalSession);
    });
  });

  describe('clearCurrentSession', () => {
    it('should clear current session', () => {
      const { createSession, clearCurrentSession } = useChatStore.getState();
      
      createSession();
      expect(useChatStore.getState().currentSession).not.toBeNull();
      
      clearCurrentSession();
      expect(useChatStore.getState().currentSession).toBeNull();
    });
  });

  describe('getSuggestions', () => {
    it('should return array of suggestions', async () => {
      const { getSuggestions } = useChatStore.getState();
      
      const suggestions = await getSuggestions();
      
      expect(suggestions).toHaveLength(5);
      expect(suggestions).toContain('¿Cuánto debo declarar este mes?');
      expect(suggestions).toContain('¿Cuánto llevo declarando?');
    });
  });

  describe('state setters', () => {
    it('should set typing state', () => {
      const { setTyping } = useChatStore.getState();
      
      setTyping(true);
      expect(useChatStore.getState().isTyping).toBe(true);
      
      setTyping(false);
      expect(useChatStore.getState().isTyping).toBe(false);
    });

    it('should set loading state', () => {
      const { setLoading } = useChatStore.getState();
      
      setLoading(true);
      expect(useChatStore.getState().loading).toBe(true);
      
      setLoading(false);
      expect(useChatStore.getState().loading).toBe(false);
    });

    it('should set error state', () => {
      const { setError } = useChatStore.getState();
      
      setError('Test error');
      expect(useChatStore.getState().error).toBe('Test error');
      
      setError(null);
      expect(useChatStore.getState().error).toBeNull();
    });
  });
});