require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const chaptersRoutes = require("./routes/chapters");
const progressRoutes = require("./routes/progress");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const port = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dsadb";

// ─── Middleware ───────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// ─── API Routes ───────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/chapters", chaptersRoutes);
app.use("/api/progress", authMiddleware, progressRoutes); // 🔒 protected
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected content available only with a valid JWT.",
    user: req.user,
  });
});

// ─── Serve React build in production ─────────────────────
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "dist")));
  app.get("*", (req, res) => {
    // Only serve index.html for non-API routes
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API route not found" });
    }
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => res.send("Server is running."));
}

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ─── DB + Server Start ────────────────────────────────────
mongoose
  .connect(MONGO_URI) // options deprecated in Mongoose 7+
  .then(() => {
    console.log(`✅ MongoDB connected to ${MONGO_URI}`);
    app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });
