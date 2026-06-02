const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// In-memory store (replace with DB in production)
let activities = require("../data/sampleActivities");

// GET all activities for a date
router.get("/", (req, res) => {
  const { date } = req.query;
  if (date) {
    const filtered = activities.filter((a) => a.date === date);
    return res.json(filtered);
  }
  res.json(activities);
});

// POST new activity
router.post("/", (req, res) => {
  const activity = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  activities.push(activity);
  res.status(201).json(activity);
});

// PUT update activity
router.put("/:id", (req, res) => {
  const idx = activities.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  activities[idx] = { ...activities[idx], ...req.body };
  res.json(activities[idx]);
});

// DELETE activity
router.delete("/:id", (req, res) => {
  activities = activities.filter((a) => a.id !== req.params.id);
  res.json({ success: true });
});

// POST bulk replace (for a full day sync)
router.post("/sync", (req, res) => {
  const { date, items } = req.body;
  activities = activities.filter((a) => a.date !== date);
  const newItems = items.map((item) => ({ id: uuidv4(), ...item, date }));
  activities.push(...newItems);
  res.json(newItems);
});

module.exports = router;
