// server.js (ESM)
// Load env, optional Mongo connect, expose API (with /api/daily-story/generate)

import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import OpenAI from "openai";

const app = express();

// ----- Middlewares -----
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

// ----- Health -----
const stateMap = ["disconnected", "connected", "connecting", "disconnecting"];
app.get("/health", (_req, res) => {
  const dbState =
    typeof mongoose?.connection?.readyState === "number"
      ? stateMap[mongoose.connection.readyState] || "unknown"
      : "n/a";
  res.json({ status: "ok", dbState });
});

// ----- OpenAI client -----
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Daily story: POST /api/daily-story/generate
// body: { language?: 'zh'|'en'|'es'|string, topic?: string, words?: number }
app.post("/api/daily-story/generate", async (req, res) => {
  try {
    const { language = "zh", topic = "坚持到底", words = 220 } = req.body || {};

    const instructions = [
      `You are an inspirational story writer for a mobile app.`,
      `Write in language code: ${language}.`,
      `Keep it uplifting, grounded in everyday life, and non-political.`,
      `Avoid real person names and claims needing citations.`,
      `No sensitive/graphic content; suitable for general audiences.`,
    ].join(" ");

    const input = [
      `Return ONLY a compact JSON object with keys:`,
      `- "title": <= 12 words`,
      `- "content": ~${Math.max(160, words - 40)} to ${
        words + 80
      } words, single paragraph`,
      `- "moral": <= 16 words (short takeaway)`,
      `Do not include markdown fences or extra text.`,
      `Story theme/topic: ${topic}`,
    ].join("\n");

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      instructions,
      input,
    });

    const text = (response.output_text || "").trim();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      data = match
        ? JSON.parse(match[0])
        : { title: "每日励志故事", content: text, moral: "" };
    }

    const title = String(data.title || "每日励志故事").slice(0, 80);
    const content = String(data.content || "").slice(0, 1500);
    const moral = data.moral ? String(data.moral).slice(0, 120) : undefined;

    res.json({
      title,
      content,
      moral,
      model: response.model,
      request_id: response._request_id,
    });
  } catch (err) {
    console.error("[DailyStory] Error:", err);
    res.status(500).json({
      error: "FAILED_TO_GENERATE_STORY",
      detail: err?.message ?? String(err),
    });
  }
});

// ----- Start server (connect Mongo first if URI provided) -----
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  try {
    if (MONGO_URI) {
      await mongoose.connect(MONGO_URI);
      console.log("✅ MongoDB connected");
      mongoose.connection.on("error", (e) =>
        console.error("MongoDB error:", e)
      );
      mongoose.connection.on("disconnected", () =>
        console.warn("MongoDB disconnected")
      );
    } else {
      console.warn("⚠️ No MONGO_URI set — starting without DB");
    }

    app.listen(PORT, () => {
      console.log(`🚀 API running at http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("❌ Failed to start:", e.message);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  try {
    if (mongoose?.connection?.readyState) await mongoose.connection.close();
  } finally {
    process.exit(0);
  }
});
