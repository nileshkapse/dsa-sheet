const express = require("express");
const Progress = require("../models/progressModel");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/progress - Get all progress for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.find({
      userId: req.user.id,
      completed: true,
    }).select("problemId");

    const completedProblemIds = progress.map((p) => p.problemId);
    res.json({ completedProblemIds });
  } catch (error) {
    console.error("Failed to fetch progress:", error);
    res.status(500).json({ message: "Unable to load progress." });
  }
});

// PATCH /api/progress/:problemId - Toggle progress for a problem
router.patch("/:problemId", authMiddleware, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      return res.status(400).json({ message: "Completed must be a boolean." });
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user.id, problemId },
      { completed },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    res.json({
      problemId,
      completed: progress.completed,
    });
  } catch (error) {
    console.error("Failed to update progress:", error);
    res.status(500).json({ message: "Unable to update progress." });
  }
});

module.exports = router;
