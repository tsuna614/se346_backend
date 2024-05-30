const { log } = require("console");
const User = require("../models/user.model");
const { Post, Comment } = require("../models/post.model");
const { upload, cloudinary } = require("../cloudinary");
const Group = require("../models/group.model");
//Generally receive a content, and file in multer as well as userId

//Post to wall (normal post, no groupid)

//Share post (sharePostId) (not implemented yet)

//Get all posts for a user wall
//Get home posts for a user (posts from friends and groups the user is in) (not implemented yet)

const postController = {
  //For current user
  getUserWallPostsAndUser: async (req, res, next) => {
    try {
      //Random hack , do not change
      const { userId } = req.params;
      const { otherUserId } = req.query;
      //If otherUserId is provided, call getOtherUserWallPostsAndUser
      if (otherUserId) {
        return module.exports.getOtherUserWallPostsAndUser(req, res, next);
      }

      //Sort by date created, newest first
      //Remove post that has groupId
      const posts = await Post.find({ posterId: userId, groupId: null }).sort({
        createdAt: -1,
      });
      //Attach userLiked, userIsPoster field to each post
      const modifiedPosts = posts.map((post) => {
        const postObj = post.toObject();
        postObj.userLiked = post.likes.some((like) => like === userId);
        postObj.userIsPoster = post.posterId === userId;
        return postObj;
      });
      const user = await User.findOne({ userId: userId });
      res.status(200).json({ user, posts: modifiedPosts });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  //Same thing, check if is following
  getOtherUserWallPostsAndUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { otherUserId } = req.query;
      console.log("Other user id: ", otherUserId);
      //Sort by date created, newest first
      //Remove post that has groupId
      const posts = await Post.find({
        posterId: otherUserId,
        groupId: null,
      }).sort({
        createdAt: -1,
      });
      //Attach userLiked, userIsPoster field to each post
      const modifiedPosts = posts.map((post) => {
        const postObj = post.toObject();
        postObj.userLiked = post.likes.some((like) => like === userId);
        postObj.userIsPoster = post.posterId === userId;
        return postObj;
      });
      const user = await User.findOne({ userId: otherUserId });

      let modifiedUser = user.toObject();
      modifiedUser.isFollowing = user.followers.some(
        (follower) => follower === userId
      );

      res.status(200).json({ user: modifiedUser, posts: modifiedPosts });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  toggleLike: async (req, res, next) => {
    try {
      const { userId } = req.body;

      const postId = req.params.id;
      const post = await Post.findOne({ _id: postId });

      if (!post) {
        res.status(404).json("Post not found");
      }
      let isLiked = false;

      if (post.likes.includes(userId)) {
        await Post.findOneAndUpdate(
          { _id: postId },
          { $pull: { likes: userId } }
        );
      } else {
        await Post.findOneAndUpdate(
          { _id: postId },
          { $push: { likes: userId } }
        );
        isLiked = true;
      }
      console.log("Post liked: ", isLiked);
      res.status(200).json({ isLiked: isLiked });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  commentOnPost: async (req, res, next) => {
    try {
      const { content, userId, postId } = req.body;
      const commenter = await User.findOne({ userId: userId });
      const media = req.file;
      let mediaUrl = "";
      if (media) {
        const result = await cloudinary.uploader.upload(media.path);
        mediaUrl = result.secure_url;
      } else {
        mediaUrl = "";
      }
      const comment = await Comment.create({
        content: content,
        commenterAvatarUrl: commenter.avatarUrl,
        commenterName: commenter.name,
        commenterId: userId,
        mediaUrl: mediaUrl === "" ? null : mediaUrl,
      });
      await Post.findOneAndUpdate(
        { _id: postId },
        { $push: { comments: comment } }
      );
      res.status(200).json(comment);
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
  //Get posts from user they follow
  //Get posts from groups they are in
  getHomePosts: async (req, res, next) => {
    try {
      const { userId } = req.query;
      const user = await User.findOne({ userId: userId });
      const following = user.following;
      const groups = await Group.find({
        members: { $elemMatch: { id: userId } },
      });
      const posts = await Post.find({
        $or: [{ posterId: { $in: following } }, { groupId: { $in: groups } }],
      }).sort({
        createdAt: -1,
      });
      const modifiedPosts = posts.map((post) => {
        const postObj = post.toObject();
        postObj.userLiked = post.likes.some((like) => like === userId);
        postObj.userIsPoster = post.posterId === userId;
        return postObj;
      });
      res.status(200).json(modifiedPosts);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = postController;
