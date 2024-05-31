const express = require("express");
const router = express.Router();

const { uploadMedia } = require("../cloudinary");
const postController = require("../controllers/post.controller");
const { Post } = require("../models/post.model");
const User = require("../models/user.model");
const Group = require("../models/group.model");
router.get("/UserWallPosts/:userId", postController.getUserWallPostsAndUser);
router.get("/home", postController.getHomePosts);
router.get("/:id", postController.getAPost);
router.get("/:id/comments", postController.getComments);
router.delete("/:id", postController.deletePost);
router.delete("/:id/comments/:commentId", postController.deleteComment);
router.post("/postToWall", uploadMedia, postController.postToWall);
router.post("/sharePost", postController.sharePost);
router.post("/:id/comments", uploadMedia, postController.commentOnPost);
router.post("/:id/report", postController.reportPost);
router.put("/:id/toggleLike", postController.toggleLike);

module.exports = router;
