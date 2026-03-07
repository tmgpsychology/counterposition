# Counterposition

A cognitive exercise web app with two tools:

## Pages

### 1. Counterposition (`/`)
Users state a strongly held belief, then construct the strongest possible counter-argument against it. The app scores effort using a client-side scoring engine across four metrics:
- **Structural Depth** — argument length and complexity
- **Rhetorical Range** — vocabulary diversity and analytical keywords
- **Intellectual Friction** — how much the counter-argument introduces new ideas vs. restating the belief
- **Research Quality** — references to studies, data, peer-reviewed sources

Grades use A+ through F- scale (no numerical scores shown).

### 2. Weigh It Up (`/weigh-it-up`)
Visual pros and cons tool. Each pro/con is a circle. Users adjust circle weight with +/- buttons. Circles auto-scale to fit within a fixed container. Contextual suggestions prompt users with relevant considerations based on their topic.

## Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, wouter routing, shadcn/ui components
- **Backend**: Express.js (serves API + static files)
- **Fonts**: Space Grotesk + Inter
- **Design**: Brutalist aesthetic — sharp corners (radius: 0), black/white high-contrast, dot-grid background
- **Scoring**: Entirely client-side, no database needed
- **Deployment**: Autoscale on Replit, subdomain: counterposition.replit.app

## Key Files
- `client/src/pages/home.tsx` — Main counterposition exercise flow
- `client/src/pages/pros-cons.tsx` — Weigh It Up page
- `client/src/lib/scoring.ts` — Scoring engine with letter grades
- `client/index.html` — SEO meta tags, Google Search Console verification
- `server/routes.ts` — Sitemap and robots.txt routes
