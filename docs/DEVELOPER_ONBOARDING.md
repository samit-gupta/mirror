# Mirror — Developer Onboarding

> **Audience:** Second developer joining the project.
> **Purpose:** Complete technical handoff — architecture, data model, AI system, feature status, known issues, and roadmap.
> **Last updated:** 2026-06-23

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Tech Stack](#3-tech-stack)
4. [Environment Setup](#4-environment-setup)
5. [Database](#5-database)
6. [Authentication](#6-authentication)
7. [AI Architecture](#7-ai-architecture)
8. [Memory System](#8-memory-system)
9. [Conversations System](#9-conversations-system)
10. [Journal System](#10-journal-system)
11. [Dashboard Analytics](#11-dashboard-analytics)
12. [State Management](#12-state-management)
13. [API Layer](#13-api-layer)
14. [Feature Status](#14-feature-status)
15. [Known Issues](#15-known-issues)
16. [Git Workflow](#16-git-workflow)
17. [Future Roadmap](#17-future-roadmap)

---

## 1. Project Overview

### What Mirror Does

Mirror is an AI-powered self-reflection web app. Users define who they want to become — career goals, health goals, dream life — and Mirror uses that context to simulate a **Future Self** persona powered by Google Gemini. The Future Self speaks in first person, references the user's actual goals, and asks questions that only someone who has already lived those years would ask.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (React SPA)                     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Pages   │  │Components│  │  Contexts│  │    Lib    │  │
│  │(routing) │  │  (UI)    │  │  (state) │  │(data/API) │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
│       └─────────────┴─────────────┴───────────────┘        │
│                              │                              │
│                    ┌─────────┴─────────┐                    │
│                    │                   │                    │
│             ┌──────▼──────┐   ┌────────▼───────┐           │
│             │  Supabase   │   │  Google Gemini  │           │
│             │  JS Client  │   │  JS SDK        │           │
│             └──────┬──────┘   └────────┬───────┘           │
└────────────────────┼───────────────────┼───────────────────┘
                     │                   │
         ┌───────────▼──────┐   ┌────────▼────────┐
         │  Supabase Cloud  │   │  Gemini 2.5     │
         │  ┌────────────┐  │   │  Flash API      │
         │  │ PostgreSQL │  │   │                 │
         │  │  + Auth    │  │   │  • Chat turns   │
         │  │  + RLS     │  │   │  • Paraphrase   │
         │  └────────────┘  │   └─────────────────┘
         └──────────────────┘
```

### User Flow

```
Landing (/)
    │
    ├─► Sign Up (/signup) ──► Confirm email (if enabled)
    │                              │
    └─► Log In (/login) ───────────┘
                                   │
                              /setup  ◄── (redirected if no profile)
                         3-step wizard
                        (name, ages, goals)
                                   │
                                   ▼
                           /dashboard  ◄─── Home after login
                        (stats, insights,
                         Future Self card)
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼               ▼
                /chat           /journal        /setup
           AI conversation    Manual entries  Edit profile
           with Future Self   + mood tags     + re-save goals
```

---

## 2. Repository Structure

```
Mirror/
│
├── docs/
│   ├── Mirror_AI_PRD_v1.md          # Product requirements (currently 0 bytes — empty)
│   ├── database-plan.md             # High-level planned schema (not authoritative)
│   └── DEVELOPER_ONBOARDING.md      # This file
│
├── frontend/                        # The entire application (Vite + React SPA)
│   │
│   ├── public/                      # Static assets served verbatim
│   │
│   ├── src/
│   │   │
│   │   ├── App.jsx                  # Root: <AuthProvider> wraps <RouterProvider>
│   │   ├── main.jsx                 # Vite entry — mounts <App /> into #root
│   │   ├── index.css                # Global base styles + Tailwind v4 @theme tokens
│   │   ├── test.js                  # ⚠️ Stale scratch file — not imported anywhere
│   │   │
│   │   ├── assets/                  # Static media (images, icons)
│   │   │
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── AuthAlert.jsx        # Error/success banner (variant prop)
│   │   │   │   ├── AuthLoading.jsx      # Full-page spinner while session resolves
│   │   │   │   ├── GuestRoute.jsx       # Redirect authenticated users to /dashboard
│   │   │   │   └── ProtectedRoute.jsx   # Redirect unauthenticated users to /login
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx          # App nav (persistent on desktop, drawer on mobile)
│   │   │   │   └── Navbar.jsx           # Marketing page top nav (Login + Get started)
│   │   │   │
│   │   │   └── ui/
│   │   │       ├── ChatBubble.jsx       # Individual message (user=right, future-self=left)
│   │   │       └── FutureSelfCard.jsx   # Preview card shown on Dashboard and Landing
│   │   │
│   │   ├── constants/
│   │   │   └── routes.js            # ROUTES object — single source of truth for all paths
│   │   │
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      # Session state + signUp/signIn/signOut methods
│   │   │
│   │   ├── layouts/
│   │   │   ├── AppLayout.jsx        # Authenticated shell: Sidebar + <Outlet />
│   │   │   ├── AuthLayout.jsx       # Centered card + Mirror logo link for auth pages
│   │   │   └── MarketingLayout.jsx  # Navbar + <Outlet /> for the landing page
│   │   │
│   │   ├── lib/                     # All data access and business logic (no UI)
│   │   │   ├── auth.js              # Pure validation: validateEmail, validatePassword
│   │   │   ├── chat.js              # Conversation CRUD + sendChatMessage orchestration
│   │   │   ├── gemini.js            # Gemini client, prompt builder, paraphrase cache
│   │   │   ├── journal.js           # Journal CRUD, mood constants, formatting
│   │   │   ├── memories.js          # saveMemory() + getMemories()
│   │   │   ├── profiles.js          # Profile CRUD, serialisation, cache invalidation
│   │   │   └── supabase.js          # Supabase singleton client
│   │   │
│   │   ├── pages/
│   │   │   ├── Landing.jsx          # Marketing: hero, features, CTA
│   │   │   ├── Login.jsx            # Sign-in form with redirect-after-login support
│   │   │   ├── Signup.jsx           # Registration form → redirects to /setup
│   │   │   ├── Setup.jsx            # 3-step profile wizard (currentStep state machine)
│   │   │   ├── Dashboard.jsx        # Home: greeting, FutureSelfCard, stats, insights
│   │   │   ├── Chat.jsx             # Real-time chat interface with Future Self AI
│   │   │   └── Journal.jsx          # Journal list + edit view (no router nesting)
│   │   │
│   │   └── routes/
│   │       └── index.jsx            # createBrowserRouter — all routes with layout wrappers
│   │
│   ├── .env                         # Local secrets (gitignored — never commit)
│   ├── .env.example                 # Template (3 variables)
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html                   # Vite HTML shell — single <div id="root">
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js               # plugins: [react(), tailwindcss()]
│
├── supabase/
│   └── migrations/
│       └── 20260608120000_chat_journal_tables.sql  # conversations + messages + journals
│
├── DEVELOPER_ONBOARDING.md          # Shorter onboarding doc (root level)
├── kickbacks.vsix                   # VS Code extension (unrelated to app)
└── README.md
```

---

## 3. Tech Stack

### Runtime

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | ^19.2.6 |
| Build Tool | Vite | ^8.0.12 |
| Routing | React Router DOM | ^7.17.0 |
| Styling | Tailwind CSS v4 | ^4.3.0 |
| Tailwind Vite Plugin | @tailwindcss/vite | ^4.3.0 |
| Auth + Database | @supabase/supabase-js | ^2.108.0 |
| AI | @google/generative-ai | ^0.24.1 |

### Dev Dependencies

| Package | Purpose |
|---|---|
| @vitejs/plugin-react | Vite plugin for JSX transform + Fast Refresh |
| eslint ^10 | Linting |
| eslint-plugin-react-hooks | Enforces Rules of Hooks |
| eslint-plugin-react-refresh | Validates HMR-compatible components |
| globals ^17 | ESLint global variable definitions |
| @types/react, @types/react-dom | JSDoc / IDE type support |

### `package.json` Scripts

```json
{
  "scripts": {
    "dev":     "vite",           // Hot-reload dev server (localhost:5173)
    "build":   "vite build",     // Production bundle → frontend/dist/
    "lint":    "eslint .",       // Lint all source files
    "preview": "vite preview"    // Serve the production build locally
  }
}
```

### Design System

Tailwind v4 with a custom `@theme` block in `index.css`. All design tokens are CSS custom properties prefixed `--color-mirror-*`:

```css
/* index.css */
@theme {
  --color-mirror-bg:             #09090b;   /* Page background (near-black) */
  --color-mirror-surface:        #111113;   /* Cards, panels */
  --color-mirror-elevated:       #18181b;   /* Inputs, hover states */
  --color-mirror-border:         #27272a;   /* Standard borders */
  --color-mirror-border-subtle:  #1f1f23;   /* Subtle dividers */
  --color-mirror-accent:         #8b5cf6;   /* Primary purple (violet-500) */
  --color-mirror-accent-hover:   #a78bfa;   /* Lighter purple on hover */
  --color-mirror-accent-muted:   #6d28d9;   /* Darker purple for gradients */
  --color-mirror-text:           #fafafa;   /* Primary text */
  --color-mirror-muted:          #a1a1aa;   /* Secondary text */
  --color-mirror-subtle:         #71717a;   /* Tertiary / placeholder text */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
}
```

Use `text-mirror-accent`, `bg-mirror-surface`, etc. in className strings throughout the app.

---

## 4. Environment Setup

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A Supabase project (free tier is sufficient)
- A Google Cloud project with Gemini API access

### Step-by-Step Local Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd Mirror

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your real values (see below)

# 4. Apply database migrations
# In the Supabase dashboard → SQL editor, run:
#   supabase/migrations/20260608120000_chat_journal_tables.sql
#
# ⚠️  IMPORTANT: The `profiles` and `memories` tables have no migration file.
# You must create them manually — see Section 5 for the expected schema.

# 5. Start the dev server
npm run dev
# App runs at http://localhost:5173
```

### Required Environment Variables

```bash
# frontend/.env  (copy from .env.example — all three are required)

VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_GEMINI_API_KEY=<your-gemini-api-key>
```

> **Security note:** All three variables are prefixed `VITE_` and are therefore embedded in the client bundle. They are browser-visible. Supabase Row Level Security enforces data isolation. Do not put server-only secrets here.

### Build Commands

```bash
npm run dev      # Start dev server with HMR
npm run build    # Production build → dist/ (Vite 8, 95 modules, ~556 kB JS)
npm run preview  # Serve dist/ locally to verify the production build
npm run lint     # ESLint all source files
```

---

## 5. Database

### Overview

```
auth.users (Supabase Auth — managed)
    │
    ├── profiles          (1:1  — one profile per user)
    ├── memories          (1:N  — multiple memory entries per user)
    ├── conversations     (1:N  — multiple threads per user; currently 1 enforced by app)
    │       └── messages  (1:N  — all messages within a conversation)
    └── journals          (1:N  — multiple journal entries per user)
```

---

### Table: `profiles`

> ⚠️ **No migration file exists for this table.** Must be created manually.

```sql
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  current_age integer not null check (current_age >= 1 and current_age <= 120),
  future_age  integer not null check (future_age >= 1  and future_age <= 150),
  dream_life  text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint profiles_user_id_key unique (user_id)
);

create index if not exists profiles_user_id_idx on public.profiles (user_id);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

**`dream_life` column format** (plain-text structured blob — not JSON):

```
Career Goal:
<careerGoal text>

Health Goal:
<healthGoal text>

Dream Life:
<dreamLife text>
```

Serialised by `profiles.js::buildDreamLife()`, deserialised by `parseDreamLifeFields()` via regex.

---

### Table: `memories`

> ⚠️ **No migration file exists for this table.** Must be created manually.

```sql
create table if not exists public.memories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  memory_type text not null,          -- currently always 'goal'
  content     text not null,
  importance  integer not null default 1,  -- higher = injected first
  created_at  timestamptz not null default now()
);

create index if not exists memories_user_id_idx       on public.memories (user_id);
create index if not exists memories_importance_idx    on public.memories (importance desc);

alter table public.memories enable row level security;

create policy "Users can view own memories"
  on public.memories for select using (auth.uid() = user_id);

create policy "Users can insert own memories"
  on public.memories for insert with check (auth.uid() = user_id);

create policy "Users can delete own memories"
  on public.memories for delete using (auth.uid() = user_id);
```

**Importance values in use:**

| Memory Type | Content | Importance |
|---|---|---|
| `goal` | Career goal text | 5 |
| `goal` | Health goal text | 5 |
| `goal` | Dream life text | 4 |

---

### Table: `conversations`

> ✅ Migration exists in `supabase/migrations/20260608120000_chat_journal_tables.sql`

```sql
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null default 'Future Self',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_id_idx   on public.conversations (user_id);
create index if not exists conversations_updated_at_idx on public.conversations (updated_at desc);
```

**RLS policies:** users can SELECT, INSERT, UPDATE, DELETE their own rows.

**Trigger:** `messages_touch_conversation` — after INSERT on `messages`, updates `conversations.updated_at = now()` for the parent conversation.

---

### Table: `messages`

> ✅ Migration exists.

```sql
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on public.messages (conversation_id);
create index if not exists messages_created_at_idx      on public.messages (created_at);
```

**RLS policies:** users can SELECT, INSERT, DELETE their own rows. No UPDATE policy (messages are immutable).

---

### Table: `journals`

> ✅ Migration exists.

```sql
create table if not exists public.journals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null default 'Untitled',
  content    text not null default '',
  mood       text not null default 'Reflective',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journals_user_id_idx   on public.journals (user_id);
create index if not exists journals_updated_at_idx on public.journals (updated_at desc);
```

**Valid mood values** (enforced in UI, not DB constraint):
`'Reflective'` | `'Hopeful'` | `'Curious'` | `'Grateful'` | `'Uncertain'`

**RLS policies:** users can SELECT, INSERT, UPDATE, DELETE their own rows.

---

### Database Functions & Triggers

```sql
-- Function: touch_conversation_updated_at
-- Fires: AFTER INSERT on messages
-- Effect: bumps conversations.updated_at so the most-active thread sorts first

create or replace function public.touch_conversation_updated_at()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row
  execute function public.touch_conversation_updated_at();
```

### Database Entity Relationship

```
auth.users
    │  id (PK)
    │
    ├─────────────────────────────────────────────┐
    │                                             │
    ▼  user_id (FK → auth.users.id, cascade)      │
profiles                                         │
    id, user_id, name, current_age,              │
    future_age, dream_life                       │
                                                 │
    ▼  user_id (FK → auth.users.id, cascade)      │
memories                                         │
    id, user_id, memory_type,                    │
    content, importance, created_at              │
                                                 │
    ▼  user_id (FK → auth.users.id, cascade)      │
conversations                                    │
    id, user_id, title,                          │
    created_at, updated_at ◄─── trigger ─────────┘
    │
    └── messages
            id, conversation_id (FK → conversations.id, cascade),
            user_id (FK → auth.users.id, cascade),
            role, content, created_at

    ▼  user_id (FK → auth.users.id, cascade)
journals
    id, user_id, title, content, mood,
    created_at, updated_at
```

---

## 6. Authentication

### Supabase Auth Flow

```
User submits signup form
    │
    ▼
AuthContext.signUp({ email, password, fullName })
    → supabase.auth.signUp({ email, password, options: { data: { full_name } } })
    → Supabase sends confirmation email (if email confirm enabled in project settings)
    → Returns { session, user }
    │
    ├─ If session exists (email confirm OFF): navigate to /setup
    └─ If no session (email confirm ON): show "check your email" message

User submits login form
    │
    ▼
AuthContext.signIn({ email, password })
    → supabase.auth.signInWithPassword(...)
    → Returns { session, user }
    → navigate to redirectTo (from router state) or /dashboard
```

### Session Management

**`AuthContext.jsx`** owns all session state:

```
AuthProvider (wraps entire app via App.jsx)
    │
    ├─ state: session (null | Session)
    ├─ state: loading (bool — true while initial session check runs)
    │
    ├─ supabase.auth.getSession()  → sets initial session on mount
    ├─ supabase.auth.onAuthStateChange()  → updates session on login/logout/refresh
    │
    └─ exposes via context:
           user     — session?.user ?? null
           loading  — bool
           signUp() — async
           signIn() — async
           signOut() — async
```

Session is a Supabase JWT. The Supabase client handles token refresh automatically.

### Route Guard Architecture

```
routes/index.jsx
│
├── MarketingLayout     (no guard)
│   └── /              Landing
│
├── GuestRoute          (redirect to /dashboard if logged in)
│   └── AuthLayout
│       ├── /login      Login
│       └── /signup     Signup
│
└── ProtectedRoute      (redirect to /login if logged out; preserves intended destination)
    └── AppLayout
        ├── /setup      Setup
        ├── /dashboard  Dashboard
        ├── /chat       Chat
        └── /journal    Journal
```

**`GuestRoute`** — reads `useAuth()`. If `loading`, renders `<AuthLoading />`. If `user` exists, `<Navigate to="/dashboard" replace />`. Otherwise `<Outlet />`.

**`ProtectedRoute`** — reads `useAuth()`. If `loading`, renders `<AuthLoading />`. If no `user`, `<Navigate to="/login" state={{ from: location }} replace />`. Otherwise `<Outlet />`. The `state.from` value allows `Login.jsx` to redirect back to the originally-intended page after sign-in.

### `user.user_metadata`

On sign-up, `full_name` is stored in `user.user_metadata.full_name`. It is read in:
- `AuthContext` — not directly used
- `Sidebar.jsx` — `user?.user_metadata?.full_name` for the display name
- `Dashboard.jsx` — fallback display name
- `Setup.jsx` — pre-fills the name field on first load

---

## 7. AI Architecture

### Overview

The AI system is entirely client-side. No backend proxy. The Gemini SDK is called directly from the browser using `VITE_GEMINI_API_KEY`.

**Model:** `gemini-2.5-flash`

### Files Involved

| File | Responsibility |
|---|---|
| `lib/gemini.js` | Gemini client, all prompt construction, paraphrase cache |
| `lib/chat.js` | Orchestrates data fetching + calls `generateFutureSelfReply` |
| `lib/memories.js` | `getMemories()` — supplies memory rows to the prompt |
| `lib/profiles.js` | `normalizeProfileForFutureSelf()` — formats profile for the prompt |

### Context Assembly Process

Before every AI reply, the following context is assembled:

```
generateFutureSelfReply({ profile, memories, history, userMessage, userId })
    │
    ├─ 1. paraphraseMemories(memories, userId)
    │         → check sessionStorage for cached phrases
    │         → cache HIT:  return cached array immediately
    │         → cache MISS: call Gemini generateContent() with paraphrase prompt
    │                       → cache result in sessionStorage
    │                       → return paraphrased phrase array
    │
    ├─ 2. buildFutureSelfSystemPrompt(profile, history, paraphrased)
    │         → normalizeProfileForFutureSelf(profile)
    │              → parseDreamLifeFields(dream_life)  [regex parse]
    │         → buildTimeLabel(currentAge, futureAge)
    │         → buildConversationGuidance(history)
    │         → buildMemoriesSection(paraphrased)
    │         → assemble full system instruction string
    │
    ├─ 3. client.getGenerativeModel({ model, systemInstruction })
    │
    ├─ 4. model.startChat({ history: toGeminiHistory(history) })
    │         → converts DB message rows to Gemini { role, parts } format
    │         → role mapping: 'assistant' → 'model' (Gemini format)
    │
    └─ 5. chat.sendMessage(userMessage)
              → returns text response
```

### System Prompt Structure

The full prompt is ~400–500 tokens and has five sections:

```
IDENTITY — NON-NEGOTIABLE
  You are <name>. You are <name>'s future self — not an AI...
  Your opening frame: "I am you, <N> years from now."
  You are <futureAge>. Your younger self is <currentAge>.

THE LIFE YOU BUILT — REMEMBER THIS
  Goals:          <careerGoal>
  Dream salary:   <dreamSalary — always "Not yet defined.">
  Health goal:    <healthGoal>
  Life vision:    <dreamLife>

CONVERSATION MEMORY
  <"This may be your first exchange..." OR "You have N earlier messages...">

WHAT YOU REMEMBER                       ← injected only when memories exist
  They want to <phrase 1>. They want to <phrase 2>. And they want to <phrase 3>.
  Do not recite this back to them. Let it shape how you listen...

VOICE & TONE
  First person always. Encouraging. Wise. Honest. Mentor-like. Brief.

NEVER DO THIS
  Never say you are an AI. No cheerleading. No tip lists.

RESPONSE FORMAT
  Max 80 words. 1–2 paragraphs. End with one thoughtful question.
```

**Key prompt snippet — memory section builder:**

```js
// gemini.js::buildMemoriesSection()
function buildMemoriesSection(paraphrased) {
  if (!paraphrased?.length) return ''

  const sentences = paraphrased.map((phrase, i) => {
    const lower = phrase.charAt(0).toLowerCase() + phrase.slice(1)
    const prefix =
      i === paraphrased.length - 1 && paraphrased.length > 1
        ? 'And they want to'
        : 'They want to'
    return `${prefix} ${lower}`
  })

  return `\nWHAT YOU REMEMBER\nYour younger self has told you what they are working toward.
You carry this into every conversation:\n\n${sentences.join('. ') + '.'}\n\n
Do not recite this back to them. Let it shape how you listen...`
}
```

---

## 8. Memory System

### Storage Flow

Memories are written only when the user saves their profile:

```
Setup.jsx → saveProfile({ userId, careerGoal, healthGoal, dreamLife })
    │
    ├─ 1. upsert profiles row (Supabase)
    ├─ 2. DELETE FROM memories WHERE user_id = ? AND memory_type = 'goal'
    ├─ 3. clearParaphraseCache(userId)   ← cache busted HERE, before writes
    ├─ 4. INSERT memory: careerGoal  (importance: 5)
    ├─ 5. INSERT memory: healthGoal  (importance: 5)
    └─ 6. INSERT memory: dreamLife   (importance: 4)
```

> **Why bust cache before writes (step 3)?** If any `saveMemory()` call fails, the old memories are already deleted from the DB. The cache would be stale relative to the actual DB state. Clearing it at step 3 ensures that even on partial failure, the next message send will do a fresh Gemini paraphrase call against whatever is currently in the DB.

### Retrieval Flow

```
chat.js::sendChatMessage()
    │
    ├─ getMemories(userId)
    │     → SELECT memory_type, content, importance
    │       FROM memories
    │       WHERE user_id = $userId
    │       ORDER BY importance DESC, created_at DESC
    │       LIMIT 20
    │
    └─ pass memories array to generateFutureSelfReply(...)
```

### Cache Implementation

```js
// gemini.js — cache key scoped by userId
const paraphraseCacheKey = (userId) => `mirror_paraphrased_${userId}`

// Exported so profiles.js can bust it
export function clearParaphraseCache(userId) {
  sessionStorage.removeItem(paraphraseCacheKey(userId))
}

async function paraphraseMemories(memories, userId) {
  if (!memories?.length) return []

  // Cache read — try/catch protects against JSON.parse errors
  if (userId) {
    try {
      const cached = sessionStorage.getItem(paraphraseCacheKey(userId))
      if (cached) return JSON.parse(cached)
    } catch { /* fall through to Gemini call */ }
  }

  // ... Gemini paraphrase call ...

  // Cache write — try/catch protects against quota errors (private browsing)
  if (userId) {
    try {
      sessionStorage.setItem(paraphraseCacheKey(userId), JSON.stringify(lines))
    } catch { /* non-fatal */ }
  }

  return lines
}
```

**Cache lifecycle:**

| Event | Cache action |
|---|---|
| First message in session | Cache miss → Gemini call → cache populated |
| Subsequent messages (same session) | Cache hit → no Gemini call |
| User saves profile | `clearParaphraseCache()` called → next message triggers fresh call |
| Browser tab closed | `sessionStorage` cleared automatically |
| New browser session | Cache miss → fresh Gemini call |

### Current Limitations

- Only `memory_type='goal'` is written. The schema supports any type but nothing else populates it.
- No chat-derived memories. Insights from conversations are never automatically captured.
- No Memory Vault UI — users cannot view, edit, or delete memories.
- `getMemories()` exists in `lib/memories.js` but is only called from `chat.js`. Nothing else reads memories.
- Memories are written sequentially (3 `await saveMemory()` calls), not in a transaction. A partial failure leaves inconsistent state.

---

## 9. Conversations System

### Current Implementation

```js
// chat.js::getOrCreateConversation()
// Always returns the most recent conversation, or creates one.
// Single thread per user — artificially enforced by app logic.

const { data: existing } = await supabase
  .from('conversations')
  .select('id, title, created_at, updated_at')
  .eq('user_id', userId)
  .order('updated_at', { ascending: false })
  .limit(1)
  .maybeSingle()

if (existing) return existing

// Create if none exists
const { data: created } = await supabase
  .from('conversations')
  .insert({ user_id: userId, title: 'Future Self' })
  .select('id, title, created_at, updated_at')
  .single()
```

### Message Handling

```js
// All messages loaded on chat open — no pagination
getConversationMessages(conversationId)
    → SELECT id, role, content, created_at
      FROM messages
      WHERE conversation_id = $id
      ORDER BY created_at ASC
      -- NO LIMIT ← known issue, see Section 15

// Full history passed to Gemini on every send — no windowing
```

### Table Structure

```
conversations
  id          UUID  PK
  user_id     UUID  FK → auth.users
  title       TEXT  default 'Future Self'
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ  ← auto-bumped by trigger on message insert

messages
  id              UUID  PK
  conversation_id UUID  FK → conversations (cascade)
  user_id         UUID  FK → auth.users (cascade)
  role            TEXT  CHECK ('user' | 'assistant')
  content         TEXT
  created_at      TIMESTAMPTZ
```

### Limitations

- **One thread per user.** The DB supports N, the app enforces 1.
- **No pagination.** All messages fetched on every page load and on every message send.
- **No search.** No way to find past conversations by content.
- **Unbounded history to Gemini.** See Known Issues.
- **No conversation title editing.** Title is always `'Future Self'`.

### Planned Expansion

To support multiple conversations:
1. Replace `getOrCreateConversation()` with separate `createConversation()` and `getConversations()` functions
2. Add a dynamic route `/chat/:conversationId`
3. Add a conversation picker panel in `Chat.jsx` or a new sidebar section
4. Implement message windowing (last N messages) before enabling long threads

---

## 10. Journal System

### Data Model

```
journals
  id          UUID         PK
  user_id     UUID         FK → auth.users
  title       TEXT         default 'Untitled'
  content     TEXT         default ''
  mood        TEXT         default 'Reflective'
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ
```

**Valid moods and their UI colours:**

```js
// journal.js
export const JOURNAL_MOODS = ['Reflective', 'Hopeful', 'Curious', 'Grateful', 'Uncertain']

export const MOOD_COLORS = {
  Reflective: 'bg-blue-500/15 text-blue-400',
  Hopeful:    'bg-emerald-500/15 text-emerald-400',
  Curious:    'bg-amber-500/15 text-amber-400',
  Grateful:   'bg-violet-500/15 text-violet-400',
  Uncertain:  'bg-zinc-500/15 text-zinc-400',
}
```

### Current Functionality

- **List view:** sorted by `updated_at DESC`, shows title, mood badge, date, 140-char excerpt
- **Edit view:** title input, mood dropdown, resizable textarea, save/cancel
- **Create:** `createJournal()` inserts a blank entry (`title: 'Untitled'`, `content: ''`) then opens it in edit view
- **Update:** `updateJournal()` sets `updated_at = new Date().toISOString()`
- **No delete** — no delete button or function exists

### AI Integration Status

**Not started.** The journal is 100% manual. There is no:
- "Generate from conversation" feature
- AI summary of entries
- Link between `messages` and `journals`
- Automatic insight capture

The landing page and sidebar imply this connection ("Journal your insights") but it is not implemented.

---

## 11. Dashboard Analytics

### Existing Metrics

| Stat | How Computed | File |
|---|---|---|
| Conversations | `COUNT(*)` on `conversations` table | `chat.js::getConversationCount()` |
| Journal entries | `COUNT(*)` on `journals` table | `journal.js::getJournalCount()` |
| Days active | `COUNT(DISTINCT date(created_at))` computed client-side from all `messages` rows | `chat.js::getActiveDaysCount()` |
| Recent insights | Last 3 `messages` rows where `role = 'assistant'` | `chat.js::getRecentInsights()` |

### Computation Logic

```js
// getActiveDaysCount — client-side deduplication
const { data } = await supabase.from('messages').select('created_at').eq('user_id', userId)
const uniqueDays = new Set(data.map(row => new Date(row.created_at).toDateString()))
return uniqueDays.size  // number of unique calendar days with any message activity
```

### Known Issue: Conversation Count

`getConversationCount()` counts thread rows. Since every user has at most one thread (enforced in `getOrCreateConversation()`), this metric is always `0` or `1`. It should count messages, or the stat should be renamed.

### Missing Analytics

- **Activity streak** (consecutive days active)
- **Mood timeline** (mood per journal entry over time)
- **Goal progress** (requires Goals table — not built)
- **Message volume** (actual messages sent, not threads)
- **Session frequency** (messages per week/month)

---

## 12. State Management

### Architecture

Mirror uses **React Context** for global state (auth only) and **local component state** (`useState`) for everything else. There is no Redux, Zustand, or other state library.

```
App.jsx
└── AuthProvider (contexts/AuthContext.jsx)
    │   session, user, loading
    │   signUp(), signIn(), signOut()
    │
    └── RouterProvider
        ├── Chat.jsx        — local: profile, messages, input, loading, sending, error
        ├── Dashboard.jsx   — local: profile, insights, stats, loading, error
        ├── Journal.jsx     — local: entries, view, draft, loading, saving, error
        └── Setup.jsx       — local: name, ages, goals, currentStep, loading, error
```

### `AuthContext` API

```js
const { user, loading, signUp, signIn, signOut } = useAuth()

// user      — Supabase User object | null
// loading   — true during initial session resolution (show <AuthLoading />)
// signUp    — async ({ email, password, fullName }) => data
// signIn    — async ({ email, password }) => data
// signOut   — async () => void
```

### Custom Hooks

No custom hooks exist beyond `useAuth()` (exported from `AuthContext.jsx`). All data fetching is done inline with `useEffect` inside page components.

### Data Fetching Pattern

All pages follow the same pattern:

```js
useEffect(() => {
  if (!user) return
  let cancelled = false

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await someFetchFn(user.id)
      if (!cancelled) setState(data)
    } catch (err) {
      if (!cancelled) setError(getAuthErrorMessage(err))
    } finally {
      if (!cancelled) setLoading(false)
    }
  }

  load()
  return () => { cancelled = true }  // cleanup to prevent setState after unmount
}, [user])
```

---

## 13. API Layer

All data access lives in `src/lib/`. There is no backend server — all calls go directly to Supabase or Google Gemini from the browser.

### `lib/supabase.js`

Singleton Supabase client. Import this, never create a second client.

```js
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### `lib/auth.js` — Client-side validation only

```js
getAuthErrorMessage(error)        // extracts error.message or returns generic fallback
validateEmail(email)              // returns error string | null
validatePassword(password, opts)  // minLength default 6, returns error string | null
```

### `lib/profiles.js`

```js
buildDreamLife({ careerGoal, healthGoal, dreamLife })   // → structured text blob
validateProfileForm({ name, currentAge, futureAge, careerGoal, healthGoal, dreamLife })  // → error | null
saveProfile({ userId, name, currentAge, futureAge, careerGoal, healthGoal, dreamLife }) // upsert + memories + cache bust
getProfile(userId)                                       // → profile row | null
parseDreamLifeFields(dreamLife)                          // → { goals, healthGoal, lifeVision }
normalizeProfileForFutureSelf(profile)                   // → { name, currentAge, futureAge, goals, dreamSalary, healthGoal, lifeVision }
```

### `lib/memories.js`

```js
saveMemory({ userId, memoryType, content, importance })  // INSERT one memory row
getMemories(userId, { limit = 20 })                      // SELECT top-N by importance DESC
```

### `lib/chat.js`

```js
formatMessageTime(isoString)                   // → "3:45 PM"
mapMessageForUi(message)                       // DB row → { id, message, sender, timestamp, createdAt }
getOrCreateConversation(userId)                // enforces single thread per user
getConversationMessages(conversationId)        // all messages, ASC order, no limit
saveMessage({ conversationId, userId, role, content })   // INSERT one message
sendChatMessage({ userId, conversationId, content })     // full orchestration (see Section 7)
getConversationCount(userId)                   // COUNT on conversations table
getRecentInsights(userId, limit = 3)           // last N assistant messages
getActiveDaysCount(userId)                     // unique calendar days with messages
```

### `lib/journal.js`

```js
JOURNAL_MOODS                           // ['Reflective', 'Hopeful', ...]
MOOD_COLORS                             // { Reflective: 'bg-blue-...', ... }
formatJournalDate(isoString)            // → "June 22, 2026"
getExcerpt(content, maxLength = 140)    // truncates with ellipsis
mapJournalForList(journal)              // DB row → { id, title, excerpt, mood, date, updatedAt, createdAt }
getJournals(userId)                     // all entries, updated_at DESC
getJournal(journalId, userId)           // single entry by id
createJournal(userId, overrides = {})   // INSERT blank entry
updateJournal(journalId, userId, { title, content, mood })   // UPDATE with new updated_at
getJournalCount(userId)                 // COUNT on journals table
```

### `lib/gemini.js`

```js
clearParaphraseCache(userId)            // sessionStorage.removeItem (exported for profiles.js)
buildFutureSelfSystemPrompt(profile, history, paraphrased)   // constructs system instruction string
generateFutureSelfReply({ profile, memories, history, userMessage, userId })   // main AI call
// Internal (not exported):
//   paraphraseMemories(memories, userId) — Gemini call #1 with cache
//   buildMemoriesSection(paraphrased)
//   buildConversationGuidance(history)
//   buildTimeLabel(currentAge, futureAge)
//   toGeminiHistory(messages)
//   getClient()
```

---

## 14. Feature Status

### ✅ Complete

| Feature | Files |
|---|---|
| Supabase auth (sign up, sign in, sign out, session persistence) | `AuthContext.jsx`, `Login.jsx`, `Signup.jsx` |
| Auth route guards (protected + guest) | `GuestRoute.jsx`, `ProtectedRoute.jsx` |
| 3-step profile setup wizard with per-step validation | `Setup.jsx`, `profiles.js` |
| Goal memory write on profile save | `profiles.js::saveProfile()`, `memories.js::saveMemory()` |
| Future Self AI chat (Gemini 2.5 Flash) | `Chat.jsx`, `chat.js`, `gemini.js` |
| Memory read + AI injection with paraphrase | `memories.js::getMemories()`, `gemini.js::paraphraseMemories()` |
| sessionStorage paraphrase cache + invalidation | `gemini.js`, `profiles.js` |
| Manual journal (create, read, update, mood tags) | `Journal.jsx`, `journal.js` |
| Dashboard (stats, recent insights, Future Self card) | `Dashboard.jsx` |
| App shell (sidebar, mobile drawer, responsive layout) | `Sidebar.jsx`, `AppLayout.jsx` |
| Marketing landing page | `Landing.jsx`, `MarketingLayout.jsx` |
| Design system (dark theme, Tailwind v4 tokens, Inter font) | `index.css` |

### 🟡 Partially Complete

| Feature | Gap |
|---|---|
| Dashboard analytics | Raw counts only; no streaks, no mood chart, no goal progress |
| Memory system | Write + read + AI injection done; no UI to view/manage memories |

### ❌ Not Started

| Feature | Notes |
|---|---|
| Goals table & structured tracking | Planned in `database-plan.md`. No migration, no lib, no UI. |
| Multiple conversations | DB supports it; single thread enforced in `getOrCreateConversation()`. |
| AI chat history windowing | All messages passed to Gemini unbounded. |
| Journal ↔ Chat AI integration | No "generate insight" or "save as journal" feature. |
| Memory Vault page `/memories` | No route, no page, no sidebar nav item. |
| `dreamSalary` / financial vision field | Prompt slot exists; `normalizeProfileForFutureSelf()` always returns `''`. |
| `bio` and `values` profile fields | In `database-plan.md` only; not in DB, form, lib, or prompt. |
| `profiles` + `memories` DB migrations | Tables used by app; no SQL migration files exist. |
| Journal entry delete | No delete function or button anywhere. |

---

## 15. Known Issues

### 🔴 High Severity

**ISSUE-01 — Missing migrations for `profiles` and `memories`**
- These two tables are heavily used but have no `supabase/migrations/` SQL file.
- Fresh environment setup will fail. New developers must create these tables manually from the schema in Section 5.
- **Fix required before:** any new developer onboarding, staging/production deployment.

---

### 🟠 Medium Severity

**ISSUE-02 — Unbounded chat history passed to Gemini**
- `getConversationMessages()` fetches all rows with no `LIMIT`.
- `sendChatMessage()` passes the full array as `history` to Gemini on every send.
- Long conversations (50+ messages) will eventually exceed Gemini 2.5 Flash's context window and throw API errors surfaced as generic UI errors.
- **Fix:** implement a sliding window — pass only the last N messages (e.g. 20) and optionally a summary of older context.
- **Do not modify `getConversationMessages()` without also updating `Chat.jsx`** — it uses the same function to render the message list.

**ISSUE-03 — `dreamSalary` always empty in AI prompt**
- `normalizeProfileForFutureSelf()` in `profiles.js` L171 hardcodes `dreamSalary: ''`.
- Every single Gemini call includes "Dream salary / financial vision: Not yet defined." — wasted tokens on every request.
- **Fix:** either remove the prompt section or collect the field (new form input, DB column, serialisation).

**ISSUE-04 — Non-transactional memory writes in `saveProfile()`**
- The sequence is: DELETE old memories → `clearParaphraseCache()` → INSERT 3 new memories.
- If any `saveMemory()` INSERT fails, the old memories are already deleted and the new ones are partially written. No rollback occurs.
- The paraphrase cache is cleared before the writes (step 3) so the AI will see whatever partial state exists in the DB — which is better than a stale cache, but the underlying data inconsistency remains.
- **Full fix requires:** a Supabase database function/transaction, or moving memory management to a server-side edge function.

---

### 🟡 Low Severity

**ISSUE-05 — Conversation count stat always ≤ 1**
- `Dashboard.jsx` shows a "Conversations" stat using `getConversationCount()`.
- Since `getOrCreateConversation()` enforces one thread per user, this is always `0` or `1`.
- **Fix:** count `messages` rows, or rename the stat.

**ISSUE-06 — No journal entry delete**
- `journal.js` has no `deleteJournal()` function. `Journal.jsx` has no delete button.
- Users cannot remove entries.

**ISSUE-07 — `src/test.js` is a stale scratch file**
- `frontend/src/test.js` (91 bytes) exists and is not imported anywhere.
- **Fix:** delete before any production release.

**ISSUE-08 — `Navbar.jsx` variant `'app'` is unused**
- `Navbar.jsx` accepts `variant` prop (`'marketing'` | `'app'`). The `'app'` variant (which shows a Dashboard link) is never used.
- The app shell uses `Sidebar.jsx` instead. `Navbar.jsx` is only used in `MarketingLayout.jsx` with `variant="marketing"`.

### ⚠️ Areas That Should Not Be Modified Without Review

| Area | Risk |
|---|---|
| `buildFutureSelfSystemPrompt()` in `gemini.js` | Changing the prompt structure changes AI behaviour for all users. Test thoroughly against edge cases (no profile, first message, long history). |
| `buildDreamLife()` / `parseDreamLifeFields()` in `profiles.js` | These two functions must remain perfectly inverse. Any format change breaks existing user data in the `dream_life` column. |
| `getOrCreateConversation()` in `chat.js` | Changing this to allow multiple threads requires simultaneous changes to `Chat.jsx`, `routes/index.jsx`, and `constants/routes.js`. |
| Supabase RLS policies | Incorrectly written policies can expose user data. Always test with two different user accounts. |
| `clearParaphraseCache()` call order in `saveProfile()` | Must be called after the `DELETE` but before any `saveMemory()` calls. See ISSUE-04 for why. |

---

## 16. Git Workflow

### Branches

| Branch | Status | Purpose |
|---|---|---|
| `main` | Active | Stable production-ready code |
| `phase1-stable` | Frozen | Snapshot of completed Phase 1 |
| `bugfix-memory-cache` | Active | sessionStorage cache fix for `paraphraseMemories()` — awaiting merge |
| `backup-v1` | Frozen | Safety snapshot — do not modify |

### Branch Naming Conventions

```
feat/<short-description>       # New features
fix/<short-description>        # Bug fixes
refactor/<short-description>   # Refactors without behaviour change
chore/<short-description>      # Tooling, deps, config
docs/<short-description>       # Documentation only
```

### Commit Message Format

```
<type>: <short imperative description>

Examples:
  feat: add memory vault page with delete support
  fix: cap chat history at 20 messages before Gemini call
  refactor: extract useProfile custom hook from Dashboard
  chore: add profiles and memories migration files
  docs: update developer onboarding with goals table schema
```

### Development Workflow

```bash
# 1. Always verify your branch before making changes
git branch

# 2. Pull latest main
git checkout main && git pull

# 3. Create a feature branch
git checkout -b feat/your-feature

# 4. Develop + test locally
cd frontend && npm run dev

# 5. Before committing: build must pass with no errors
npm run build

# 6. Lint
npm run lint

# 7. Commit
git add <specific files>
git commit -m "feat: description"

# 8. Push + PR against main
git push origin feat/your-feature
```

### Review Process

- Self-review: read your own diff, run build, check for console errors
- For any AI prompt changes: manually test first message, conversation continuation, and profile-less fallback
- For any DB changes: test with two separate user accounts to verify RLS isolation

---

## 17. Future Roadmap

### Recommended Implementation Order

The order below minimises rework — each item builds on the previous.

```
Priority 1 — Foundation fixes (do these first, they unblock everything)
  ├─ CHORE: Write migrations for `profiles` and `memories` tables
  ├─ FIX:   Implement AI history windowing (last 20 messages)
  └─ FIX:   Remove `dreamSalary` from prompt OR build the field

Priority 2 — Memory Vault (high user value, low complexity)
  ├─ feat: Add Memory Vault page (/memories route)
  │         → getMemories() already exists
  │         → Add deleteMemory() to memories.js
  │         → Add /memories to routes/index.jsx and Sidebar.jsx navItems
  └─ feat: Capture chat-derived memories
            → After each AI reply, analyse content and saveMemory() if significant

Priority 3 — Goals system (requires new DB table)
  ├─ chore: Create goals migration (id, user_id, goal_name, progress, status, created_at)
  ├─ feat:  Goals lib (createGoal, getGoals, updateGoalProgress)
  ├─ feat:  Goals page or Dashboard widget
  └─ feat:  Inject goal progress into AI prompt

Priority 4 — Journal × Chat integration (medium complexity)
  ├─ feat: "Save as journal insight" button in Chat.jsx
  └─ feat: AI-generated journal summary after session

Priority 5 — Multiple conversations (significant scope)
  ├─ feat: createConversation(), getConversations() in chat.js
  ├─ feat: Dynamic route /chat/:conversationId
  ├─ feat: Conversation list panel in Chat.jsx
  └─ feat: "New conversation" button

Priority 6 — Dashboard analytics upgrade (after Goals and Memory Vault are done)
  ├─ feat: Activity streak computation
  ├─ feat: Mood timeline chart (journal mood over time)
  └─ feat: Goal progress widget
```

### Architectural Recommendations

**1. Move AI calls server-side when ready to monetise**
Currently the Gemini API key is browser-visible. For any paid tier or per-user metering, calls should move to a Supabase Edge Function or a Next.js API route. The `lib/gemini.js` module is already well-encapsulated and would be straightforward to proxy.

**2. Add a server-side transaction for `saveProfile()`**
The three `saveMemory()` calls are sequential and non-atomic. Wrap them in a Supabase database function with a `BEGIN/COMMIT` block to prevent partial write states.

**3. Consider a custom hook layer**
All pages share the same `useEffect` + `loading/error` pattern. A `useProfile()`, `useMessages()`, `useJournals()` hook layer would eliminate ~40% of boilerplate and make components significantly more readable.

**4. Introduce message windowing before scaling**
Before supporting multiple conversations or marketing the app, cap Gemini history at 20 messages. This is a one-line change in `sendChatMessage()` (`.slice(-20)` on the history array) but has correctness implications for `Chat.jsx`'s display vs what the AI sees — document this clearly.

**5. `dream_life` blob is a liability**
The structured-text approach in a single column works now but becomes painful if goal fields need to be queried, indexed, or extended. Long-term, normalise to separate columns: `career_goal TEXT`, `health_goal TEXT`, `life_vision TEXT`, or add a `JSONB` column. Requires a one-time data migration for existing users.
