require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const rateLimit = require("express-rate-limit");
const { createClient } = require("@supabase/supabase-js");
const { ClerkExpressRequireAuth, ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");

// ── Free tier rate limiting — 10 questions per IP per 24hrs ──
const FREE_LIMIT = 30; // 30 questions per session per IP (24hr reset)
const FREE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const freeUsage = new Map(); // ip -> { count, resetAt }

function checkFreeLimit(ip) {
  const now = Date.now();
  const entry = freeUsage.get(ip);
  if (!entry || now > entry.resetAt) {
    freeUsage.set(ip, { count: 1, resetAt: now + FREE_WINDOW_MS });
    return { allowed: true, remaining: FREE_LIMIT - 1, resetAt: now + FREE_WINDOW_MS };
  }
  if (entry.count >= FREE_LIMIT) {
    const hoursLeft = Math.ceil((entry.resetAt - now) / (1000 * 60 * 60));
    return { allowed: false, remaining: 0, resetAt: entry.resetAt, hoursLeft };
  }
  entry.count++;
  return { allowed: true, remaining: FREE_LIMIT - entry.count, resetAt: entry.resetAt };
}

// Clean up expired entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of freeUsage.entries()) {
    if (now > entry.resetAt) freeUsage.delete(ip);
  }
}, 60 * 60 * 1000);

const app = express();
const PORT = process.env.PORT || 3001;

// ── Supabase client (service role — bypasses RLS) ─────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Middleware ─────────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

const limiter = rateLimit({
  windowMs: 60 * 1000, max: 60,
  message: { error: "Too many requests. Please wait and try again." },
  standardHeaders: true, legacyHeaders: false,
});
app.use("/api/", limiter);

// ── Health check ───────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok", name: "Ace Venturi: Controls Detective", version: "2.0.0",
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
    supabaseConfigured: !!process.env.SUPABASE_URL,
    clerkConfigured: !!process.env.CLERK_SECRET_KEY,
  });
});

// ── Helper: upsert user in Supabase ───────────────────────────
async function ensureUser(clerkUserId, email, fullName) {
  const { data, error } = await supabase
    .from("users")
    .upsert({ id: clerkUserId, email, full_name: fullName }, { onConflict: "id" })
    .select().single();
  if (error) console.error("ensureUser error:", error);
  return data;
}

