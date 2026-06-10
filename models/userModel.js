const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

async function findUserByUsername(username) {
  return User.findOne({ username });
}

async function findUserByEmail(email) {
  return User.findOne({ email });
}

async function createUser({ username, email, password }) {
  const user = await User.create({ username, email, password });
  return { id: user._id.toString(), username: user.username, email: user.email };
}

module.exports = { User, findUserByUsername, findUserByEmail, createUser };
