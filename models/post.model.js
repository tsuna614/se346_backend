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

commentSchema.pre("remove", async function (next) {
  try {
    console.log("PRE: removing comment from posts");
    await mongoose
      .model("Post")
      .updateMany({}, { $pull: { comments: { _id: this._id } } });
    console.log("PRE: comment removed from posts");
    next();
  } catch (err) {
    next(err);
  }
});
postSchema.pre("remove", async function (next) {
  try {
    // Remove all comments associated with the post
    console.log("PRE: removing comments associated with the post");
    await mongoose
      .model("Comment")
      .deleteMany({ _id: { $in: this.comments.map((c) => c._id) } });
    console.log("PRE: comments removed");
    next();
  } catch (err) {
    next(err);
  }
});
const Comment = mongoose.model("Comment", commentSchema);
const Post = mongoose.model("Post", postSchema);
module.exports = { Comment, Post };
