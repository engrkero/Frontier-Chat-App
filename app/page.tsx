'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Square,
  Bot,
  User,
  ChevronDown,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Brain,
  Globe,
  Trash2,
  Cpu,
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
  {
    id: 'deepseek/deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    provider: 'DeepSeek',
    description: 'Frontier reasoning and dense coding intelligence',
    badge: 'Flagship',
    icon: Brain,
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B',
    provider: 'Alibaba Cloud',
    description: 'High-performance multilingual and mathematical master',
    badge: 'Fast & Precise',
    icon: Cpu,
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google DeepMind',
    description: 'Advanced multimodal reasoning with massive context depth',
    badge: 'Frontier',
    icon: Sparkles,
  },
];

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState<ModelOption>(AVAILABLE_MODELS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    reload,
    setMessages,
  } = useChat({
    api: '/api/chat',
    body: {
      model: selectedModel.id,
    },
    onError: (err) => {
      console.error('Chat error:', err);
    },
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
              Frontier Chat
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v15 App Router
              </span>
            </h1>
            <p className="text-xs text-slate-400">Powered by Vercel AI SDK & OpenRouter</p>
          </div>
        </div>

        {/* Model Selector Dropdown & Actions */}
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-sm font-medium text-slate-200 hover:text-white transition-all shadow-sm active:scale-[0.98]"
            >
              {React.createElement(selectedModel.icon, { className: 'w-4 h-4 text-indigo-400' })}
              <span className="max-w-[140px] sm:max-w-none truncate">{selectedModel.name}</span>
              <span className="hidden sm:inline-block text-[11px] text-slate-400 font-normal">
                ({selectedModel.provider})
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isModelDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {isModelDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-2xl p-2 z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/60 mb-1">
                    Frontier AI Models
                  </div>
                  <div className="space-y-1">
                    {AVAILABLE_MODELS.map((model) => {
                      const Icon = model.icon;
                      const isSelected = selectedModel.id === model.id;
                      return (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-indigo-600/15 border border-indigo-500/30 text-white'
                              : 'hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg mt-0.5 ${
                              isSelected
                                ? 'bg-indigo-500 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-sm font-medium">{model.name}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  isSelected
                                    ? 'bg-indigo-500/20 text-indigo-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {model.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                              {model.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Chat Stream Container */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl w-full mx-auto space-y-6">
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
              Currently routing requests through{' '}
              <span className="text-indigo-300 font-medium">{selectedModel.name}</span>. Experience
              instant, fluid reasoning with full stream physics.
            </motion.p>

            {/* Quick Starters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
              {[
                { title: 'Code Review', prompt: 'Analyze this TypeScript code for concurrency bugs and performance bottlenecks.' },
                { title: 'System Architecture', prompt: 'Design an event-driven microservices architecture for real-time document sync.' },
                { title: 'Explain Logic', prompt: 'Explain the internal mechanics of Transformer Attention heads in simple terms.' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleInputChange({ target: { value: item.prompt } } as any);
                  }}
                  className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-left transition-all group hover:border-slate-700"
                >
                  <p className="text-xs font-semibold text-slate-300 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => {
                const isUser = message.role === 'user';
                return (
                  <motion.div
                    key={message.id || index}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 30,
                    }}
                    className={`flex items-start gap-3.5 ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-md ${
                        isUser
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-indigo-400 border border-slate-700'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>

                      {/* Message Actions */}
                      <div
                        className={`mt-2 pt-2 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isUser ? 'justify-end text-indigo-200 border-indigo-500/40' : 'justify-start'
                        }`}
                      >
                        <button
                          onClick={() => handleCopy(message.content, index)}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        {!isUser && index === messages.length - 1 && !isLoading && (
                          <button
                            onClick={() => reload()}
                            className="flex items-center gap-1 hover:text-white transition-colors ml-2"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Regenerate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-xs text-slate-400 pl-12"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span>Generating response with {selectedModel.name}...</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Form Bar */}
      <footer className="sticky bottom-0 z-30 p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/50 shadow-2xl transition-all"
          >
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${selectedModel.name}... (Press Enter to send, Shift+Enter for newline)`}
              rows={1}
              className="flex-1 max-h-48 min-h-[44px] p-2.5 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
              style={{ height: 'auto' }}
            />

            <div className="flex items-center gap-1.5 pb-1 pr-1">
              {isLoading ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md active:scale-95"
                  title="Stop generating"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-600 transition-all shadow-md active:scale-95 disabled:pointer-events-none"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-2">
            <span>Dynamic streaming enabled</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-indigo-400" />
              Routing via OpenRouter
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
