const express = require("express");
const router = express.Router();

let knownLocations = require("../data/sampleLocations");

router.get("/", (req, res) => res.json(knownLocations));

router.post("/", (req, res) => {
  const loc = { id: Date.now().toString(), ...req.body };
  knownLocations.push(loc);
  res.status(201).json(loc);
});

router.put("/:id", (req, res) => {
  const idx = knownLocations.findIndex((l) => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  knownLocations[idx] = { ...knownLocations[idx], ...req.body };
  res.json(knownLocations[idx]);
});

// Resolve location + context -> inferred activity
router.post("/infer", (req, res) => {
  const { locationId, speed, calendarEvent, mode } = req.body;
  const location = knownLocations.find((l) => l.id === locationId);

  let inferred = inferActivity({ location, speed, calendarEvent, mode });
  res.json({ activity: inferred, location });
});

function inferActivity({ location, speed, calendarEvent, mode }) {
  if (speed && speed > 10) return { type: "transit", label: "Commuting / Traveling", icon: "🚗", category: "transit" };
  if (speed && speed > 3) return { type: "biking", label: "Biking", icon: "🚴", category: "exercise" };
  if (speed && speed > 1.5) return { type: "walking", label: "Walking", icon: "🚶", category: "exercise" };

  if (!location) return { type: "unknown", label: "Unknown Location", icon: "📍", category: "other" };

  if (calendarEvent && location.type === "academic") {
    return { type: "class", label: `In Class: ${calendarEvent.title}`, icon: "📚", category: "academic" };
  }

  const typeMap = {
    dining: { type: "eating", label: "Eating / Dining", icon: "🍽️", category: "personal" },
    dorm: { type: "home", label: "At Home / Dorm", icon: "🏠", category: "personal" },
    gym: { type: "exercise", label: "Working Out", icon: "💪", category: "exercise" },
    library: { type: "studying", label: "Studying", icon: "📖", category: "academic" },
    academic: { type: "studying", label: "On Campus", icon: "🎓", category: "academic" },
    office: { type: "working", label: mode === "business" ? "Working" : "At Office", icon: "💼", category: "work" },
    cafe: { type: "cafe", label: "At Café", icon: "☕", category: "personal" },
    social: { type: "social", label: "Social / Recreation", icon: "👥", category: "social" },
  };

  return typeMap[location.type] || { type: "other", label: location.name, icon: "📍", category: "other" };
}

module.exports = router;
