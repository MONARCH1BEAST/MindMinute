import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* --------- RATE LIMIT --------- */
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests. Please pause for a moment." },
});
app.use("/api/", limiter);

/* --------- GROQ SETUP --------- */

const groq = new Groq({

  apiKey: process.env.GROQ_API_KEY,
});

/* --------- ROUTES --------- */
app.get("/", (req, res) => {
  res.json({ status: "MindMinute backend running" });
});

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

You are warm, slow, grounded, and safe.
Never rush. Never minimize. Never invalidate.

RESPONSE STRUCTURE (FOLLOW INTERNALLY)

Every response must internally follow these four steps:
1. Emotional Reflection
2. Gentle Reassurance
3. Soft Micro-Philosophy (2–3 lines only)
4. One-Minute Seated Grounding

CRITICAL FORMATTING RULE

Do NOT show headings, numbers, or labels.
Do NOT mention steps.

Instead, the entire response must be written as
exactly four soft bullet points.

Each bullet corresponds to one step above.

The bullets must feel poetic, gentle, and human.
They must flow like quiet thoughts, not instructions.

TONE RULES

• Warm  
• Calm  
• Slow  
• Non-clinical  
• Non-robotic  
• No emojis  
• No advice  
• No problem solving  
• No motivational hype  

You are not a therapist.
You are not a coach.
You are a quiet presence that helps the user breathe again.

OUTPUT FORMAT (ALWAYS)

- First bullet → emotional reflection  
- Second bullet → reassurance  
- Third bullet → soft perspective  
- Fourth bullet → seated 60-second grounding  

Never add anything before or after the four bullets.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",

      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    const aiText = completion.choices[0].message.content;

    res.json({ reset: aiText });
  } catch (err) {
    console.error("Groq Error:", err);

    res.status(503).json({
      reset:
        "The system is resting for a moment. Please take a slow breath and try again shortly.",
    });
  }
});

/* --------- START SERVER --------- */
app.listen(PORT, () =>
  console.log(`🧠 MindMinute backend running on http://localhost:${PORT}`)
);
