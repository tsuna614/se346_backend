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
  try {
    const postToDelete = await Post.findOne({ _id: post });
    if (!postToDelete) {
      throw new Error("Post not found");
    }
    // Delete associated comments
    await Comment.deleteMany({ _id: { $in: postToDelete.comments } });
    // Delete associated media
    if (postToDelete.mediaUrl) {
      const publicId = postToDelete.mediaUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    next();
  } catch (err) {
    next(err);
  }
});
postSchema.pre("findOneAndDelete", async function (next) {
  const post = this._conditions._id;
  try {
    const postToDelete = await Post.findOne({ _id: post });
    if (!postToDelete) {
      throw new Error("Post not found");
    }
    // Delete associated comments
    await Comment.deleteMany({ _id: { $in: postToDelete.comments } });
    // Delete associated media
    if (postToDelete.mediaUrl) {
      const publicId = postToDelete.mediaUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    next();
  } catch (err) {
    next(err);
  }
});
postSchema.pre("deleteMany", async function (next) {
  const posts = this._conditions;
  try {
    const postsToDelete = await Post.find(posts);
    if (!postsToDelete) {
      throw new Error("Posts not found");
    }
    const deletePromises = postsToDelete.map(async (post) => {
      // Delete associated comments
      await Comment.deleteMany({ _id: { $in: post.comments } });
      // Delete associated media
      if (post.mediaUrl) {
        const publicId = post.mediaUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
    });
    await Promise.all(deletePromises);
    next();
  } catch (err) {
    next(err);
  }
});
const Comment = mongoose.model("Comment", commentSchema);
const Post = mongoose.model("Post", postSchema);
module.exports = { Comment, Post };
