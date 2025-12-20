
// Fix: Updated Gemini API integration to strictly follow guidelines for API key and Maps grounding
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, X, Send, MapPin, Loader2, Minimize2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { Product } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
  chunks?: any[];
}

interface Props {
  availableProducts?: Product[];
}

export const ChatBot: React.FC<Props> = ({ availableProducts = [] }) => {
  const { currentParish, cart, stores, userCoords } = useShop();
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
      // Fix: Strictly use process.env.API_KEY as per hard requirements
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Create a lightweight context of products to send to the model from REAL Data
      // Fix: Added explicit casting for prices and a non-mutating sort to resolve arithmetic operation type errors
      const productContext = JSON.stringify((availableProducts || []).map((p: Product) => {
        const storePrices = Object.entries(p.prices || {}).map(([storeId, price]) => {
           const store = stores.find(s => s.id === storeId);
           return { 
               storeName: store ? store.name : storeId, 
               location: store ? store.location : 'Unknown',
               price: Number(price)
           };
        });
        
        // Find best price for this product locally by sorting a shallow copy
        const sortedStorePrices = [...storePrices].sort((a, b) => (a.price as number) - (b.price as number));
        const bestStore = sortedStorePrices[0];

        return {
          name: p.name,
          brand: p.brand,
          unit: p.unit,
          bestPrice: bestStore ? bestStore.price : null,
          bestStore: bestStore ? bestStore.storeName : null,
          allPrices: storePrices
        };
      }).slice(0, 100)); // Increased context to 100 items

      const systemInstruction = `You are the Shelf Scout AI Assistant for ${currentParish?.name || 'Jamaica'}.
      
      Current Available Products in ${currentParish?.name || 'this area'}:
      ${productContext}

      Core Rules:
      1. Scan the product list for the item the user mentions.
      2. If you find a match: Say exactly "I found [Product Name] for $[Price] at [Store Name]." (Use the best/lowest price).
      3. If you do NOT find a matching item in the list: Say exactly "I don't see that item in the current ${currentParish?.name || 'Kingston & St. Andrew'} list."
      4. Never make up prices or stores. Only use the provided product list.
      5. If the user asks about multiple items, provide the best deal for each.
      6. For location or store queries, use the googleMaps tool.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMessage,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ googleMaps: {} }],
          toolConfig: userCoords ? {
            retrievalConfig: {
              latLng: {
                latitude: userCoords.lat,
                longitude: userCoords.lng
              }
            }
          } : undefined,
        },
      });

      const responseText = response.text || "I'm sorry, I couldn't process that request.";
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

  const isCartVisible = cart.length > 0;

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 z-40 p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 ${
          isOpen ? 'hidden' : 'flex'
        } ${isDarkMode ? 'bg-teal-600 text-white' : 'bg-slate-900 text-white'} ${isCartVisible ? '-translate-y-[70px]' : ''}`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-0 right-0 left-0 sm:left-auto sm:bottom-24 sm:right-4 w-full sm:w-96 h-[80vh] sm:h-[600px] sm:max-h-[calc(100vh-8rem)] z-50 flex flex-col shadow-2xl rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200/20 overflow-hidden ${
          isDarkMode ? 'bg-teal-950' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`p-4 flex justify-between items-center border-b flex-shrink-0 ${
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
                  
                  {/* ALWAYS extract URLs from groundingChunks and list them as links */}
                  {msg.chunks && msg.chunks.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.chunks.map((chunk: any, cIdx: number) => {
                         const uri = chunk.maps?.uri || chunk.web?.uri;
                         const title = chunk.maps?.title || chunk.web?.title;
                         
                         if (uri) {
                             return (
                                 <a key={cIdx} href={uri} target="_blank" rel="noreferrer" className="block bg-white/10 hover:bg-white/20 p-2 rounded border border-white/20 text-xs flex items-center">
                                    <MapPin size={12} className="mr-2 flex-shrink-0" />
                                    <span className="truncate">{title || 'View Link'}</span>
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
          <div className={`p-3 border-t flex-shrink-0 ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-white border-slate-100'}`}>
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
                  isDarkMode ? 'bg-teal-900 border-teal-800 text-white placeholder-teal-400' : 'bg-slate-50 text-slate-900'
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
