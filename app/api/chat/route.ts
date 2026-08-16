import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

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

export async function POST(req: Request) {
  try {
    const { messages, model = 'deepseek/deepseek-v4-pro' } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages array provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = streamText({
      model: openrouter(model),
      messages,
      system: `You are an elite, highly capable AI assistant powered by frontier foundation models. 
Provide clear, accurate, thoughtful, and well-structured answers using Markdown formatting where appropriate.`,
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
