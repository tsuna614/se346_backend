const express = require("express");
const router = express.Router();

const { uploadMedia } = require("../cloudinary");
const postController = require("../controllers/post.controller");
const { Post } = require("../models/post.model");
const User = require("../models/user.model");
const Group = require("../models/group.model");
router.get("/UserWallPosts/:userId", postController.getUserWallPostsAndUser);
router.post("/postToWall", uploadMedia, postController.postToWall);
router.get("/home", postController.getHomePosts);
router.put("/:id/toggleLike", postController.toggleLike);
router.post("/:id/comment", uploadMedia, postController.commentOnPost);

module.exports = router;
