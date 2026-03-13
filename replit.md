# Reckon

A cognitive exercise web app with three tools for structured thinking and decision-making. Formerly "Reckon & Sift" / "Counterposition".

## Pages

### Hub (`/`)
Landing page with cards linking to each tool. Includes sign in/sign up UI in top-right corner, and a History link when logged in.

### 1. Counterposition (`/counterposition`)
Users state a strongly held belief, then construct the strongest possible counter-argument against it. The app scores effort using a client-side scoring engine across four metrics:
- **Structural Depth** — argument length and complexity
- **Rhetorical Range** — vocabulary diversity and analytical keywords
- **Intellectual Friction** — how much the counter-argument introduces new ideas vs. restating the belief
- **Research Quality** — references to studies, data, peer-reviewed sources

Grades use A+ through F- scale (no numerical scores shown). Results auto-save for logged-in users.

### 2. Weigh It Up (`/weigh-it-up`)
Visual pros and cons tool with weighted bars. Users tap to select, adjust weight with +/- buttons. Contextual suggestions based on topic. Verdict circles show which side carries more weight. Logged-in users can save to history via a "Save to History" button.

### 3. Unthread (`/unthread`)
Decision decomposition tool with 3 phases:
- **The Chain** — trace a situation through multiple "because" reasons (multiple per link)
- **The Trade** — visualise the full chain from cost to gain, phrase as an explicit choice, answer "is this trade worth it?"
- **Decompose** — each chain link shown with ability to add alternative approaches. Logged-in users can save to history.

### 4. History (`/history`)
Timeline view of all saved exercises for logged-in users. Grouped by date, sorted most recent first. Each entry shows tool type, summary text, and grade/verdict. Tap to expand and view full read-only details.

### Account (`/account`)
Sign-up/login page with email and password. Redirects to home if already logged in.

### Terms of Use (`/terms`)
Professional disclaimer covering AI usage, data handling, and limitation of liability.

## Authentication
- Email + password authentication with Passport.js (local strategy)
- Passwords hashed with bcrypt (12 salt rounds)
- Sessions stored in PostgreSQL via connect-pg-simple (30-day cookie)
- Session regeneration on login/signup to prevent fixation attacks
- Full session destruction + cookie clearing on logout
- Guest mode: app works fully without an account
- Subtle account indicator in top-right corner of all pages (with History link in dropdown)

## Exercise History
- Logged-in users' completed exercises are saved to PostgreSQL
- Counterposition: saves belief, counter-argument, grade, summary, and per-metric grades (auto-save on result)
- Weigh It Up: saves decision, pros/cons with weights, and percentages (manual save via button)
- Unthread: saves question, chain, trade gain, and alternatives (manual save via button)
- Guest users see a subtle prompt after completing an exercise suggesting they sign up to save results
- History page at `/history` shows all saved exercises in a timeline

## Design — "Cream & Sage" Theme
- Background: `#F4F1DE` (cream)
- Card/surface: slightly darker cream
- Text: `#3D405B` (dark slate)
- Primary accent / Pro color: `#81B29A` (sage green)
- Secondary accent / Con color: `#E07A5F` (terra cotta)
- Warm accent: `#F2CC8F` (sand)
- Rounded corners (`rounded-md`, 0.5rem radius)
- Uppercase tracking-widest labels throughout

## Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, wouter routing, shadcn/ui components
- **Backend**: Express.js (serves API + static files)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Passport.js (local strategy), express-session, connect-pg-simple
- **Fonts**: DM Sans + Inter
- **Scoring**: Entirely client-side for Counterposition
- **Deployment**: Autoscale on Replit, subdomain: counterposition.replit.app

## Database Tables
- `users` — id, email, password, created_at
- `counterposition_exercises` — id, user_id, belief, counter_argument, grade, summary, metrics (jsonb), created_at
- `weigh_it_up_exercises` — id, user_id, decision, pros (jsonb), cons (jsonb), pro_percent, con_percent, created_at
- `unthread_exercises` — id, user_id, question, chain (jsonb), trade_cost, trade_gain, alternatives (jsonb), created_at

## Key Files
- `client/src/pages/home.tsx` — Hub landing page
- `client/src/pages/counterposition.tsx` — Counterposition exercise flow
- `client/src/pages/pros-cons.tsx` — Weigh It Up page
- `client/src/pages/unthread.tsx` — Unthread decision decomposition page
- `client/src/pages/history.tsx` — Exercise history timeline page
- `client/src/pages/disclaimer.tsx` — Terms of Use page
- `client/src/pages/auth-page.tsx` — Sign-up/login page
- `client/src/hooks/use-auth.tsx` — Auth context provider and useAuth hook
- `client/src/components/account-header.tsx` — Account indicator (top-right) with history link
- `client/src/components/guest-signup-prompt.tsx` — Guest signup prompt component
- `client/src/lib/scoring.ts` — Scoring engine with letter grades
- `client/index.html` — SEO meta tags, Google Search Console verification
- `server/auth.ts` — Passport setup, session config, auth routes
- `server/db.ts` — Drizzle ORM database connection
- `server/storage.ts` — Database storage interface (Drizzle queries for users + exercises)
- `server/routes.ts` — Exercise save/list API routes with Zod validation, share, sitemap, robots.txt
- `shared/schema.ts` — Drizzle schema (users + 3 exercise tables)
- `scripts/post-merge.sh` — Post-merge setup script (npm install + drizzle push)
