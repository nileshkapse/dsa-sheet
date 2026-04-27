const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
});

const ChapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  topics: [TopicSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chapter", ChapterSchema);
