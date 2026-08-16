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
        // Need to create a synthetic event for handleSubmit
        const formEvent = new Event('submit', { bubbles: true, cancelable: true });
        e.currentTarget.form?.dispatchEvent(formEvent);
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 antialiased overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        user={user}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-3 ml-10 md:ml-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-lg shadow-indigo-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                Frontier Chat
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-sm font-medium text-slate-200 transition-all active:scale-[0.98]"
              >
                {React.createElement(selectedModel.icon, { className: 'w-4 h-4 text-indigo-400 hidden sm:block' })}
                <span className="max-w-[100px] sm:max-w-none truncate">{selectedModel.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isModelDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-2xl p-2 z-50 overflow-hidden"
                  >
                    <div className="space-y-1">
                      {AVAILABLE_MODELS.map((model) => {
                        const Icon = model.icon;
                        const isSelected = selectedModel.id === model.id;
                        return (
                          <button
                            key={model.id}
                            onClick={() => { setSelectedModel(model); setIsModelDropdownOpen(false); }}
                            className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${isSelected ? 'bg-indigo-600/15 border border-indigo-500/30' : 'hover:bg-slate-800/60 border border-transparent'}`}
                          >
                            <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white">{model.name}</div>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{model.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-slate-800" />
            <AuthHeader />
          </div>
        </header>

        {/* Main Chat Stream Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 w-full mx-auto space-y-6">
          <div className="max-w-3xl mx-auto w-full">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center px-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl"
                >
                  <Sparkles className="w-8 h-8 text-indigo-400" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold tracking-tight text-white mb-2"
                >
                  How can I assist you today?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-slate-400 max-w-md mb-8"
                >
                  Routing requests through <span className="text-indigo-300 font-medium">{selectedModel.name}</span>.
                </motion.p>
              </div>
            ) : (
              <div className="space-y-6 pb-20">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => {
                    const isUser = message.role === 'user';
                    return (
                      <motion.div
                        key={message.id || index}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-md ${isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'}`}>
                          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${isUser ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'}`}>
                          <div className="whitespace-pre-wrap break-words">{message.content}</div>
                          <div className={`mt-2 pt-2 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'justify-end text-indigo-200 border-indigo-500/40' : 'justify-start'}`}>
                            <button onClick={() => handleCopy(message.content, index)} className="flex items-center gap-1 hover:text-white transition-colors">
                              {copiedIndex === index ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></> : <><Copy className="w-3 h-3" /><span>Copy</span></>}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {isLoading && (
                  <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-xs text-slate-400 pl-12">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>
                    <span>Generating response...</span>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </main>

        {/* Input Form Bar */}
        <footer className="flex-shrink-0 p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/80">
          <div className="max-w-3xl mx-auto w-full">
            <form onSubmit={handleFormSubmit} className="relative flex items-end gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-indigo-500/80 shadow-2xl transition-all">
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message... (Press Enter to send)"
                rows={1}
                className="flex-1 max-h-48 min-h-[44px] p-2.5 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                style={{ height: 'auto' }}
              />
              <div className="flex items-center gap-1.5 pb-1 pr-1">
                {isLoading ? (
                  <button type="button" onClick={() => stop()} className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md">
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button type="submit" disabled={!input.trim()} className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-600 shadow-md">
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
}
