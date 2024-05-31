const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const postController = require("../controllers/post.controller");
const { uploadMedia } = require("../cloudinary");
// get all users
router.get("/", userController.getUsers);

// find user by id
router.get("/checkEmail/:email", userController.checkEmail);
router.get("/getUserByEmail/:email", userController.getUserByEmail);
router.get("/:id", userController.getUserById);
router.get("/:id/following", userController.getFollowing);
router.get("/:id/groups", userController.getGroups);
//toggle user follow between current user and target user
router.put("/toggleFollow/", userController.toggleFollow);
router.put("/editUserById/:id", userController.editUserById);
router.put("/changeName", userController.changeName);
router.put("/changeBio", userController.changeBio);
router.put("/changeAvatar", uploadMedia, userController.changeAvatar);
router.put(
  "/changeProfileBackground",
  uploadMedia,
  userController.changeProfileBackground
);
// find user by email

// add 1 user
router.post("/addUser", userController.addUser);

// delete user by email
router.delete("/deleteUserByEmail/:email", userController.deleteUserByEmail);

// delete user by id
router.delete("/deleteUserById/:id", userController.deleteUserById);

// edit user by id

// check if email already exists

module.exports = router;
