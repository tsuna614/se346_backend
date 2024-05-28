const express = require("express");
const router = express.Router();

const groupController = require("../controllers/group.controller");
const { uploadMedia } = require("../cloudinary");
router.get("/", groupController.getGroups);
router.get("/:groupId", groupController.getGroup);
router.get("/:groupId/posts", groupController.getGroupPosts);

router.post("/", uploadMedia, groupController.createGroup);
module.exports = router;
