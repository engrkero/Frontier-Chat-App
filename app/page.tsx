'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { AuthHeader } from './components/AuthHeader';
import { Sidebar } from './components/Sidebar';
import {
  Sparkles, Send, Square, Bot, User, ChevronDown, RefreshCw, Copy, Check, Zap, Brain, Globe, Trash2, Cpu,
} from 'lucide-react';

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek V4 Pro', provider: 'DeepSeek', description: 'Frontier reasoning and dense coding intelligence', badge: 'Flagship', icon: Brain },
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'Alibaba Cloud', description: 'High-performance multilingual and mathematical master', badge: 'Fast & Precise', icon: Cpu },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google DeepMind', description: 'Advanced multimodal reasoning with massive context depth', badge: 'Frontier', icon: Sparkles },
];

const springConfig = { type: 'spring', stiffness: 400, damping: 25, mass: 0.8 };
const swiftSpring = { type: 'spring' as const, stiffness: 500, damping: 30, mass: 0.5 };

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState<ModelOption>(AVAILABLE_MODELS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const supabase = createClient();

  // Load user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, reload, setMessages } = useChat({
    api: '/api/chat',
    body: {
      model: selectedModel.id,
      conversationId: currentConversationId,
    },
    onError: (err) => console.error('Chat error:', err),
  });

  // Load conversation messages
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    } else {
      setMessages([]);
    }
  }, [currentConversationId]);

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      })));
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = async () => {
    if (currentConversationId) {
      await supabase.from('messages').delete().eq('conversation_id', currentConversationId);
    }
    setMessages([]);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    let targetConvId = currentConversationId;
    if (!targetConvId && user) {
      const { data } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, title: input.trim().substring(0, 30) + '...' })
        .select()
        .single();

      if (data) {
        targetConvId = data.id;
        setCurrentConversationId(targetConvId);
      }
    }
    handleSubmit(e, { body: { conversationId: targetConvId } });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        const formEvent = new Event('submit', { bubbles: true, cancelable: true });
        e.currentTarget.form?.dispatchEvent(formEvent);
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-slate-100 antialiased overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        user={user}
      />

      <div className="flex flex-col flex-1 min-w-0 relative">
        {/* Glow effect background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/[0.05] bg-black/40 backdrop-blur-2xl z-30">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={swiftSpring}
            className="flex items-center gap-3 ml-10 md:ml-0"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-white/10">
              <Zap className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-wider text-white flex items-center gap-2 uppercase">
                Frontier
              </h1>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={swiftSpring}
            className="flex items-center gap-2 sm:gap-4"
          >
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] text-sm font-medium text-slate-200 transition-colors shadow-lg"
              >
                {React.createElement(selectedModel.icon, { className: 'w-4 h-4 text-indigo-400 hidden sm:block' })}
                <span className="max-w-[100px] sm:max-w-none truncate">{selectedModel.name}</span>
                <motion.div animate={{ rotate: isModelDropdownOpen ? 180 : 0 }} transition={swiftSpring}>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isModelDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(5px)' }}
                    transition={swiftSpring}
                    className="absolute right-0 mt-3 w-72 sm:w-80 rounded-2xl bg-[#0a0a0a]/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl p-2 z-50 overflow-hidden"
                  >
                    <div className="space-y-1">
                      {AVAILABLE_MODELS.map((model, idx) => {
                        const Icon = model.icon;
                        const isSelected = selectedModel.id === model.id;
                        return (
                          <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ ...swiftSpring, delay: idx * 0.05 }}
                            key={model.id}
                            onClick={() => { setSelectedModel(model); setIsModelDropdownOpen(false); }}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all relative overflow-hidden group ${isSelected ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-white/[0.04] border border-transparent'}`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="activeModelIndicator"
                                className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none"
                              />
                            )}
                            <div className={`p-2 rounded-lg mt-0.5 relative z-10 transition-colors ${isSelected ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0 relative z-10">
                              <div className="text-sm font-medium text-white">{model.name}</div>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 group-hover:text-slate-300 transition-colors">{model.description}</p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-white/10" />
            <AuthHeader />
          </motion.div>
        </header>

        {/* Main Chat Stream Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 w-full mx-auto space-y-6 relative z-10">
          <div className="max-w-3xl mx-auto w-full">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ ...swiftSpring, delay: 0.1 }}
                className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center px-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={swiftSpring}
                  className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(99,102,241,0.15)] relative group"
                >
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-[2rem] blur-xl group-hover:bg-indigo-500/30 transition-colors duration-500" />
                  <Sparkles className="w-8 h-8 text-indigo-400 relative z-10" />
                </motion.div>
                <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-3">
                  System Initialized.
                </h2>
                <p className="text-sm text-slate-400 max-w-md mb-8">
                  Routing intelligence through <span className="text-indigo-400 font-medium">{selectedModel.name}</span>.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-8 pb-24">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => {
                    const isUser = message.role === 'user';
                    return (
                      <motion.div
                        key={message.id || index}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        transition={swiftSpring}
                        className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border ${isUser ? 'bg-indigo-500 border-indigo-400/30 text-white shadow-indigo-500/20' : 'bg-[#111] border-white/10 text-indigo-400 shadow-black/50'}`}
                        >
                          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </motion.div>
                        <div className={`relative group max-w-[85%] sm:max-w-[80%] rounded-[1.5rem] px-5 py-4 text-[15px] leading-relaxed shadow-lg backdrop-blur-md ${isUser ? 'bg-indigo-600 text-white rounded-tr-none border border-indigo-500/50 shadow-indigo-500/10' : 'bg-[#111]/80 border border-white/10 text-slate-200 rounded-tl-none'}`}>
                          <div className="whitespace-pre-wrap break-words">{message.content}</div>
                          <div className={`mt-3 pt-3 border-t flex items-center gap-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isUser ? 'justify-end text-indigo-200 border-indigo-500/40' : 'justify-start text-slate-400 border-white/5'}`}>
                            <button onClick={() => handleCopy(message.content, index)} className="flex items-center gap-1.5 hover:text-white transition-colors">
                              {copiedIndex === index ? <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400 font-medium">Copied</span></> : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {isLoading && (
                  <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={swiftSpring} className="flex items-center gap-3 text-xs text-slate-400 pl-[3.5rem]">
                    <div className="flex gap-1.5">
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    </div>
                    <span className="font-medium tracking-wide text-indigo-400/70 uppercase text-[10px]">Processing...</span>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>

        {/* Input Form Bar */}
        <footer className="absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pt-10">
          <div className="max-w-3xl mx-auto w-full">
            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={swiftSpring}
              onSubmit={handleFormSubmit}
              className="relative flex items-end gap-2 p-2 rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 group"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Initialize sequence..."
                rows={1}
                className="flex-1 max-h-48 min-h-[48px] p-3 bg-transparent text-[15px] text-white placeholder-slate-500 focus:outline-none resize-none relative z-10"
                style={{ height: 'auto' }}
              />
              <div className="flex items-center gap-1.5 pb-1.5 pr-1.5 relative z-10">
                {isLoading ? (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => stop()} className="flex items-center justify-center w-10 h-10 rounded-[14px] bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 transition-colors">
                    <Square className="w-4 h-4 fill-current" />
                  </motion.button>
                ) : (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={!input.trim()} className="flex items-center justify-center w-10 h-10 rounded-[14px] bg-indigo-500 hover:bg-indigo-400 disabled:bg-white/5 border border-indigo-400/50 disabled:border-transparent text-white disabled:text-slate-600 shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:shadow-none transition-all">
                    <Send className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.form>
          </div>
        </footer>
      </div>
    </div>
  );
}
