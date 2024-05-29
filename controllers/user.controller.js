const { log } = require("console");
const User = require("../models/user.model");

const userController = {
  getUsers: async (req, res, next) => {
    try {
      //If name or email is empty or undefined, simply make it ""
      //Use user id to check if they are following each other
      //If they do, add one field isFollowing: true , else false
      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      let { name, email, userId } = req.query;

      if (name === undefined || name === "") {
        name = "";
      }
      if (email === undefined || email === "") {
        email = "";
      }

      const users = await User.find({
        name: { $regex: name, $options: "i" },
        email: { $regex: email, $options: "i" },
      })
        .limit(limit)
        .skip(limit * (page - 1));

      if (userId) {
        const modifiedUsers = users.map((user) => {
          const userObj = user.toObject();
          userObj.isFollowing = userObj.followers.some(
            (follower) => follower === userId
          );
          return userObj;
        });
        //Remove self if exist
        const result = modifiedUsers.filter((user) => user.userId !== userId);

        res.status(200).json(result);
      } else {
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
      const user = await User.find({
        userId: id,
      });
      console.log(user);
      res.status(200).json(user);
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
