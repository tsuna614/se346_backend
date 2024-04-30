const { log } = require("console");
const User = require("../models/user.model");

const userController = {
  getAllUsers: async (req, res, next) => {
    try {
      const users = await User.find({});
      res.status(200).json(users);
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
      const user = await User.create(req.body);
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
