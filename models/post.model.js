const mongoose = require("mongoose");

// Define comment schema
const commentSchema = mongoose.Schema({
  commenterId: {
    type: String,
    required: true,
  },

  commenterName: {
    type: String,
    required: true,
  },
  commenterAvatarUrl: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  mediaUrl: {
    type: String,
    required: false,
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

// Define post schema
const postSchema = mongoose.Schema({
  posterId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },

  posterAvatarUrl: {
    type: String,
    required: false,
    default: "",
  },
  mediaUrl: {
    type: String,
    required: false,
  },
  likes: {
    type: [String],
    required: false,
    default: [],
  },
  comments: {
    type: [commentSchema],
    required: false,
    default: [],
  },
  shares: {
    type: [String],
    required: false,
    default: [],
  },

  groupId: {
    type: String,
    required: false,
  },
  sharePostId: {
    type: String,
    required: false,
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

//Post: if a post is shared, the sharePostId field will contain the id of the original post
//Group: if a post is posted in a group, the groupId field will contain the id of the group

postSchema.pre("findOneAndDelete", async function (next) {
  const post = this._conditions._id;
  const postToDelete = await Post.findOne({ _id: post });

  if (postToDelete.mediaUrl) {
    const publicId = postToDelete.mediaUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);
  }
  next();
});
postSchema.pre("deleteMany", async function (next) {
  const posts = await this.model.find(this.getFilter());
  posts.forEach(async (post) => {
    if (post.mediaUrl) {
      const publicId = post.mediaUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
  });
  next();
});
const Comment = mongoose.model("Comment", commentSchema);
const Post = mongoose.model("Post", postSchema);
module.exports = { Comment, Post };