// ══════════════════════════════════════════════════════════════
// AI CHAT PROXY — supports both signed-in and free users
// ══════════════════════════════════════════════════════════════
app.post("/api/chat", ClerkExpressWithAuth(), async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured." });

  const isSignedIn = !!req.auth?.userId;

  // Free users: enforce 10 questions per 24hrs
  if (!isSignedIn) {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    const check = checkFreeLimit(ip);
    if (!check.allowed) {
      return res.status(429).json({
        error: `Free limit reached. You've used all ${FREE_LIMIT} free questions for this session. Resets in ${check.hoursLeft} hour${check.hoursLeft === 1 ? "" : "s"}.`,
        freeLimit: true,
        resetAt: check.resetAt,
        hoursLeft: check.hoursLeft,
      });
    }
    // Include remaining count in response headers
    res.setHeader("X-Free-Remaining", check.remaining);
    res.setHeader("X-Free-Reset", check.resetAt);
  }

  try {
    const { messages, system, tools, max_tokens, model } = req.body;
    if (!messages || !Array.isArray(messages))
      return res.status(400).json({ error: "Invalid request: messages array required." });
    const payload = { model: model || "claude-sonnet-4-6", max_tokens: max_tokens || 8000, system, messages };
    if (tools && tools.length > 0) payload.tools = tools;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "API error" });
    res.json(data);
  } catch (err) {
    console.error("Chat proxy error:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ── User sync ─────────────────────────────────────────────────
app.post("/api/user/sync", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { userId, email, fullName } = req.body;
    await ensureUser(userId, email, fullName);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Free tier status (no auth required) ──────────────────────
app.get("/api/free-status", (req, res) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = freeUsage.get(ip);
  if (!entry || now > entry.resetAt) {
    return res.json({ used: 0, remaining: FREE_LIMIT, limit: FREE_LIMIT, resetAt: now + FREE_WINDOW_MS });
  }
  res.json({ used: entry.count, remaining: Math.max(0, FREE_LIMIT - entry.count), limit: FREE_LIMIT, resetAt: entry.resetAt });
});

// ══════════════════════════════════════════════════════════════
// CHAT ROUTES
// ══════════════════════════════════════════════════════════════
app.get("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { data, error } = await supabase.from("chats")
      .select("id, title, created_at, updated_at")
      .eq("user_id", req.auth.userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { data, error } = await supabase.from("chats")
      .insert({ user_id: req.auth.userId, title: req.body.title || "New chat" })
      .select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { data, error } = await supabase.from("chats")
      .update({ title: req.body.title })
      .eq("id", req.params.id).eq("user_id", req.auth.userId)
      .select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { error } = await supabase.from("chats")
      .delete().eq("id", req.params.id).eq("user_id", req.auth.userId);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/chats/:id/messages", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { data: chat, error: chatErr } = await supabase.from("chats")
      .select("id").eq("id", req.params.id).eq("user_id", req.auth.userId).single();
    if (chatErr || !chat) return res.status(404).json({ error: "Chat not found" });
    const { data, error } = await supabase.from("messages")
      .select("id, role, content, images, created_at")
      .eq("chat_id", req.params.id)
      .order("created_at", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/chats/:id/messages", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { role, content, images } = req.body;
    await supabase.from("chats")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", req.params.id).eq("user_id", req.auth.userId);
    const { data, error } = await supabase.from("messages")
      .insert({ chat_id: req.params.id, user_id: req.auth.userId, role, content, images: images || null })
      .select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// ALARM LOG ROUTES
// ══════════════════════════════════════════════════════════════
app.get("/api/alarms", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { data, error } = await supabase.from("alarm_logs").select("*")
      .eq("user_id", req.auth.userId).order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/alarms", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { data, error } = await supabase.from("alarm_logs")
      .insert({ ...req.body, user_id: req.auth.userId }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/alarms/:id", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { data, error } = await supabase.from("alarm_logs")
      .update(req.body).eq("id", req.params.id).eq("user_id", req.auth.userId).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/alarms/:id", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    await supabase.from("alarm_logs").delete().eq("id", req.params.id).eq("user_id", req.auth.userId);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════
// EQUIPMENT ROUTES
// ══════════════════════════════════════════════════════════════
app.get("/api/equipment", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { data, error } = await supabase.from("equipment").select("*")
      .eq("user_id", req.auth.userId).order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/equipment", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { data, error } = await supabase.from("equipment")
      .insert({ ...req.body, user_id: req.auth.userId }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch("/api/equipment/:id", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { data, error } = await supabase.from("equipment")
      .update(req.body).eq("id", req.params.id).eq("user_id", req.auth.userId).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/equipment/:id", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    await supabase.from("equipment").delete().eq("id", req.params.id).eq("user_id", req.auth.userId);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Serve React build in production ───────────────────────────
if (process.env.NODE_ENV === "production") {
  const path = require("path");
  app.use(express.static(path.join(__dirname, "../build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
  });
}

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🕵️  Ace Venturi: Controls Detective v2.0`);
  console.log(`   Port      : ${PORT}`);
  console.log(`   Auth      : ${process.env.CLERK_SECRET_KEY ? "✓ Clerk" : "✗ CLERK_SECRET_KEY missing"}`);
  console.log(`   Database  : ${process.env.SUPABASE_URL ? "✓ Supabase" : "✗ SUPABASE_URL missing"}`);
  console.log(`   API Key   : ${process.env.ANTHROPIC_API_KEY ? "✓ Set" : "✗ NOT SET"}`);
  console.log(`   Mode      : ${process.env.NODE_ENV || "development"}\n`);
});
