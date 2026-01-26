import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import Groq from "groq-sdk";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* --------- MIDDLEWARE --------- */
app.use(cors());
app.use(express.json());

/* --------- RATE LIMIT --------- */
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please pause for a moment." },
});
app.use("/api/", limiter);

/* --------- GROQ SETUP --------- */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* --------- PATH FIX FOR RENDER --------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* --------- ROUTES --------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "MindMinute backend running" });
});

/* --------- AI ENDPOINT --------- */
app.post("/api/generate-reset", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 3) {
      return res.status(400).json({ error: "Text input is required" });
    }

    const systemPrompt = `
You are MindMinute — a calm, emotionally intelligent presence.

Your purpose is not to solve, diagnose, judge, or fix the user.
You exist only to listen deeply, reflect gently, reassure emotionally,
and guide the user into a brief moment of calm.

RESPONSE STRUCTURE (INTERNAL ONLY)

1) Emotional Reflection  
2) Gentle Reassurance  
3) Soft Micro-Philosophy (2–3 lines)  
4) One-Minute Seated Grounding

CRITICAL FORMAT RULE

Do NOT show headings, numbers, or labels.
Do NOT mention steps.
Write exactly four gentle bullet points.

Each bullet corresponds to the four steps.
No text before or after the bullets.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const aiText =
      completion.choices?.[0]?.message?.content ||
      "- You're being heard.\n- You're not alone in this.\n- Even heavy moments pass.\n- Take one slow breath now.";

    res.json({ reset: aiText });

  } catch (err) {
    console.error("Groq Error:", err);
    res.status(503).json({
      reset:
        "- The space feels quiet right now.\n- You're still safe here.\n- Pauses are part of the rhythm.\n- Take one slow breath and try again.",
    });
  }
});

/* --------- SERVE FRONTEND --------- */
app.use(express.static(path.join(__dirname, "../client")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

/* --------- START SERVER --------- */
app.listen(PORT, () => {
  console.log(`🧠 MindMinute running on port ${PORT}`);
});
