# koveri

**AI-powered app for connection** — builds your profile from your online presences to find friends, partners, or hackathon buddies.

## Quick Start

```sh
npm install
npm run dev
```

## Environment Variables

Create a `.env` file:

```
# Supabase (required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# Google Gemini API (required)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Yellowcake API (configured in Supabase Edge Functions)
# YELLOWCAKE_API_KEY=your_yellowcake_api_key (set in Supabase secrets)
```

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Framer Motion (animations)
- Recharts (data visualization)

**Backend & Services:**
- Supabase (database & edge functions)
- Google Gemini API (AI coach and profile generation)
- Yellowcake API (web scraping & data extraction)
