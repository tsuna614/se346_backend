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
router.delete("/:id/comments/:commentId", postController.deleteComment);
router.post("/postToWall", uploadMedia, postController.postToWall);

router.put("/:id/toggleLike", postController.toggleLike);
router.post("/:id/comments", uploadMedia, postController.commentOnPost);
router.get("/cleanDatabase", cleanDatabase);

async function cleanDatabase(req, res) {
  try {
    const posts = await Post.find();
    const deletePromises = posts.map(async (post) => {
      try {
        const user = await User.findOne({ userId: post.posterId });
        if (!user) {
          console.log("Deleting post with non-existent user: ", post);
          await Post.deleteOne({ _id: post._id });
          console.log("Deleted post with non-existent user: ", post);
        } else if (post.groupId) {
          const group = await Group.findOne({ _id: post.groupId });
          if (!group) {
            console.log("Deleting post with non-existent group: ", post);
            await Post.deleteOne({ _id: post._id });
            console.log("Deleted post with non-existent group: ", post);
          }
        }
      } catch (err) {
        console.log("Error processing post: ", err);
      }
    });

    await Promise.all(deletePromises);
    console.log("Database cleaned");
    res.status(200).json({ message: "Database cleaned" });
  } catch (err) {
    console.log("Error finding posts: ", err);
    res.status(500).json({ message: "Error cleaning database" });
  }
}
module.exports = router;
