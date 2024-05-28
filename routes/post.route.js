const express = require("express");
const router = express.Router();

const { uploadMedia } = require("../cloudinary");
const postController = require("../controllers/post.controller");

router.get("/UserWallPosts/:userId", postController.getUserWallPostsAndUser);
router.post("/postToWall", uploadMedia, postController.postToWall);

module.exports = router;
