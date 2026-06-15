# Xenova AI-Native Mini CRM

A full-stack, AI-native mini CRM for helping consumer brands intelligently reach their shoppers across WhatsApp, SMS, Email, and RCS.

---

## Live Demo
🔗 [Deployed on Vercel](#) ← Update with your URL

---

## What I Built

A deliberately scoped, opinionated CRM focused on the **marketer's core loop**: segment → compose → send → track. The product is built around three design bets:

1. **AI-assisted at key moments** — not an AI chatbot bolted on, but AI embedded exactly where it matters: message composition. The AI suggest button analyses your segment and channel and returns 3 tailored messages.
2. **Two-service, callback-driven architecture** — a separate `channelService` module simulates a real messaging provider, asynchronously posting back status events (delivered → opened → clicked → converted) to the CRM's receipt endpoint. This models how real channel delivery and engagement tracking works.
3. **Live stats** — the campaign view polls for updates when a campaign is in flight, showing stats roll up in real time as callbacks arrive.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Next.js App                 │
│                                             │
│  ┌──────────────┐   ┌────────────────────┐  │
│  │   Frontend   │   │    API Routes      │  │
│  │  (React SPA) │   │                    │  │
│  │              │   │  POST /api/send    │  │
│  │  Dashboard   │   │  POST /api/receipt │  │
│  │  Campaigns   │   │  GET  /api/campaigns│  │
│  │  Segments    │   │  POST /api/segments │  │
│  │  Customers   │   │  POST /api/ai-suggest│ │
│  │  └──────────────┘   └────────────────────┘  │
│                              │               │
│                              ▼               │
│                   ┌─────────────────────┐   │
│                   │   channelService.ts │   │
│                   │   (Stub Provider)   │   │
│                   │                     │   │
│                   │  Simulates delivery │   │
│                   │  Async callbacks →  │   │
│                   │  /api/receipt       │   │
│                   └─────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Data flow:**
1. Marketer creates a campaign, selects a segment and channel
2. Hits "Send" → `/api/send` dispatches communications and calls `channelService`
3. `channelService` fires async timeouts, each calling back `/api/receipt`
4. `/api/receipt` validates status progression, updates communication state, rolls up campaign stats
5. Frontend polls and displays live stats

**Data store:** In-memory singleton (resets on cold start). In production: PostgreSQL with Redis for the callback queue.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + custom CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **AI:** Anthropic Claude API (Haiku) for message suggestions

---

## Project Structure

```
xenova-crm/
├── app/
│   ├── page.tsx              # Root layout + view router
│   ├── layout.tsx            # HTML shell + fonts
│   ├── globals.css           # Design tokens + utilities
│   └── api/
│       ├── campaigns/route.ts    # CRUD campaigns
│       ├── customers/route.ts    # Paginated customer list
│       ├── segments/route.ts     # CRUD segments with rule eval
│       ├── send/route.ts         # Campaign dispatch + channel call
│       ├── receipt/route.ts      # Callback handler (webhook equiv)
│       └── ai-suggest/route.ts   # AI message generation
├── components/
│   ├── Sidebar.tsx           # Navigation
│   ├── Dashboard.tsx         # Overview with chart
│   ├── Campaigns.tsx         # Campaign management + AI compose
│   ├── Customers.tsx         # Paginated customer table
│   ├── Segments.tsx          # Segment builder with rules
│   └── SignalFlow.tsx        # Animated SVG callback loop viz
└── lib/
    ├── types.ts              # Shared TypeScript interfaces
    ├── store.ts              # In-memory data store + segment eval
    ├── seed.ts               # Realistic mock customer generator
    ├── channelService.ts     # Stubbed channel + async callbacks
    └── utils.ts              # Formatters, constants
```

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/swasray2004/Xenova.git
cd Xenova

# 2. Install
npm install

# 3. Environment (optional - AI suggestions work without it via fallback)
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# 4. Run
npm run dev
# Open http://localhost:3000
```

---

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set env var (optional, for AI suggestions)
vercel env add ANTHROPIC_API_KEY
```

Or connect your GitHub repo at [vercel.com/new](https://vercel.com/new) and it deploys automatically on every push.

---

## Scale Considerations & Tradeoffs

| What I did | What I'd do at scale |
|---|---|
| In-memory store | PostgreSQL + Prisma ORM |
| Inline async callbacks | Redis queue (BullMQ) + separate worker |
| setTimeout for delivery sim | Actual webhooks from messaging providers |
| No auth | JWT / NextAuth with org-level multi-tenancy |
| Single server | Separate CRM service + channel service as microservices |
| Poll for updates | WebSockets / SSE for real-time campaign stats |

The callback architecture (`/api/receipt`) is already designed to be a drop-in webhook endpoint — switching from the stub to a real provider (Gupshup, Kaleyra, Twilio) means only changing `channelService.ts`.
