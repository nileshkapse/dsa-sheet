const fs = require("fs").promises;
const path = require("path");

const dataFile = path.join(__dirname, "..", "data", "users.json");

async function readUsers() {
  try {
    const json = await fs.readFile(dataFile, "utf8");
    return JSON.parse(json || "[]");
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(users, null, 2), "utf8");
}

async function findUserByUsername(username) {
  const users = await readUsers();
  return users.find((user) => user.username === username);
}

async function findUserByEmail(email) {
  const users = await readUsers();
  return users.find((user) => user.email === email);
}

async function createUser(user) {
  const users = await readUsers();
  users.push(user);
  await writeUsers(users);
  return user;
}

module.exports = {
  readUsers,
  findUserByUsername,
  findUserByEmail,
  createUser,
};
