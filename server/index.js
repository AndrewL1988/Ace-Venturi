require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3001;

// Trust Railway's proxy
app.set('trust proxy', 1);

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "50mb" })); // 50mb for base64 images
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
  methods: ["POST"],
  allowedHeaders: ["Content-Type"],
}));

// Rate limiting — prevents API key abuse
const limiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute window
  max: 30,                    // 30 requests per minute per IP
  message: { error: "Too many requests. Please wait a moment and try again." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '127.0.0.1', // Skip rate limiting for health checks
});
app.use("/api/", limiter);

// ── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    name: "Ace Venturi: Controls Detective",
    version: "1.0.0",
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
  });
});

// ── Anthropic proxy ─────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured on server. Add it to your .env file." });
  }

  try {
    const { messages, system, tools, max_tokens, model } = req.body;

    // Basic validation
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request: messages array required." });
    }

    const payload = {
      model: model || "claude-sonnet-4-6",
      max_tokens: max_tokens || 4000,
      system,
      messages,
    };
    if (tools && tools.length > 0) payload.tools = tools;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return res.status(response.status).json({ error: data.error?.message || "Anthropic API error" });
    }

    res.json(data);

  } catch (err) {
    console.error("Proxy server error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ── Serve React build in production ─────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const path = require("path");
  app.use(express.static(path.join(__dirname, "../build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
  });
}

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🕵️  Ace Venturi: Controls Detective — Server running`);
  console.log(`   Port    : ${PORT}`);
  console.log(`   API Key : ${process.env.ANTHROPIC_API_KEY ? "✓ Configured" : "✗ NOT SET — add ANTHROPIC_API_KEY to .env"}`);
  console.log(`   Mode    : ${process.env.NODE_ENV || "development"}\n`);
});
