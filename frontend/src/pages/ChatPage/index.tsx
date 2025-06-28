import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { KappiAvatar } from '@/widgets/Chatbot';
import { ChatMessage } from '@/shared/types';

const predefinedSuggestions = [
  "¿Cuánto debo declarar este mes?",
  "¿Cuánto llevo declarando?",
  "¿Qué impuestos me tocan?",
  "¿Cómo calculo el IGV?",
];

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '¡Hola! Soy Kappi, tu asistente para emprendedores. ¿En qué te puedo ayudar hoy?',
      sender: 'kappi',
      timestamp: new Date().toISOString(),
      type: 'text',
      metadata: {
        suggestions: predefinedSuggestions,
      },
    },
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate API call to Kappi
    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message: content }),
      });

      const result = await response.json();
      
      if (result.success) {
        const kappiMessage: ChatMessage = {
          ...result.data,
          id: (Date.now() + 1).toString(),
        };
        
        setMessages(prev => [...prev, kappiMessage]);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, no pude procesar tu mensaje en este momento. ¿Puedes intentar de nuevo?',
        sender: 'kappi',
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(inputMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-50">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message) => (
          <div key={message.id} className="animate-slide-up">
            {message.sender === 'kappi' ? (
              <div className="flex items-start space-x-3">
                <KappiAvatar 
                  size="sm" 
                  expression={isTyping ? 'thinking' : 'happy'} 
                />
                <div className="flex-1">
                  <div className="kappi-chat-bubble">
                    <p className="text-gray-800">{message.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  
                  {/* Suggestions */}
                  {message.metadata?.suggestions && (
                    <div className="mt-3 space-y-2">
                      {message.metadata.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left p-3 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="user-chat-bubble">
                  <p>{message.content}</p>
                  <p className="text-xs text-primary-200 mt-2">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <KappiAvatar size="sm" expression="thinking" />
            <div className="kappi-chat-bubble">
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Kappi está escribiendo...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribir consulta..."
              disabled={isTyping}
              fullWidth
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            size="md"
            className="p-3"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center justify-center space-x-4 mt-3">
          <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
            <Mic className="w-4 h-4" />
            <span className="text-sm">Voz</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
            <Plus className="w-4 h-4" />
            <span className="text-sm">Adjuntar</span>
          </button>
        </div>
      </div>
    </div>
  );
};