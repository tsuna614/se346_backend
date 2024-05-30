const Group = require("../models/group.model");
const User = require("../models/user.model");
const { Post } = require("../models/post.model");
const { cloudinary } = require("../cloudinary");
//Get groups : for searching purposes. Return all groups or filtered using name query
//Get group: get a specific group by id
//Get group posts: get all posts in a group
//Create group: create a group, assign creator as admin
//Update group: update group details (not implemented yet)
//Delete group: delete group
//Add member: add a member to a group (not implemented yet)
//Remove member: remove a member from a group (not implemented yet)
//
const groupController = {
  postToGroup: async (req, res, next) => {
    try {
      const { content, userId } = req.body;
      const { groupId } = req.params;
      const poster = await User.findOne({ userId: userId });

      const posterAvatarUrl = poster.avatarUrl;
      const media = req.file;
      let mediaUrl = "";
      if (media) {
        const result = await cloudinary.uploader.upload(media.path);
        mediaUrl = result.secure_url;
      } else {
        mediaUrl = "";
      }
      const post = await Post.create({
        content: content,
        posterAvatarUrl: posterAvatarUrl,
        name: poster.name,
        posterId: userId,
        mediaUrl: mediaUrl === "" ? null : mediaUrl,
        groupId: groupId,
      });
      console.log("Post created: ", post);
      res.status(200).json(post);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },

  getGroups: async (req, res, next) => {
    try {
      const { name, userId } = req.query;

      const nameToSearch = name ? name : "";

      const query = {
        name: { $regex: nameToSearch, $options: "i" },
      };

      const groups = await Group.find(query).select(
        "_id name description bannerImgUrl members admins"
      );

      if (userId) {
        const modifiedGroups = groups.map((group) => {
          const groupObj = group.toObject();
          groupObj.isMember = groupObj.members.some(
            (member) => member.id === userId
          );
          groupObj.isAdmin = groupObj.admins.some(
            (admin) => admin.id === userId
          );
          return groupObj;
        });

        res.status(200).json(modifiedGroups);
      } else {
        res.status(200).json(groups);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  getGroupName: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const group = await Group.findOne({ _id: groupId }).select("name");
      res.status(200).json(group);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },

  getGroup: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const { userId } = req.query;

      const group = await Group.findOne({ _id: groupId })
        .populate("members")
        .populate("admins");

      //Check if user is a member and admin
      const modifiedGroup = group.toObject();
      modifiedGroup.isMember = modifiedGroup.members.some(
        (member) => member.id === userId
      );
      modifiedGroup.isAdmin = modifiedGroup.admins.some(
        (admin) => admin.id === userId
      );

      res.status(200).json(modifiedGroup);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  getGroupPosts: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const { userId } = req.query;
      const posts = await Post.find({ groupId: groupId }).sort({
        createdAt: -1,
      });
      const modifiedPosts = posts.map((post) => {
        const postObj = post.toObject();
        postObj.userLiked = post.likes.some((like) => like === userId);
        postObj.userIsPoster = post.posterId === userId;
        return postObj;
      });
      res.status(200).json({ posts: modifiedPosts });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  createGroup: async (req, res, next) => {
    try {
      let { name, description, userId } = req.body;
      console.log("Creating group: ", name, description, userId);
      const media = req.file;
      const user = await User.findOne({ userId: userId });
      let bannerImgUrl = "";
      if (media) {
        const result = await cloudinary.uploader.upload(media.path);
        bannerImgUrl = result.secure_url;
      }

      const group = await Group.create({
        name: name,
        description: description ? description : "",
        bannerImgUrl: bannerImgUrl,
        members: [{ id: userId, name: user.name, avatarUrl: user.avatarUrl }],
        admins: [{ id: userId, name: user.name, avatarUrl: user.avatarUrl }],
      });

      console.log("Group created: ", group);
      res.status(200).json(group);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  deleteGroup: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      await Group.findOneAndDelete({ _id: groupId });

      res.status(200).json({ message: "Group deleted" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  joinGroup: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;
      //If user is already a member, ignore
      const group = await Group.findOne({ _id: groupId });
      if (group.members.some((member) => member.id === userId)) {
        res.status(200).json({ message: "User already a member" });
        return;
      }
      const user = await User.findOne({ userId: userId });
      group.members.push({
        id: userId,
        name: user.name,
        avatarUrl: user.avatarUrl,
      });
      await group.save();
      res.status(200).json(group);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  leaveGroup: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }
      const group = await Group.findOne({ _id: groupId });
      group.members = group.members.filter((member) => member.id !== userId);
      //if no members left, delete group
      if (group.members.length === 0) {
        await Group.findOneAndDelete({ _id: groupId });
        res.status(200).json({ message: "Group deleted" });
        return;
      }
      await group.save();
      res.status(200).json(group);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = groupController;
