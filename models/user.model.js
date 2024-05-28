const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    required: false,
    default: "",
  },
  bio: {
    type: String,
    required: false,
  },

  //Array of ObjectIds
  following: {
    type: Array,
    required: false,
  },
  followers: {
    type: Array,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: false,
  },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
