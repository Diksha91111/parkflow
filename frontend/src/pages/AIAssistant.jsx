import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, User, Bot, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import api from '../lib/api';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am your ParkSmart Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Check connectivity on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await api.get('/api/ai/ping');
      } catch (err) {
        console.warn('AI Backend not reachable, using offline mode.', err);
      }
    };
    checkBackend();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const newUserMessage = { role: 'user', content: userMessage };
    setInput('');
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Prepare history by filtering out initial bot greeting (Gemini expects history to start with user)
      const currentMessages = [...messages]; // This is the history BEFORE the new user message
      const chatHistory = currentMessages
        .filter(msg => msg.role !== 'bot' || currentMessages.indexOf(msg) !== 0) // Keep all except the very first greeting if it's bot
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

      // Ensure history starts with user if it's not empty
      const validHistory = [];
      let foundFirstUser = false;
      for (const msg of chatHistory) {
        if (msg.role === 'user') foundFirstUser = true;
        if (foundFirstUser) validHistory.push(msg);
      }

      const response = await api.post('/api/ai/chat', { 
        message: userMessage,
        history: validHistory
      });

      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'bot', content: response.data.reply }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback assistant if backend is down or route not found (404)
      const lowerMsg = userMessage.toLowerCase();
      let fallbackReply = "I'm having some trouble connecting to my brain right now. ";
      
      if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('how much')) {
        fallbackReply = "Parking prices usually range from ₹20 to ₹60 per hour. You can see the exact price for each spot on the map!";
      } else if (lowerMsg.includes('book') || lowerMsg.includes('reserve')) {
        fallbackReply = "To book a spot, just click on any parking marker on the map and select 'Book Now'. It's that easy!";
      } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        fallbackReply = "Hello! I'm your ParkSmart Assistant. How can I help you find a spot today?";
      } else if (lowerMsg.includes('where') || lowerMsg.includes('location')) {
        fallbackReply = "We have parking spots all over the city. Check the dashboard map to find the one nearest to you!";
      } else {
        fallbackReply = "I'm here to help! You can ask me about parking prices, how to book, or where to find spots.";
      }

      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: fallbackReply + " (Note: I'm currently running in offline mode)" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'bot', content: 'Hello! I am your ParkSmart Assistant. How can I help you today?' }]);
  };

  return (
    <div className="flex h-screen bg-transparent font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden p-6">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500 rounded-xl text-white shadow-lg shadow-brand-500/20">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ParkSmart AI Assistant</h1>
          </div>
          <button 
            onClick={clearChat}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
            title="Clear conversation"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 custom-scrollbar scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                  msg.role === 'user' ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700' : 'bg-brand-500 text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-slate-500" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
                  msg.role === 'user' 
                    ? 'bg-brand-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700/50 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-3"
            >
              <div className="shrink-0 w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-1.5 h-10">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about parking..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-lg dark:shadow-none text-slate-800 dark:text-slate-200 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 px-4 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md active:scale-95 group-hover:shadow-brand-500/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
