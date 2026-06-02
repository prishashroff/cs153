const express = require("express");
const router = express.Router();

// Mock calendar events - in production connect Google Calendar / Outlook OAuth
const calendarEvents = require("../data/sampleCalendar");

router.get("/", (req, res) => {
  const { date } = req.query;
  if (date) {
    return res.json(calendarEvents.filter((e) => e.date === date));
  }
  res.json(calendarEvents);
});

router.post("/", (req, res) => {
  const event = { id: Date.now().toString(), ...req.body };
  calendarEvents.push(event);
  res.status(201).json(event);
});

module.exports = router;
