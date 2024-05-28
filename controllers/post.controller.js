const { log } = require("console");
const User = require("../models/user.model");
const { Post, Comment } = require("../models/post.model");
const { upload, cloudinary } = require("../cloudinary");

//Generally receive a content, and file in multer as well as userId

//Post to wall (normal post, no groupid)
//Post to group (groupid) (not implemented yet)
//Share post (sharePostId) (not implemented yet)

//Get all posts for a user wall
//Get all posts for a group (not implemented yet)
//Get home posts for a user (posts from friends and groups the user is in) (not implemented yet)

const postController = {
  getUserWallPostsAndUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      //Sort by date created, newest first
      const posts = await Post.find({ posterId: userId }).sort({
        createdAt: -1,
      });
      const user = await User.findOne({ userId: userId });
      res.status(200).json({ user, posts });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  //Same thing, check if is following
  getOtherUserWallPostsAndUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const posts = await Post.find({ userId: userId });
      res.status(200).json(posts);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  postToWall: async (req, res, next) => {
    try {
      const { content, userId } = req.body;

      const poster = await User.findOne({ userId: userId });

      const posterAvatarUrl = poster.avatarUrl;
      const media = req.file;
      let mediaUrl = "";
      if (media) {
        const result = await cloudinary.uploader.upload(media.path);
        mediaUrl = result.secure_url;
      } else {
        mediaUrl = "";
      }
      const post = await Post.create({
        content: content,
        posterAvatarUrl: posterAvatarUrl,
        name: poster.name,
        posterId: userId,
        mediaUrl: mediaUrl === "" ? null : mediaUrl,
      });
      console.log("Post created: ", post);
      res.status(200).json(post);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = postController;
