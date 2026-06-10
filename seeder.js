require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Chapter = require("./models/chapterModel");
const Problem = require("./models/problemModel");
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dsadb";

const chaptersData = [
  {
    title: "Arrays",
    description: "Foundational array techniques for DSA problems.",
    topics: [
      { title: "Basic Arrays",   description: "Core operations, traversal, and indexing." },
      { title: "Two Pointers",   description: "Sliding window and paired-index strategies." },
    ],
  },
  {
    title: "Trees",
    description: "Hierarchical tree structures and traversal patterns.",
    topics: [
      { title: "Binary Trees", description: "Traversal, height, and recursive patterns." },
      { title: "BSTs",         description: "Search trees, insertion, and order statistics." },
    ],
  },
  {
    title: "Dynamic Programming",
    description: "Memoization and table-filling strategies for optimal substructure problems.",
    topics: [
      { title: "Knapsack",     description: "Subset sums and value maximization." },
      { title: "Sequence DP",  description: "Fibonacci, LIS, and edit distance problems." },
    ],
  },
  {
    title: "Graphs",
    description: "Graph traversal, shortest paths, and connectivity algorithms.",
    topics: [
      { title: "Traversal",     description: "DFS, BFS and component discovery." },
      { title: "Shortest Path", description: "Dijkstra, Bellman-Ford, and BFS for weighted graphs." },
    ],
  },
];

const problemsData = [
  { title: "Two Sum",                       chapterTitle: "Arrays",               topic: "Basic Arrays",  level: "Easy",   leetcodeLink: "https://leetcode.com/problems/two-sum/",                          youtubeLink: "https://www.youtube.com/watch?v=KLlXCFG5TnA", articleLink: "https://www.geeksforgeeks.org/two-sum/" },
  { title: "Container With Most Water",     chapterTitle: "Arrays",               topic: "Two Pointers",  level: "Medium", leetcodeLink: "https://leetcode.com/problems/container-with-most-water/",        youtubeLink: "https://www.youtube.com/watch?v=4ekgLorlK98", articleLink: "https://www.geeksforgeeks.org/container-with-most-water/" },
  { title: "Binary Tree Inorder Traversal", chapterTitle: "Trees",                topic: "Binary Trees",  level: "Easy",   leetcodeLink: "https://leetcode.com/problems/binary-tree-inorder-traversal/",   youtubeLink: "https://www.youtube.com/watch?v=5dySuyZf9Qg", articleLink: "https://www.geeksforgeeks.org/inorder-traversal-of-binary-tree/" },
  { title: "Validate Binary Search Tree",   chapterTitle: "Trees",                topic: "BSTs",          level: "Medium", leetcodeLink: "https://leetcode.com/problems/validate-binary-search-tree/",     youtubeLink: "https://www.youtube.com/watch?v=s6ATEkipzow", articleLink: "https://www.geeksforgeeks.org/validate-binary-search-tree/" },
  { title: "Climbing Stairs",               chapterTitle: "Dynamic Programming",  topic: "Sequence DP",   level: "Easy",   leetcodeLink: "https://leetcode.com/problems/climbing-stairs/",                  youtubeLink: "https://www.youtube.com/watch?v=Y0lT9Fck7qI", articleLink: "https://www.geeksforgeeks.org/count-ways-reach-nth-stair/" },
  { title: "0/1 Knapsack Problem",          chapterTitle: "Dynamic Programming",  topic: "Knapsack",      level: "Medium", leetcodeLink: "https://leetcode.com/problems/partition-equal-subset-sum/",       youtubeLink: "https://www.youtube.com/watch?v=8LusJS5-AGo", articleLink: "https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/" },
  { title: "Number of Islands",             chapterTitle: "Graphs",               topic: "Traversal",     level: "Medium", leetcodeLink: "https://leetcode.com/problems/number-of-islands/",                youtubeLink: "https://www.youtube.com/watch?v=o8S2bO3pmO4", articleLink: "https://www.geeksforgeeks.org/find-number-of-islands/" },
  { title: "Network Delay Time",            chapterTitle: "Graphs",               topic: "Shortest Path", level: "Medium", leetcodeLink: "https://leetcode.com/problems/network-delay-time/",               youtubeLink: "https://www.youtube.com/watch?v=EaphyqKU4PQ", articleLink: "https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/" },
  { title: "Word Ladder",                   chapterTitle: "Graphs",               topic: "Traversal",     level: "Tough",  leetcodeLink: "https://leetcode.com/problems/word-ladder/",                      youtubeLink: "https://www.youtube.com/watch?v=h9iTnkgv05E", articleLink: "https://www.geeksforgeeks.org/word-ladder-length-of-shortest-path-to-reach-a-target-word/" },
];

const usersData = [
  { username: "admin",   email: "admin@test.com",   password: "admin123"  },
  { username: "nilesh",  email: "nilesh@test.com",  password: "nilesh123" },
  { username: "alice",   email: "alice@test.com",   password: "alice123"  },
  { username: "bob",     email: "bob@test.com",     password: "bob123"    },
];

async function seedUsers() {
  await User.deleteMany({});
  const docs = await Promise.all(
    usersData.map(async (u) => ({
      username: u.username,
      email:    u.email,
      password: await bcrypt.hash(u.password, 10),
    }))
  );
  await User.insertMany(docs);
  console.log("✅ Seeded users:");
  usersData.forEach((u) => console.log(`   ${u.username.padEnd(10)} / ${u.password}`));
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log(`✅ MongoDB connected to ${MONGO_URI}`);

  await seedUsers();

  await Promise.all([Chapter.deleteMany({}), Problem.deleteMany({})]);
  console.log("🗑  Cleared chapters and problems");

  const createdChapters = await Chapter.insertMany(chaptersData);
  const chapterMap = createdChapters.reduce((map, ch) => {
    map[ch.title] = ch._id;
    return map;
  }, {});

  const problemDocs = problemsData.map((p) => ({
    title: p.title,
    chapter: chapterMap[p.chapterTitle],
    topic: p.topic,
    level: p.level,
    youtubeLink: p.youtubeLink,
    leetcodeLink: p.leetcodeLink,
    articleLink: p.articleLink,
  }));

  await Problem.insertMany(problemDocs);
  console.log("✅ Seeded 4 chapters and 9 problems");

  await mongoose.disconnect();
  console.log("🔌 MongoDB disconnected");
}

seed().catch((err) => {
  console.error("❌ Seeder error:", err);
  process.exit(1);
});
