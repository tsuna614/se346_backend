const { Post } = require("../models/post.model");
const User = require("../models/user.model");

const adminController = {
  //Get all reports, and attach the reported post and user
  //Exclude reports that have been resolved
  getReports: async (req, res, next) => {
    try {
      //post id and user id are only strings so we have to query the post and user collections
      const reports = await Report.find({ resolved: false });
      const reportPromises = reports.map(async (report) => {
        const post = await Post.findOne({ _id: report.postId });
        const user = await User.findOne({ userId: report.userId });
        return {
          _id: report._id,
          post,
          user,
          reason: report.reason,
        };
      });
      const reportsWithPostAndUser = await Promise.all(reportPromises);
      res.status(200).json(reportsWithPostAndUser);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
  //Delete a post from a report. Mark the report as resolved
  deletePostFromReport: async (req, res, next) => {
    try {
      const postId = req.params.id;
      const post = await Post.findOne({ _id: postId });
      if (!post) {
        throw new Error("Post not found");
      }
      await post.deleteOne();
      await Report.updateMany({ postId: postId }, { resolved: true });
      res.status(200).json({ message: "Post deleted" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = adminController;
