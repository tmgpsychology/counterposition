# Reckon & Sift

A cognitive exercise web app with three tools for structured thinking and decision-making. Formerly "Counterposition".

## Pages

### Hub (`/`)
Landing page with cards linking to each tool. Designed with room to add more tools.

### 1. Counterposition (`/counterposition`)
Users state a strongly held belief, then construct the strongest possible counter-argument against it. The app scores effort using a client-side scoring engine across four metrics:
- **Structural Depth** — argument length and complexity
- **Rhetorical Range** — vocabulary diversity and analytical keywords
- **Intellectual Friction** — how much the counter-argument introduces new ideas vs. restating the belief
- **Research Quality** — references to studies, data, peer-reviewed sources

Grades use A+ through F- scale (no numerical scores shown).

### 2. Weigh It Up (`/weigh-it-up`)
Visual pros and cons tool with weighted bars. Users tap to select, adjust weight with +/- buttons. Contextual suggestions based on topic. Verdict circles show which side carries more weight.

### 3. Unthread (`/unthread`)
Decision decomposition tool with 3 phases:
- **The Chain** — trace a situation through multiple "because" reasons (multiple per link)
- **The Trade** — visualise the full chain from cost to gain, phrase as an explicit choice, answer "is this trade worth it?"
- **Decompose** — each chain link shown with ability to add alternative approaches

### Account (`/account`)
Sign-up/login page with email and password. Redirects to home if already logged in.

### History (`/history`)
Timeline view of all saved exercises for logged-in users. Shows exercises grouped by date with expandable detail cards. Each card shows tool type, summary, grade/verdict, and full exercise data when expanded.

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
- Counterposition: saves belief, counter-argument, grade, summary, and per-metric grades
- Weigh It Up: saves topic, pros/cons with weights, and percentages (manual save via button)
- Unthread: saves question, chain, trade cost/gain, and alternatives (manual save via button)
- Guest users see a soft prompt to sign up after completing exercises
- History page at `/history` shows all saved exercises in a timeline

## Design — "Sage & Walnut" Theme
- Background: `#F7F6F3` (soft warm white)
- Card/surface: `#EEEAE4` (light warm sand)
- Text: `#33312E` (dark walnut)
- Muted text: `#7D7871` (warm stone)
- Borders: `#D1CCC5` (light stone)
- Primary accent / Pro color: `#5B7B6A` (muted sage green)
- Secondary accent / Con color: `#C27D60` (warm clay)
- Rounded corners (`rounded-md`, 0.5rem radius)
- Uppercase tracking-widest labels throughout

## Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, wouter routing, shadcn/ui components
- **Backend**: Express.js (serves API + static files)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Passport.js (local strategy), express-session, connect-pg-simple
- **Fonts**: Space Grotesk + Inter
- **Scoring**: Entirely client-side
- **Deployment**: Autoscale on Replit, subdomain: counterposition.replit.app

## Database Tables
- `users` — id, email, password, created_at
- `counterposition_exercises` — id, user_id, belief, counter_argument, grade, summary, metric_grades (jsonb), created_at
- `weigh_it_up_exercises` — id, user_id, topic, pros (jsonb), cons (jsonb), pro_percent, con_percent, created_at
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
- `client/src/lib/scoring.ts` — Scoring engine with letter grades
- `client/index.html` — SEO meta tags, Google Search Console verification
- `server/auth.ts` — Passport setup, session config, auth routes
- `server/db.ts` — Drizzle ORM database connection
- `server/storage.ts` — Database storage interface (Drizzle queries for users + exercises)
- `server/routes.ts` — Exercise save/list API routes, share, sitemap, robots.txt
- `shared/schema.ts` — Drizzle schema (users + 3 exercise tables)
- `scripts/post-merge.sh` — Post-merge setup script (npm install + drizzle push)
