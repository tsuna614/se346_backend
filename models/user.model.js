const mongoose = require("mongoose");
const { Post } = require("./post.model");
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
  profileBackground: {
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
  friends: {
    type: Array,
    required: false,
  },
});

//After change or save, update updatedAt
//Get current avatarUrl and update it on post posterAvatarUrl with the same userId
//Also change name
userSchema.post("findOneAndUpdate", async function (doc) {
  const userId = doc.userId;
  const avatarUrl = doc.avatarUrl;
  console.log("Updating posts with new avatarUrl: ", avatarUrl);
  await Post.updateMany(
    { posterId: userId },
    { $set: { posterAvatarUrl: avatarUrl, name: doc.name } }
  );
});

const User = mongoose.model("users", userSchema);

module.exports = User;
