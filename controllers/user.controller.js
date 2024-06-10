const { log } = require("console");
const User = require("../models/user.model");
const Group = require("../models/group.model");
const { cloudinary } = require("../cloudinary");
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
  getFollowing: async (req, res, next) => {
    try {
      const userId = req.params.id;
      console.log("userId", userId);
      const user = await User.findOne({ userId: userId });
      const following = user.following;
      const users = await User.find({ userId: { $in: following } });
      const modifiedUsers = users.map((user) => {
        const userObj = user.toObject();
        userObj.isFollowing = true;
        return userObj;
      });
      res.status(200).json(modifiedUsers);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  getGroups: async (req, res, next) => {
    try {
      const userId = req.params.id;
      console.log("userId for groups", userId);
      const user = await User.findOne({ userId: userId });
      if (!user) {
        res.status(404).json("User not found");
      }
      //Find groups that user is member of
      const groups = await Group.find({
        members: { $elemMatch: { id: userId } },
      });
      const modifiedGroups = groups.map((group) => {
        const groupObj = group.toObject();
        groupObj.isMember = true;
        return groupObj;
      });
      res.status(200).json(modifiedGroups);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  changeAvatar: async (req, res, next) => {
    try {
      const { userId } = req.body;
      const media = req.file;
      if (!media) {
        res.status(400).json("No file uploaded");
      }
      // Delete old avatar from cloudinary
      const user = await User.findOne({ userId: userId });
      if (!user) {
        res.status(404).json("User not found");
      }
      if (user.avatarUrl) {
        const publicId = user.avatarUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
        console.log("Deleted old avatar", publicId);
      }
      // Upload new avatar to cloudinary
      const result = await cloudinary.uploader.upload(media.path);
      const avatar = result.secure_url;
      console.log("New avatar", avatar);
      const updatedUser = await User.findOneAndUpdate(
        { userId: userId },
        { avatarUrl: avatar },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  changeProfileBackground: async (req, res, next) => {
    try {
      const { userId } = req.body;
      const media = req.file;
      if (!media) {
        res.status(400).json("No file uploaded");
      }
      // Delete old avatar from cloudinary
      const user = await User.findOne({ userId: userId });
      if (!user) {
        res.status(404).json("User not found");
      }
      if (user.profileBackground) {
        const publicId = user.profileBackground.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      // Upload new avatar to cloudinary
      const result = await cloudinary.uploader.upload(media.path);
      const profileBackground = result.secure_url;
      const updatedUser = await User.findOneAndUpdate(
        { userId: userId },
        { profileBackground: profileBackground },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      console.log(err);

      res.status(500).json({ message: err.message });
    }
  },
  changeName: async (req, res, next) => {
    try {
      const { userId, name } = req.body;
      if (!name) {
        res.status(400).json("Name is required");
      }
      const updatedUser = await User.findOneAndUpdate(
        { userId: userId },
        { name: name },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  changeBio: async (req, res, next) => {
    try {
      const { userId, bio } = req.body;
      if (!bio) {
        res.status(400).json("Bio is required");
      }
      const updatedUser = await User.findOneAndUpdate(
        { userId: userId },
        { bio: bio },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  addFriend: async (req, res, next) => {
    try {
      const id1 = req.params.id1;
      const id2 = req.params.id2;

      const user1 = await User.find({
        userId: id1,
      });
      await User.findOneAndUpdate(
        { userId: id1 },
        {
          userFriends: [...user1[0].userFriends, id2],
        },
        {
          new: true,
        }
      );

      const user2 = await User.find({
        userId: id2,
      });
      await User.findOneAndUpdate(
        { userId: id2 },
        {
          userFriends: [...user2[0].userFriends, id1],
        },
        {
          new: true,
        }
      );
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  removeFriend: async (req, res, next) => {
    try {
      const id1 = req.params.id1;
      const id2 = req.params.id2;

      const user1 = await User.find({
        userId: id1,
      });
      await User.findOneAndUpdate(
        { userId: id1 },
        {
          userFriends: user1[0].userFriends.filter((friend) => friend !== id2),
        },
        {
          new: true,
        }
      );

      const user2 = await User.find({
        userId: id2,
      });
      await User.findOneAndUpdate(
        { userId: id2 },
        {
          userFriends: user2[0].userFriends.filter((friend) => friend !== id1),
        },
        {
          new: true,
        }
      );
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = userController;
