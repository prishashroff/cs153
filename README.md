# ⌛ Chronos — Time Intelligence

An AI-powered daily activity tracker that uses your location, calendar, and movement to automatically log what you're doing throughout the day — then gives you Claude-powered insights to help you improve.

![Chronos Screenshot](https://placeholder.com/screenshots)

## ✨ Features

- **🗺 Location-Based Activity Inference** — Define known places (dorm, dining hall, library, office) and Chronos automatically infers what you're doing when you're there
- **📅 Calendar Integration** — Cross-references your calendar events with location to detect class/meeting attendance
- **🚶 Movement Detection** — Detects walking, biking, and transit based on GPS speed
- **📋 24-Hour Timeline** — Visual log of your entire day with color-coded categories
- **✏️ Manual Editing** — Click any activity to edit the time, label, category, or icon
- **🤖 AI Insights** — Claude analyzes your day and gives personalized recommendations
- **👤 / 🏢 Dual Mode** — Individual (student) and Business (professional) modes with tailored insights
- **📊 Dashboard** — Charts and stats on how you spent your time

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- An Anthropic API key (for AI Insights) — get one at [console.anthropic.com](https://console.anthropic.com)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/chronos.git
cd chronos

# 2. Install all dependencies
npm run install:all

# 3. (Optional) Create .env in /server for server-side API key
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > server/.env

# 4. Start both server and client
npm run dev
```

The app will open at **http://localhost:3000**  
The API server runs at **http://localhost:3001**

## 📁 Project Structure

```
chronos/
├── client/                  # React frontend (port 3000)
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── context/         # Global app state
│       ├── pages/           # Route pages
│       └── utils/
├── server/                  # Express API (port 3001)
│   ├── routes/              # API route handlers
│   └── data/                # Sample/mock data
└── package.json             # Root scripts
```

## 🔧 Usage

### 1. Set Your API Key
Go to **Settings** → paste your Anthropic API key. It's stored locally in your browser.

### 2. Define Your Locations
Go to **Locations** → click "+ Add Location" → use "📍 Use Current GPS Location" to capture your coordinates.

Common locations to add:
- Home / Dorm
- Dining Hall
- Library
- Class buildings
- Gym

### 3. Add Calendar Events
Go to **Calendar** → add your recurring classes, meetings, and events. Link them to known locations for smart inference.

### 4. Start Tracking
Go to **Locations** → click **▶ Start Tracking** to enable live GPS tracking.

### 5. View Your Timeline
Go to **Timeline** to see your auto-logged day. Click any activity to edit it.

### 6. Get AI Insights
Go to **AI Insights** → click **✦ Run AI Analysis** to get Claude's analysis of your day.

## 🏗 Production Setup

To connect real calendar data (Google Calendar, Outlook):
1. Set up OAuth in `/server/routes/calendar.js`
2. Replace the mock data with actual API calls

To persist data beyond restarts:
1. Replace the in-memory arrays in `/server/routes/activities.js` with a database (SQLite, PostgreSQL, MongoDB)

## 📦 Deploy to GitHub

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit: Chronos time tracker"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/chronos.git
git push -u origin main
```

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router 6, Recharts |
| Backend | Node.js, Express |
| AI | Anthropic Claude API (claude-sonnet-4) |
| Location | Browser Geolocation API |
| Styling | CSS custom properties, Google Fonts (Syne + DM Sans) |

## 📄 License

MIT
