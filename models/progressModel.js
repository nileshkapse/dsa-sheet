const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    problemId: {
      type: String,
      required: true,
      index: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure one progress record per user-problem pair
ProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", ProgressSchema);
