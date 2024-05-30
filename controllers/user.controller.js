const { log } = require("console");
const User = require("../models/user.model");

const userController = {
  getUsers: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      let { name, email, userId } = req.query;

      if (name === undefined || name === "") {
        name = "";
      }
      if (email === undefined || email === "") {
        email = "";
      }

      // For pagination purpose
      const totalUsersCount = await User.countDocuments({
        name: { $regex: name, $options: "i" },
        email: { $regex: email, $options: "i" },
      });

      // Pagination
      const users = await User.find({
        name: { $regex: name, $options: "i" },
        email: { $regex: email, $options: "i" },
      })
        .limit(limit)
        .skip(limit * (page - 1));
      //Following check
      if (userId) {
        const modifiedUsers = users.map((user) => {
          const userObj = user.toObject();
          userObj.isFollowing = userObj.followers.some(
            (follower) => follower === userId
          );
          return userObj;
        });
        // Remove self if exist
        const result = modifiedUsers.filter((user) => user.userId !== userId);

        res.setHeader("X-Total-Count", totalUsersCount);
        res.status(200).json(result);
      } else {
        res.setHeader("X-Total-Count", totalUsersCount);
        res.status(200).json(users);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  getUserById: async (req, res, next) => {
    try {
      // THIS IS FIND BY userId, NOT BY _id
      const { id } = req.params;
      const { userId } = req.query;
      const user = await User.find({
        userId: id,
      });
      if (userId) {
        const modifiedUser = user.map((user) => {
          const userObj = user.toObject();
          userObj.isFollowing = userObj.followers.some(
            (follower) => follower === userId
          );
          return userObj;
        });
        res.status(200).json(modifiedUser);
      }
      res.status(200).json(user);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  //Follow and unfollow
  toggleFollow: async (req, res, next) => {
    try {
      //If user is already following, remove from followers
      const { userId, followId } = req.body;
      const user = await User.findOne({ userId: userId });
      const followUser = await User.findOne({ userId: followId });
      let isFollowing = false;
      console.log("user id is", userId);
      console.log("follow id is", followId);
      if (!user || !followUser) {
        res.status(404).json("User not found");
      }

      if (user.following.includes(followId)) {
        await User.findOneAndUpdate(
          { userId: userId },
          { $pull: { following: followId } }
        );
        await User.findOneAndUpdate(
          { userId: followId },
          { $pull: { followers: userId } }
        );
      } else {
        await User.findOneAndUpdate(
          { userId: userId },
          { $push: { following: followId } }
        );
        await User.findOneAndUpdate(
          { userId: followId },
          { $push: { followers: userId } }
        );
        isFollowing = true;
      }
      res.status(200).json({ isFollowing: isFollowing });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },

  getUserByEmail: async (req, res, next) => {
    try {
      const { email } = req.params;
      const user = await User.find({
        email: email,
      });
      res.status(200).json(user);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  addUser: async (req, res, next) => {
    try {
      const { userId, email, password, firstName, lastName, bio } = req.body;
      const user = await User.create({
        userId: userId,
        email: email,
        password: password,
        name: firstName + " " + lastName,
        bio: bio,
      });
      res.status(200).json(user);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  deleteUserByEmail: async (req, res, next) => {
    try {
      const email = req.params.email;
      await User.deleteMany({ email: email });
      res.status(200).json("Deleted successfully");
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  deleteUserById: async (req, res, next) => {
    console.log("delete by id");
    try {
      const id = req.params.id;
      await User.deleteMany({ userId: id });
      res.status(200).json("Deleted successfully");
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  editUserById: async (req, res, next) => {
    try {
      const id = req.params.id;
      const user = await User.findOneAndUpdate({ userId: id }, req.body, {
        new: true,
      });
      res.status(200).json("Updated successfully");
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  checkEmail: async (req, res, next) => {
    try {
      const email = req.params.email;
      const user = await User.find({ email: email });
      if (user.length > 0) {
        res.status(200).json("Email already exists");
      } else {
        res.status(200).json("Email is available");
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = userController;
