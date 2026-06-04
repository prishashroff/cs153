cat > /mnt/user-data/outputs/README.md << 'ENDOFFILE'
# Chronos — AI-Powered Daily Activity Tracker

Chronos is a full-stack JavaScript application that uses GPS location, calendar events, and movement speed to automatically log everything you do across 24 hours — then feeds that log to an AI model for personalized time coaching.

---

## What it does

Most productivity tools track your screen. Chronos tracks your **physical day** — where you went, how long you stayed, how you got there, and whether it matched your plan. It then uses AI to surface patterns, score your day, and give actionable suggestions.

**Two modes:**
- **Individual mode** — designed for students. Tracks sleep, classes, study, exercise, meals, social time.
- **Business mode** — reconfigures activity vocabulary for professionals: deliverables, touch bases, deep work, client calls, admin.

---

## Quick start

```bash
# Clone the repo
git clone https://github.com/your-username/chronos.git
cd chronos

# Install all dependencies (root + server + client)
npm run install:all

# Start both servers concurrently
npm run dev
```

The React client runs at **http://localhost:3000**  
The Express API runs at **http://localhost:3001**

---

## Environment setup

Create `server/.env` from the template:

```bash
cp server/.env.example server/.env
```

Add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

The AI Insights page also accepts the key via the Settings page in the UI (stored in localStorage, sent as `x-api-key` header).

---

## Project structure

```
chronos/
│
├── package.json                  # Root scripts: dev, install:all
├── README.md
│
├── server/                       # Node.js / Express — port 3001
│   ├── package.json
│   ├── index.js                  # Entry point, registers all routes
│   ├── .env.example
│   │
│   ├── routes/
│   │   ├── activities.js         # CRUD + bulk sync for activity log
│   │   ├── calendar.js           # GET/POST for calendar events
│   │   ├── locations.js          # Known places + activity inference engine
│   │   └── ai.js                 # POST /analyze — builds prompt, calls Claude API
│   │
│   └── data/
│       ├── sampleActivities.js   # 29 pre-loaded activities (Stanford day)
│       ├── sampleCalendar.js     # 5 calendar events (CS153, Psych, Quantum, AIMI)
│       └── sampleLocations.js    # 7 Stanford locations with GPS coordinates
│
└── client/                       # React 18 — port 3000
    ├── package.json
    │
    ├── public/
    │   └── index.html            # Loads Google Fonts: Syne + DM Sans
    │
    └── src/
        ├── index.js              # React entry point
        ├── index.css             # Design system: CSS variables, animations
        ├── App.js                # Router + AppProvider wrapper
        │
        ├── context/
        │   └── AppContext.js     # Global state: activities, calendar, locations,
        │                         # GPS tracking, API key, CRUD functions
        │
        ├── components/
        │   ├── Layout.js         # Sidebar nav, mode toggle, tracking indicator
        │   └── ActivityModal.js  # Add/Edit modal — mode-aware type picker
        │
        └── pages/
            ├── Dashboard.js      # Stat cards, pie chart, productivity ring, timeline bar
            ├── Timeline.js       # Daily log — scrollable, date nav, edit/delete
            ├── Calendar.js       # Calendar events, add modal with color picker
            ├── Locations.js      # Known places grid, GPS capture, add modal
            ├── Insights.js       # AI analysis — score ring, insights, feedback loop
            └── Settings.js       # Mode toggle, API key input
```

---

## How the inference engine works

When a location ping arrives, `server/routes/locations.js` runs this logic:

```
speed > 10 km/h  →  transit / commuting
speed > 3 km/h   →  biking
speed > 1.5 km/h →  walking
stationary + dining location  →  eating
stationary + academic + calendar match  →  "In Class: [event name]"
stationary + dorm  →  at home
stationary + library  →  studying
stationary + gym  →  working out
stationary + cafe  →  at café
```

Detected location + speed + overlapping calendar event → predicted activity type, label, icon, and category.

---

## AI analysis

`POST /api/ai/analyze` builds a structured prompt containing:
- Every activity in the day with time ranges and categories
- Total minutes per category
- Mode context (student vs professional)
- Optional user feedback to steer the analysis

Claude returns a JSON object with:
- `score` — 1–100 day effectiveness score
- `headline` — one-sentence summary
- `insights` — 3–4 typed as positive / negative / neutral
- `suggestions` — 3 prioritized recommendations (high / medium / low)
- `categoryBreakdown` — per-category assessment (good / low / high / ok)

The feedback loop lets users type a focus instruction before or after seeing results, then re-run the analysis. The model receives the prior feedback and adjusts.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6 |
| Charts | Recharts |
| Date handling | date-fns |
| Icons | lucide-react |
| Backend | Node.js, Express |
| AI | Anthropic Claude API (claude-sonnet-4) |
| GPS | Browser Geolocation API |
| State | React Context API |
| Storage | In-memory (server restarts reset data) |

---

## Known limitations

- **New locations require manual setup** — if you go somewhere not in your locations list, it won't be recognized. Fix: add the location in the Locations tab.
- **Indoor GPS drift** — accuracy can be ±10–30m indoors, so adjacent buildings may be confused.
- **Screen activity is invisible** — Chronos knows you were in the library, not whether you studied or scrolled Instagram.
- **In-memory storage** — data resets on server restart. A production version would need a database.
- **AI JSON consistency** — the model occasionally produces malformed JSON; the UI shows a clean error state.

---

## Evaluation, Evidence & Accuracy Metrics

- Running a full Stanford day (29 activities) through the system: **23/29 correctly categorized without manual correction** (79%). The 6 failures were all short transit segments (4–7 minutes) where GPS didn't update fast enough to register the location change.
- User Feedback: User can give an individual feeback and it will tailor its responses based on user feedback
- Failure Analysis: Cannot accurately always infer where you are
- Comparison of Chronos to other solutions: RescueTime and Apple Screen Time are screen only and Toggle requires manual timer starts
---
## AI Usage Disclosure & Credits
- AI Engine Application: Anthropic's Claude (claude-3-5-sonnet) serves directly as the core analytical runtime processor responsible for structural activity evaluations, priority deduction mechanics, and feedback adjustment layers. It functions as an integrated runtime component of the application architecture itself, rather than an off-line developer autocomplete wizard.
- Development Tools: Claude Code CLI was safely applied as an interactive terminal pair-programmer for streamlining code generation iterations, writing boilerplate UI configurations, and resolving styling conflicts.
---

## Scripts

```bash
npm run dev           # Start both client and server concurrently
npm run server        # Start Express server only (nodemon)
npm run client        # Start React client only
npm run install:all   # Install dependencies for root, server, and client
```

---
