const express = require("express");
const Chapter = require("../models/chapterModel");
const Problem = require("../models/problemModel");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const chapters = await Chapter.find().lean();
    const problems = await Problem.find().lean();

    const payload = chapters.map((chapter) => {
      const chapterProblems = problems.filter(
        (problem) => problem.chapter.toString() === chapter._id.toString(),
      );

      const topics = chapter.topics.map((topic) => ({
        ...topic,
        problems: chapterProblems
          .filter((problem) => problem.topic === topic.title)
          .map((problem) => ({
            id: problem._id,
            title: problem.title,
            level: problem.level,
            youtubeLink: problem.youtubeLink,
            leetcodeLink: problem.leetcodeLink,
            codeforcesLink: problem.codeforcesLink,
            articleLink: problem.articleLink,
          })),
      }));

      return {
        id: chapter._id,
        title: chapter.title,
        description: chapter.description,
        topics,
      };
    });

    res.json(payload);
  } catch (error) {
    console.error("Failed to fetch chapters:", error);
    res.status(500).json({ message: "Unable to load chapters." });
  }
});

module.exports = router;
