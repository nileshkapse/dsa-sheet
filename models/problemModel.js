const mongoose = require("mongoose");

const ProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    required: true,
  },
  topic: { type: String, required: true },
  level: {
    type: String,
    enum: ["Easy", "Medium", "Tough"],
    default: "Medium",
  },
  youtubeLink: { type: String, default: "" },
  leetcodeLink: { type: String, default: "" },
  codeforcesLink: { type: String, default: "" },
  articleLink: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Problem", ProblemSchema);
