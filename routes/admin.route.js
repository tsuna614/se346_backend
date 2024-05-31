const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");

router.get("/reports", adminController.getReports);
router.delete("/deletePost/:id", adminController.deletePostFromReport);

module.exports = router;
