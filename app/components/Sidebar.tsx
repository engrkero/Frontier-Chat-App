'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plus, Trash2, Edit2, X, Check, PanelLeftClose, PanelLeft } from 'lucide-react'

interface Conversation {
  id: string
  title: string
  created_at: string
}

interface SidebarProps {
  currentConversationId: string | null
  onSelectConversation: (id: string | null) => void
  user: any
}

export function Sidebar({ currentConversationId, onSelectConversation, user }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isOpen, setIsOpen] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchConversations()
    } else {
      setConversations([])
    }
  }, [user])

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, created_at')
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setConversations(data)
    }
  }

  const createNewConversation = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title: 'New Conversation' })
      .select()
      .single()

    if (!error && data) {
      setConversations([data, ...conversations])
      onSelectConversation(data.id)
    }
  }

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const { error } = await supabase.from('conversations').delete().eq('id', id)
    if (!error) {
      setConversations(conversations.filter(c => c.id !== id))
      if (currentConversationId === id) {
        onSelectConversation(null)
      }
    }
  }

  const startEditing = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(conversation.id)
    setEditTitle(conversation.title)
  }

  const saveTitle = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!editTitle.trim()) {
      setEditingId(null)
      return
    }

    const { error } = await supabase
      .from('conversations')
      .update({ title: editTitle })
      .eq('id', id)

    if (!error) {
      setConversations(conversations.map(c => c.id === id ? { ...c, title: editTitle } : c))
      setEditingId(null)
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-3.5 left-4 z-50 p-1.5 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800/80"
      >
        {isOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
      </button>

      {/* Sidebar Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed md:relative z-40 w-72 h-screen flex flex-col bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-xl"
          >
            <div className="p-4 pt-16 flex-shrink-0">
              <button
                onClick={createNewConversation}
                disabled={!user}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-xl transition-all shadow-sm active:scale-[0.98] text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
              {!user ? (
                <div className="text-center text-xs text-slate-500 mt-10 px-4">
                  Sign in to save and view your conversation history.
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center text-xs text-slate-500 mt-10">
                  No conversations yet.
                </div>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectConversation(c.id)}
                    className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      currentConversationId === c.id
                        ? 'bg-indigo-600/10 text-indigo-300'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentConversationId === c.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                      {editingId === c.id ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveTitle(c.id)
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button onClick={(e) => saveTitle(c.id, e)} className="text-emerald-400 hover:text-emerald-300 p-1">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingId(null) }} className="text-slate-400 hover:text-slate-300 p-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm truncate">{c.title}</span>
                      )}
                    </div>

                    {editingId !== c.id && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => startEditing(c, e)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-700"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => deleteConversation(c.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
