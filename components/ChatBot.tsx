import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, X, Send, MapPin, Loader2, Minimize2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { PRODUCTS, STORES } from '../constants';

interface Message {
  role: 'user' | 'model';
  text: string;
  chunks?: any[];
}

export const ChatBot: React.FC = () => {
  const { currentParish } = useShop();
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm your Shelf Scout Assistant. Ask me about the best prices for Oxtail, Rice, or specific stores nearby!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Create a lightweight context of products to send to the model
      const productContext = JSON.stringify(PRODUCTS.map(p => ({
        name: p.name,
        category: p.category,
        avgPrice: Object.values(p.prices).reduce((a, b) => a + b, 0) / Object.values(p.prices).length,
        stores: Object.entries(p.prices).map(([storeId, price]) => {
           const store = STORES.find(s => s.id === storeId);
           return { name: store?.name, price, parish: store?.parish_id };
        })
      })).slice(0, 10)); // Limit context size for performance

      const systemInstruction = `You are the Shelf Scout Assistant. The user is currently in ${currentParish?.name || 'Jamaica'}.
      
      Here is the current database of products and prices found by our scouts:
      ${productContext}

      Use this data to answer questions like "Who has the cheapest rice?".
      If the user asks about a location, distance, or a specific store address, ALWAYS use the googleMaps tool.
      Keep responses concise, friendly, and helpful for a mobile user.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMessage,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ googleMaps: {} }],
        },
      });

      let responseText = response.text || "I found some info but couldn't parse the text.";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseText,
        chunks: groundingChunks
      }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to the network right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 z-40 p-4 rounded-full shadow-xl transition-transform hover:scale-105 ${
          isOpen ? 'hidden' : 'flex'
        } ${isDarkMode ? 'bg-teal-600 text-white' : 'bg-slate-900 text-white'}`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-0 right-0 left-0 sm:left-auto sm:bottom-20 sm:right-4 w-full sm:w-96 h-[80vh] sm:h-[600px] z-50 flex flex-col shadow-2xl rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200/20 overflow-hidden ${
          isDarkMode ? 'bg-teal-950' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`p-4 flex justify-between items-center border-b ${
            isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-slate-900'
          }`}>
            <div className="flex items-center text-white">
              <div className="bg-emerald-500 p-1.5 rounded-lg mr-2">
                <MessageCircle size={16} className="text-white" />
              </div>
              <span className="font-bold text-sm">Shelf Scout AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : (isDarkMode ? 'bg-teal-800 text-slate-100 rounded-bl-none' : 'bg-slate-100 text-slate-800 rounded-bl-none')
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  
                  {/* Map Chips */}
                  {msg.chunks && msg.chunks.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.chunks.map((chunk: any, cIdx: number) => {
                         if (chunk.web?.uri) {
                             return (
                                 <a key={cIdx} href={chunk.web.uri} target="_blank" rel="noreferrer" className="block bg-white/10 hover:bg-white/20 p-2 rounded border border-white/20 text-xs flex items-center">
                                    <MapPin size={12} className="mr-2 flex-shrink-0" />
                                    <span className="truncate">{chunk.web.title}</span>
                                 </a>
                             )
                         }
                         return null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className={`p-3 rounded-2xl rounded-bl-none ${isDarkMode ? 'bg-teal-800' : 'bg-slate-100'}`}>
                    <Loader2 size={16} className="animate-spin text-emerald-500" />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`p-3 border-t ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-white border-slate-100'}`}>
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about stores nearby..."
                className={`flex-1 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDarkMode ? 'bg-teal-800 text-white placeholder-teal-400' : 'bg-slate-50 text-slate-900'
                }`}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};