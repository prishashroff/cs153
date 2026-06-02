require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Routes
app.use("/api/activities", require("./routes/activities"));
app.use("/api/calendar", require("./routes/calendar"));
app.use("/api/locations", require("./routes/locations"));
app.use("/api/ai", require("./routes/ai"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🕐 Chronos server running on http://localhost:${PORT}`));
