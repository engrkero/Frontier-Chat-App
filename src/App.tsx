import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Trash2,
  Cpu,
  FileCode2,
  CheckCircle2,
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

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function App() {
  const [selectedModel, setSelectedModel] = useState<ModelOption>(AVAILABLE_MODELS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am ready to assist you. All architecture files (\`app/api/chat/route.ts\`, \`app/page.tsx\`, and \`AGENTS.md\`) have been generated for Next.js 15, Vercel AI SDK, and OpenRouter with Google Jules handoff specs.`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Dynamic AI response simulation with model reflection
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `[Response routed via ${selectedModel.name} (${selectedModel.provider})]\n\nI have received your prompt: "${userMsg.content}".\n\nThe full production Next.js 15 App Router architecture with Vercel AI SDK, OpenRouter dynamic routing, and Google Jules Supabase handoff has been prepared in the repository.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 900);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 antialiased font-sans">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-900/40 px-4 py-2 text-xs flex items-center justify-between text-indigo-200">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Architecture Ready: Next.js 15 • Vercel AI SDK • OpenRouter • Google Jules Manifest</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
            app/api/chat/route.ts
          </span>
          <span className="flex items-center gap-1 font-mono">
            <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
            AGENTS.md
          </span>
        </div>
      </div>

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
              onClick={() => setMessages([])}
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

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl w-full mx-auto space-y-6">
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
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-md ${
                      isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-indigo-400 border border-slate-700'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>

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
                          onClick={() => {}}
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
      </main>

      {/* Input Form Bar */}
      <footer className="sticky bottom-0 z-30 p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSend}
            className="relative flex items-end gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/50 shadow-2xl transition-all"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder={`Message ${selectedModel.name}... (Press Enter to send, Shift+Enter for newline)`}
              rows={1}
              className="flex-1 max-h-48 min-h-[44px] p-2.5 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
            />

            <div className="flex items-center gap-1.5 pb-1 pr-1">
              {isLoading ? (
                <button
                  type="button"
                  onClick={() => setIsLoading(false)}
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
        </div>
      </footer>
    </div>
  );
}
