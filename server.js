const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const userRoute = require("./routes/user.route");
const postRoute = require("./routes/post.route");
const groupRoute = require("./routes/group.route");
const adminRoute = require("./routes/admin.route");
require("dotenv").config();

mongoose.connect(
  "mongodb+srv://thedarkspiritaway:Phgcb10vimooAmRT@cluster0.bk5aeuo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);
const db = mongoose.connection;
db.on("error", (error) => {
  console.log(error);
});
db.on("open", () => {
  console.log("Connected to database");
});
//Logger
app.use((req, res, next) => {
  console.log("API: ", req.method, req.path);
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

app.use("/v1/user", userRoute);
app.use("/v1/post", postRoute);
app.use("/v1/group", groupRoute);
app.use("/v1/admin", adminRoute);
//Error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ message: err.message });
});
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
