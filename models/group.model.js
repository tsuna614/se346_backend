const mongoose = require("mongoose");
const { Post } = require("./post.model");
const { cloudinary } = require("../cloudinary");

const Schema = mongoose.Schema;

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
  members: {
    type: [
      {
        id: {
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
      },
    ],
    required: false,
    default: [],
  },
  admins: {
    type: [
      {
        id: {
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
      },
    ],
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

// Middleware to handle cleanup when a group is deleted
groupSchema.pre("findOneAndDelete", async function (next) {
  const group = await this.model.findOne(this.getFilter());

  console.log("Deleting group: ", group);
  // Delete all posts in the group
  console.log("Deleting posts with groupId: ", group._id);
  await Post.deleteMany({ groupId: group._id });
  // Delete the group's banner image from Cloudinary
  if (group.bannerImgUrl) {
    await cloudinary.uploader
      .destroy(group.bannerImgUrl.split("/").pop().split(".")[0])
      .then((result) => console.log(result));
  }

  next();
});

module.exports = mongoose.model("Group", groupSchema);
