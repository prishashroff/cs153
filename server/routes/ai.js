const express = require("express");
const router = express.Router();

router.post("/analyze", async (req, res) => {
  const { activities, mode, date } = req.body;

  if (!activities || activities.length === 0) {
    return res.status(400).json({ error: "No activities to analyze" });
  }

  const apiKey = req.headers["x-api-key"] || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: "No API key provided. Add ANTHROPIC_API_KEY to .env or pass x-api-key header." });
  }

  const categoryTotals = {};
  activities.forEach((a) => {
    const cat = a.category || "other";
    const dur = a.durationMinutes || 0;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + dur;
  });

  const activitySummary = activities
    .map((a) => `- ${a.startTime}–${a.endTime}: ${a.label} (${a.durationMinutes} min, ${a.category})`)
    .join("\n");

  const modeContext =
    mode === "business"
      ? "This is a business professional. Focus on productivity, meetings, deep work, and work-life balance."
      : "This is a student. Focus on study time, class attendance, sleep, exercise, and social balance.";

  const prompt = `You are a personal time coach analyzing someone's day. ${modeContext}

Date: ${date}
Activities for the day:
${activitySummary}

Time breakdown by category (minutes):
${Object.entries(categoryTotals)
  .map(([k, v]) => `- ${k}: ${v} min`)
  .join("\n")}

Provide a concise, insightful analysis in JSON format with this exact structure:
{
  "score": <number 1-100, overall day effectiveness score>,
  "headline": "<one punchy sentence summarizing the day>",
  "insights": [
    { "type": "positive"|"negative"|"neutral", "title": "<short title>", "body": "<2-3 sentence insight>" }
  ],
  "suggestions": [
    { "priority": "high"|"medium"|"low", "title": "<action title>", "body": "<specific actionable suggestion>" }
  ],
  "categoryBreakdown": {
    "<category>": { "minutes": <number>, "percentage": <number>, "assessment": "good"|"low"|"high"|"ok" }
  }
}

Limit to 3-4 insights and 3 suggestions. Be specific, personal, and actionable. Return ONLY valid JSON.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const text = data.content[0].text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error("AI analysis error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
