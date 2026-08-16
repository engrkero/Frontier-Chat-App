import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from '@/utils/supabase/server';

// Initialize OpenRouter provider via OpenAI-compatible endpoint
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Frontier AI Chat',
  },
});

export const runtime = 'edge';

// For the background saving of AI response, we cannot use createClient() inside onFinish
// because it tries to access cookies outside the request scope.
// We must initialize an admin/service-role client without cookies.
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { messages, model = 'deepseek/deepseek-v4-pro', conversationId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages array provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const latestMessage = messages[messages.length - 1];

    if (conversationId && latestMessage) {
      // Save the user's incoming message using the authenticated client
      const supabase = await createClient();
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: latestMessage.role,
        content: latestMessage.content,
      });
    }

    const result = streamText({
      model: openrouter(model),
      messages,
      system: `You are an elite, highly capable AI assistant powered by frontier foundation models. 
Provide clear, accurate, thoughtful, and well-structured answers using Markdown formatting where appropriate.`,
      async onFinish({ text }) {
        if (conversationId) {
          // Inside onFinish, the request context is gone. We must use a direct server client
          // that doesn't rely on cookies to bypass RLS or use the service role key.
          const adminSupabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );

          await adminSupabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: text,
          });

          await adminSupabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred during text generation',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
