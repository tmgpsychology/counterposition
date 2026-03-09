# Counterposition

A cognitive exercise web app with three tools for structured thinking and decision-making.

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

### Terms of Use (`/terms`)
Professional disclaimer covering AI usage, data handling, and limitation of liability.

## Design
- Colors: navy `#333D79`, muted rose `#c4868a`, white text on colored elements
- Rounded corners (`rounded-md`) on inner tool pages
- Uppercase tracking-widest labels throughout
- Pro color: `#333D79`, Con color: `#c4868a`

## Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, wouter routing, shadcn/ui components
- **Backend**: Express.js (serves API + static files)
- **Fonts**: Space Grotesk + Inter
- **Scoring**: Entirely client-side, no database needed
- **Deployment**: Autoscale on Replit, subdomain: counterposition.replit.app

## Key Files
- `client/src/pages/home.tsx` — Hub landing page
- `client/src/pages/counterposition.tsx` — Counterposition exercise flow
- `client/src/pages/pros-cons.tsx` — Weigh It Up page
- `client/src/pages/unthread.tsx` — Unthread decision decomposition page
- `client/src/pages/disclaimer.tsx` — Terms of Use page
- `client/src/lib/scoring.ts` — Scoring engine with letter grades
- `client/index.html` — SEO meta tags, Google Search Console verification
- `server/routes.ts` — Sitemap and robots.txt routes
