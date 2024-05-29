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
  const postIds = group.postIds;

  console.log("Deleting group: ", group);
  console.log("Deleting posts: ", postIds);

  // Delete all posts in the group
  await Post.deleteMany({ _id: { $in: postIds } });
  // Delete banner image if it exists
  if (group.bannerImgUrl) {
    const publicId = group.bannerImgUrl.split("/").pop().split(".")[0];
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted banner image: ", result);
  }

  next();
});

module.exports = mongoose.model("Group", groupSchema);
