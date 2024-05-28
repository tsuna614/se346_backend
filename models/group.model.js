const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Post = require("./post.model");
const { cloudinary } = require("../cloudinary");
// Schema for Group Member
const groupMemberSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
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
});

// Main Group Schema
const groupSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  bannerImgUrl: {
    type: String,
    required: false,
  },
  postIds: {
    type: [String],
    required: false,
    default: [],
  },
  members: {
    type: [groupMemberSchema],
    required: false,
    default: [],
  },
  admins: {
    type: [groupMemberSchema],
    required: false,
    default: [],
  },

  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});
//Post: post in group can't be shared
//If a group is deleted, all posts in the group should also be deleted and remove image from cloudinary

groupSchema.pre("deleteOne", async function (next) {
  const group = this;
  await Post.deleteMany({ groupId: group._id });
  if (group.bannerImgUrl) {
    const public_id = group.bannerImgUrl.match(/\/upload\/v\d+\/(.+)\./)[1];
    await cloudinary.uploader.destroy(public_id);
  }
  next();
});

module.exports = mongoose.model("Group", groupSchema);
