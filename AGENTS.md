# AGENTS.md — Mission Briefing for Google Jules

Welcome, **Google Jules**. This document outlines the architecture, existing codebase conventions, and your primary objectives for this application.

---

## 1. System Architecture Overview

This project is a high-performance, real-time AI chat platform built with modern web technologies:
- **Framework**: Next.js 15 (App Router with Server & Client components)
- **AI Orchestration**: Vercel AI SDK (`ai`, `@ai-sdk/openai`)
- **Model Gateway**: OpenRouter API (`https://openrouter.ai/api/v1`)
- **Styling & Motion**: Tailwind CSS + Framer Motion (physics-driven spring layout animations)
- **Icons**: Lucide React

### Current Dynamic Model Routing
The application dynamically routes chat completions through OpenRouter across frontier AI models:
- `deepseek/deepseek-v4-pro` (Flagship reasoning & coding)
- `qwen/qwen-2.5-72b-instruct` (High performance multilingual instruction)
- `google/gemini-2.5-pro` (Advanced multimodal frontier model)

### Existing Files
1. `app/api/chat/route.ts`: Edge-compatible API route wrapping OpenRouter with streaming responses via `streamText` & `toDataStreamResponse()`.
2. `app/page.tsx`: Client-side interface with spring-based message rendering, dynamic model switching dropdown, auto-scrolling, clipboard utilities, and error resilience.

---

## 2. Your Primary Mission: Supabase Integration

**Google Jules Objective**: Integrate **Supabase** to transform this prototype into a full-stack, multi-user authenticated chat ecosystem with durable PostgreSQL persistence.

### Required Sub-Tasks:

### A. Authentication & Session Management
- Integrate `@supabase/supabase-js` and `@supabase/ssr`.
- Implement Supabase Auth (Email/Password, Magic Link, and Google OAuth).
- Add middleware (`middleware.ts`) for session protection and refreshing auth tokens.
- Add user profile display and sign-in/sign-out controls in the header navigation.

### B. PostgreSQL Chat History & Schemas
Implement database tables with Row Level Security (RLS) enabled:

```sql
-- 1. Profiles Table (linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Conversations / Sessions Table
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text default 'New Conversation' not null,
  model text default 'deepseek/deepseek-v4-pro' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Messages Table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Policies for Authenticated Users
create policy "Users can access their own profile" on public.profiles for all using (auth.uid() = id);
create policy "Users can manage their own conversations" on public.conversations for all using (auth.uid() = user_id);
create policy "Users can access messages of their conversations" on public.messages 
  for all using (
    exists (
      select 1 from public.conversations 
      where public.conversations.id = public.messages.conversation_id 
      and public.conversations.user_id = auth.uid()
    )
  );
```

### C. Sidebar Conversation History
- Build a responsive collapsible sidebar listing historical user conversations.
- Support creating new chats, renaming conversation titles (auto-generated or user-edited), deleting threads, and switching between chat sessions.

### D. Streaming Storage Pipeline
- In `app/api/chat/route.ts`, persist user messages on ingress and use the Vercel AI SDK `onFinish` lifecycle callback in `streamText` to persist complete assistant responses directly into Supabase `public.messages`.

---

## 3. Required Environment Variables

Ensure these are declared and populated in `.env.local` / `.env.example`:

```env
# OpenRouter API Key
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Supabase Public & Private Keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App URL Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4. Coding Standards & Conventions
- Maintain strict TypeScript type safety throughout all database queries.
- Keep Framer Motion animations smooth using layout animations and physics springs.
- Always verify RLS policies so no unauthorized access occurs between tenant users.
- Good luck, Jules!
