# Interview Platform

AI-powered mock interview agent for machine learning engineer candidates.

## What Exists Now

- Next.js TypeScript app foundation.
- Resume PDF upload flow.
- Gemini-backed resume parsing path with a local fallback while credentials are not configured.
- Five-phase interview state machine.
- Professional, neutral interviewer flow.
- Socratic technical deep-dive question generation.
- Seed factual ML question bank.
- Lightweight local scoring placeholders.
- Supabase schema draft.
- Final report summary endpoint.

## Local Setup

1. Install dependencies:

```powershell
& 'C:\Users\mohdz\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd' install
```

2. Copy `.env.example` to `.env.local` and fill in keys when available.

3. Start the app:

```powershell
& 'C:\Users\mohdz\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd' dev
```

The app works in local mock mode without credentials. Gemini and Supabase integrations activate when the relevant environment variables are present.

## Key Files

- `PROJECT_ROADMAP.md`: approved implementation roadmap.
- `app/page.tsx`: interview workspace UI.
- `lib/interview/engine.ts`: phase state machine and local interview orchestration.
- `lib/interview/prompts.ts`: interviewer persona and prompt templates.
- `lib/interview/question-bank.ts`: initial factual question seed.
- `data/mlquestions-seed.md`: local markdown question corpus.
- `supabase/schema.sql`: database schema draft.
