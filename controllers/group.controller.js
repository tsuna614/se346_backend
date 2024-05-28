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
  getGroups: async (req, res, next) => {
    try {
      const { name, userId } = req.query;

      const nameToSearch = name ? name : "";

      const query = {
        name: { $regex: nameToSearch, $options: "i" },
      };

      const groups = await Group.find(query).select(
        "_id name description bannerImgUrl members admins followers"
      );

      if (userId) {
        const modifiedGroups = groups.map((group) => {
          const groupObj = group.toObject();
          groupObj.isMember = groupObj.members.some(
            (member) => member.id === userId
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

  getGroup: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const group = await Group.findOne({ _id: groupId })
        .populate("members")
        .populate("admins")
        .populate("followers");
      res.status(200).json(group);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  getGroupPosts: async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const posts = await Post.find({ groupId: groupId }).sort({
        createdAt: -1,
      });
      res.status(200).json(posts);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  createGroup: async (req, res, next) => {
    try {
      const { name, description, userId } = req.body;
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
        description: description,
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
      await Group.deleteOne({ _id: groupId });
      res.status(200).json({ message: "Group deleted" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = groupController;
