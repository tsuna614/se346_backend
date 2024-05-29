const express = require("express");
const router = express.Router();

const groupController = require("../controllers/group.controller");
const { uploadMedia } = require("../cloudinary");

router.get("/", groupController.getGroups);
router.get("/:groupId", groupController.getGroup);
router.get("/:groupId/name", groupController.getGroupName);
router.post("/:groupId/members", groupController.joinGroup);
router.delete("/:groupId/members", groupController.leaveGroup);
router.post("/:groupId/posts", uploadMedia, groupController.postToGroup);
router.get("/:groupId/posts", groupController.getGroupPosts);

router.post("/", uploadMedia, groupController.createGroup);
module.exports = router;
