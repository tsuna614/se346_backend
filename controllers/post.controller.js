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
      const user = await User.findOne({ userId: userId });
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
      const user = await User.findOne({ userId: otherUserId });
      //Attach userLiked, userIsPoster field to each post
      const modifiedPosts = posts.map((post) => {
        const postObj = post.toObject();
        postObj.userLiked = post.likes.some((like) => like === userId);
        postObj.userIsPoster = post.posterId === userId;

        return postObj;
      });

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
      const { content, userId } = req.body;
      const postId = req.params.id;
      const commenter = await User.findOne({ userId: userId });
      const media = req.file;
      let mediaUrl = "";
      if (media) {
        const result = await cloudinary.uploader.upload(media.path);
        mediaUrl = result.secure_url;
      } else {
        mediaUrl = "";
      }
      if (!commenter) {
        res.status(404).json("Commenter not found");
      }
      if (!content) {
        res.status(400).json("Content is required");
      }
      if (!postId || postId === "" || postId === null) {
        res.status(400).json("PostId is required");
      }
      const post = await Post.findOne({ _id: postId });
      if (!post) {
        res.status(404).json("Post not found");
      }

      //Push comment to post without saving it
      const comment = new Comment({
        postId: postId,
        content: content,
        commenterId: userId,
        commenterName: commenter.name,
        commenterAvatarUrl: commenter.avatarUrl,
        mediaUrl: mediaUrl === "" ? null : mediaUrl,
      });
      post.comments.push(comment);
      await post.save();
      console.log("Comment created: ", comment);
      console.log("Post updated with comment: ", postId);
      res.status(200).json(comment);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  getAPost: async (req, res, next) => {
    try {
      const postId = req.params.id;
      const { userId } = req.query;
      const post = await Post.findOne({ _id: postId });
      if (!post) {
        res.status(404).json("Post not found");
      }
      const modifiedPost = post.toObject();
      modifiedPost.userLiked = post.likes.some((like) => like === userId);
      modifiedPost.userIsPoster = post.posterId === userId;

      const comments = post.comments;
      const modifiedComments = comments.map((comment) => {
        const commentObj = comment.toObject();
        commentObj.isCommenter = comment.commenterId === userId;

        return commentObj;
      });

      modifiedPost.comments = modifiedComments;
      res.status(200).json(modifiedPost);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },

  getComments: async (req, res, next) => {
    try {
      const postId = req.params.id;
      const { userId } = req.query;

      const post = await Post.findOne({ _id: postId });
      if (!post) {
        res.status(404).json("Post not found");
      }
      const comments = post.comments;

      const modifiedComments = comments.map((comment) => {
        const commentObj = comment.toObject();
        commentObj.isCommenter = comment.commenterId === userId;

        return commentObj;
      });

      res.status(200).json(modifiedComments);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  deleteComment: async (req, res, next) => {
    try {
      const { id, commentId } = req.params;
      const { userId } = req.body;
      const post = await Post.findOne({ _id: id });
      if (!post) {
        res.status(404).json("Post not found");
      }
      //Remove from post
      const commentIndex = post.comments.findIndex(
        (comment) => comment._id.toString() === commentId
      );
      if (commentIndex === -1) {
        res.status(404).json("Comment not found");
      }
      post.comments.splice(commentIndex, 1);
      await post.save();

      res.status(200).json("Comment deleted");
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  deletePost: async (req, res, next) => {
    try {
      const postId = req.params.id;
      const post = await Post.findOne({ _id: postId });
      if (!post) {
        res.status(404).json("Post not found");
      }
      //Comments are contained in the post
      await post.deleteOne();
      res.status(200).json("Post deleted");
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
      let following = user.following;
      if (!following) {
        following = [];
      }
      //groupId in post is only a string so we this result to be a string
      const groupUserIsIn = await Group.find({
        members: { $elemMatch: { id: userId } },
      });
      let groupIds = groupUserIsIn.map((group) => group._id.toString());
      //Get all posts from groups user is in
      const groupPosts = await Post.find({ groupId: { $in: groupIds } });
      //Get all posts from users user is following
      const userPosts = await Post.find({ posterId: { $in: following } });
      const posts = groupPosts.concat(userPosts);

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
  sharePost: async (req, res, next) => {
    try {
      const { userId, postId } = req.body;

      const post = await Post.findOne({ _id: postId });
      const user = await User.findOne({ userId: userId });
      if (!user) {
        res.status(404).json("User not found");
      }
      if (!post) {
        res.status(404).json("Post not found");
      }
      const sharedPost = await Post.create({
        content: " ",
        posterAvatarUrl: user.avatarUrl,
        name: user.name,
        posterId: userId,
        mediaUrl: "", //No media for shared post
        sharePostId: postId, //Used to query the original post
      });
      console.log("Post shared: ", sharedPost);
      res.status(200).json(sharedPost);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = postController;
