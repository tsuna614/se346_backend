const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const postController = require("../controllers/post.controller");
// get all users
router.get("/", userController.getUsers);

// find user by id
router.get("/:id", userController.getUserById);

//toggle user follow between current user and target user
router.put("/toggleFollow/", userController.toggleFollow);

// find user by email
router.get("/getUserByEmail/:email", userController.getUserByEmail);

// add 1 user
router.post("/addUser", userController.addUser);

// delete user by email
router.delete("/deleteUserByEmail/:email", userController.deleteUserByEmail);

// delete user by id
router.delete("/deleteUserById/:id", userController.deleteUserById);

// edit user by id
router.put("/editUserById/:id", userController.editUserById);

// check if email already exists
router.get("/checkEmail/:email", userController.checkEmail);

module.exports = router;
