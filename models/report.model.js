//Report model. Contains a userId, postId, and reason for the report

const mongoose = require("mongoose");
const reportSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  solved: {
    type: Boolean,
    default: false,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: false,
  },
});

const Report = mongoose.model("Report", reportSchema);

module.exports = { Report };
