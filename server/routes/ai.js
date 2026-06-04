const express = require("express");
const router = express.Router();

const DO_API_KEY = process.env.DO_API_KEY;
const DO_ENDPOINT = "https://inference.do-ai.run/v1/chat/completions";
const DO_MODEL = "llama3.3-70b-instruct";

router.post("/analyze", async (req, res) => {
  // Destructure userFeedback from the incoming frontend request body
  const { activities, mode, date, userFeedback } = req.body;

  if (!activities || activities.length === 0) {
    return res.status(400).json({ error: "No activities to analyze" });
  }

  if (!DO_API_KEY) {
    return res.status(400).json({ error: "DigitalOcean API key missing. Add DO_API_KEY to your server/.env file." });
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
      ? "This is a business professional. Focus on productivity, meetings, deliverables, deep work, and work-life balance."
      : "This is a student. Focus on study time, class attendance, sleep, exercise, and social balance.";

  // Append user steering feedback to the system prompt if provided
  const feedbackInstruction = userFeedback
    ? `\n\nCRITICAL USER DIRECTION: The user has explicitly requested that you focus on the following aspect for this specific analysis: "${userFeedback}". You MUST prioritize adjusting your score, insights, and recommendations to address this feedback.`
    : "";

  const systemInstruction = `You are a personal time coach analyzing someone's day. ${modeContext}${feedbackInstruction}

Limit to 3-4 insights and 3 suggestions. Be specific, personal, and actionable. You MUST respond with ONLY a valid JSON object — no markdown intro/outro text, no explanation, no code fences. Just raw JSON text.`;

  const userPrompt = `Date: ${date}
Activities for the day:
${activitySummary}

Time breakdown by category (minutes):
${Object.entries(categoryTotals).map(([k, v]) => `- ${k}: ${v} min`).join("\n")}

Respond ONLY with this exact JSON structure:
{
  "score": <number 1-100>,
  "headline": "<one punchy sentence>",
  "insights": [
    { "type": "positive|negative|neutral", "title": "<short title>", "body": "<2-3 sentences>" }
  ],
  "suggestions": [
    { "priority": "high|medium|low", "title": "<action title>", "body": "<specific suggestion>" }
  ],
  "categoryBreakdown": {
    "<category>": { "minutes": <number>, "percentage": <number>, "assessment": "good|low|high|ok" }
  }
}`;

  try {
    const response = await fetch(DO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DO_API_KEY}`,
      },
      body: JSON.stringify({
        model: DO_MODEL,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.3, // Lowered temperature slightly to help Llama strictly adhere to JSON format rules
      }),
    });

    const data = await response.json();

    if (data.error) return res.status(500).json({ error: data.error.message || JSON.stringify(data.error) });
    if (!data.choices || !data.choices[0]) return res.status(500).json({ error: "No response from model", raw: data });

    // Clean up markdown block indicators if the model accidentally includes them
    const text = data.choices[0].message.content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error("DO AI analysis error:", err);
    res.status(500).json({ error: "Failed to process AI Analysis. Ensure your model returned valid JSON. Details: " + err.message });
  }
});

module.exports = router;