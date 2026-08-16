# Deployment Guide & Live Integration

This guide walks you through deploying the fully-integrated Frontier Chat platform (Next.js + Supabase + OpenRouter) to production.

## 1. Supabase Initialization & Database Setup

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. In the Supabase Dashboard, navigate to **Project Settings -> API** to retrieve your:
   - `Project URL`
   - `anon` `public` key
   - `service_role` `secret` key
3. Navigate to the **SQL Editor** in the left sidebar.
4. Copy the entire contents of `supabase/schema.sql` (located in the root of this repository).
5. Paste it into the SQL Editor and click **Run**. This will create your `profiles`, `conversations`, and `messages` tables along with Row Level Security (RLS) policies and triggers.

## 2. Supabase Authentication Setup

1. In the Supabase Dashboard, go to **Authentication -> Providers**.
2. **Email Provider**: Ensure Email authentication is enabled. You can adjust the "Confirm email" settings based on whether you want immediate sign-ups or verified sign-ups.
3. **OAuth (Optional)**: If you want Google/GitHub sign-in, enable the providers and paste your respective Client IDs and Secrets. Ensure you update `Site URL` and `Redirect URLs` in the **URL Configuration** tab to match your production domain.

## 3. Getting API Keys (OpenRouter)

1. Go to [OpenRouter.ai](https://openrouter.ai/).
2. Create an account and navigate to the **Keys** section.
3. Generate a new API key.

## 4. Vercel Deployment

1. Push this repository to a GitHub, GitLab, or Bitbucket account.
2. Go to [Vercel](https://vercel.com/) and click **Add New -> Project**.
3. Import the repository.
4. Expand the **Environment Variables** section and add the following keys:
   - `NEXT_PUBLIC_SUPABASE_URL`: (from step 1.2)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (from step 1.2)
   - `SUPABASE_SERVICE_ROLE_KEY`: (from step 1.2)
   - `OPENROUTER_API_KEY`: (from step 3.3)
   - `NEXT_PUBLIC_APP_URL`: `https://your-deployment-domain.vercel.app`
5. Click **Deploy**.

## 5. Post-Deployment Verification

1. Once Vercel finishes deploying, visit the production URL.
2. Create a new account via the **Sign In / Sign Up** page.
3. Start a new conversation. Verify the Web3-style animations load smoothly.
4. Send a message. Wait for the stream to finish, then hard refresh the page to verify that the message and the AI response persisted via the Supabase Sidebar history.

Congratulations! Your real-time, authenticated AI chat platform is now live.
