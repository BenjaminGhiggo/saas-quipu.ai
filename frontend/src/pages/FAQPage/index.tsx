import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { KappiAvatar } from '@/widgets/Chatbot';

export const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const categories = [
    {
      id: 'general',
      name: 'General',
      icon: '📋',
    },
    {
      id: 'facturas',
      name: 'Facturas y Boletas',
      icon: '🧾',
    },
    {
      id: 'declaraciones',
      name: 'Declaraciones',
      icon: '📊',
    },
    {
      id: 'pagos',
      name: 'Pagos',
      icon: '💳',
    },
  ];

  const faqs = [
    {
      id: '1',
      category: 'general',
      question: '¿Qué es Quipu.ai?',
      answer: 'Quipu.ai es tu contador virtual con inteligencia artificial que te ayuda a gestionar tu contabilidad, emisión de comprobantes y declaraciones de impuestos de manera automática.',
      helpful: 15,
      notHelpful: 2,
    },
    {
      id: '2',
      category: 'facturas',
      question: '¿Cómo emito una boleta o factura?',
      answer: 'Puedes emitir comprobantes de tres formas: subiendo un archivo, escaneando con la cámara, o ingresando los datos manualmente. Kappi te ayudará en todo el proceso.',
      helpful: 23,
      notHelpful: 1,
    },
    {
      id: '3',
      category: 'declaraciones',
      question: '¿Cuándo debo declarar mis impuestos?',
      answer: 'Las declaraciones mensuales vencen el día 19 del mes siguiente. Por ejemplo, la declaración de abril vence el 19 de mayo. Te enviaremos recordatorios automáticos.',
      helpful: 18,
      notHelpful: 0,
    },
    {
      id: '4',
      category: 'pagos',
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos Yape, transferencias bancarias, tarjetas de crédito y débito. También puedes configurar el pago automático para mayor comodidad.',
      helpful: 12,
      notHelpful: 3,
    },
  ];

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Preguntas Frecuentes
        </h1>
        <p className="text-gray-600">
          Encuentra respuestas rápidas a las dudas más comunes
        </p>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="Buscar en preguntas frecuentes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            className="p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors text-left"
            onClick={() => {
              // Filter by category
              console.log('Filter by', category.id);
            }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{category.icon}</span>
              <span className="font-medium text-gray-900">
                {category.name}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white rounded-lg border border-gray-200"
          >
            <button
              onClick={() => toggleExpanded(faq.id)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 pr-4">
                {faq.question}
              </span>
              {expandedItems.includes(faq.id) ? (
                <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </button>
            
            {expandedItems.includes(faq.id) && (
              <div className="px-4 pb-4">
                <p className="text-gray-700 mb-4">
                  {faq.answer}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    ¿Te fue útil esta respuesta?
                  </span>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-green-600 hover:text-green-700">
                      <span>👍</span>
                      <span>{faq.helpful}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-red-600 hover:text-red-700">
                      <span>👎</span>
                      <span>{faq.notHelpful}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredFaqs.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No encontramos resultados
          </h3>
          <p className="text-gray-600 mb-4">
            No hay preguntas que coincidan con tu búsqueda.
          </p>
        </div>
      )}

      {/* Help with Kappi */}
      <div className="bg-orange-50 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <KappiAvatar size="sm" expression="thinking" />
          <div>
            <h4 className="font-semibold text-orange-900 mb-1">
              ¿No encuentras lo que buscas?
            </h4>
            <p className="text-orange-800 text-sm">
              Kappi puede responder preguntas más específicas sobre tu contabilidad.
            </p>
          </div>
        </div>
        <button
          onClick={() => window.location.href = '/chat'}
          className="mt-3 text-orange-700 hover:text-orange-800 text-sm font-medium"
        >
          Preguntar a Kappi →
        </button>
      </div>
    </div>
  );
};