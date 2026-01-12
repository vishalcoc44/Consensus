# Collective Synthesizer

A collaborative decision-making platform that helps teams reach consensus through structured voting, weighted criteria, and real-time analytics.

Built this because I was tired of endless Slack debates about where to go for team lunch. Figured if we can't agree on pizza vs tacos, we probably need a better system for the important stuff too.

![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)

## What it does

**The core idea**: Create a decision, add options, define what matters (criteria with weights), let your team vote, and watch the consensus emerge in real-time.

### Key Features

- **Weighted Criteria Voting** - Not all factors are equal. Set weights so "cost" can matter more than "aesthetics" if that's what your team needs
- **Blind Voting Mode** - Hide results until everyone votes to prevent groupthink
- **Real-time Analytics** - Live charts showing vote distribution, participation rates, and consensus scores
- **Decision Templates** - Save common decision structures (hiring, budget reviews, product launches) and reuse them
- **Team Management** - Create teams, invite members, manage roles
- **Goals & OKRs** - Track objectives with measurable key results linked to decisions
- **Decision Calendar** - Deadlines, milestones, and review dates in one place
- **Meeting Rooms** - Virtual spaces for decision discussions
- **AI Insights** - Sentiment analysis, bias detection, and recommendations (Gemini integration ready)
- **Resource Hub** - Attach documents, links, and files to decisions
- **Activity Log** - Full audit trail of who did what and when
- **PDF Export** - Generate professional decision reports

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Supabase (Postgres, Auth, Storage, Realtime) |
| State | TanStack Query, React Context |
| Charts | Recharts |
| Forms | React Hook Form + Zod |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([create one here](https://supabase.com))

### Setup

1. Clone the repo
   ```bash
   git clone https://github.com/yourusername/collective-synthesizer.git
   cd collective-synthesizer
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. Run the migrations in your Supabase project (SQL files are in `/supabase/migrations`)

5. Start the dev server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
src/
├── components/       # UI components organized by feature
│   ├── analytics/    # Charts and visualization
│   ├── auth/         # Login, register, password reset
│   ├── dashboard/    # Dashboard widgets
│   ├── proposals/    # Decision creation and details
│   ├── teams/        # Team management
│   └── ui/           # shadcn/ui base components
├── contexts/         # React context providers
├── hooks/            # Custom hooks
├── pages/            # Route pages
├── services/         # Supabase API layer
├── types/            # TypeScript definitions
└── lib/              # Utilities
```

## Database Schema

20+ tables covering:
- User profiles and authentication
- Teams and memberships
- Proposals, options, criteria, votes
- Templates and resources
- Calendar events, objectives, key results
- Meeting rooms and participants
- AI insights and notifications

Full schema docs in `IMPLEMENTATION_DOCS.md`.

## Screenshots

*Coming soon - currently polishing the UI*

## Roadmap

- [ ] Gemini AI integration for real analysis
- [ ] Mobile responsive polish
- [ ] Video conferencing in meetings
- [ ] Google Calendar sync
- [ ] Slack/Discord integrations
- [ ] Automated test suite

## Contributing

This is mostly a personal project but PRs are welcome if you have ideas. Just open an issue first so we can discuss.

