const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Middle ware for uploading images
const storage = multer.diskStorage({});
const upload = multer({ dest: "uploads" });

const uploadMedia = (req, res, next) => {
  // Use Multer to handle the file upload
  upload.single("media")(req, res, (err) => {
    if (err) {
      throw err;
    }
    if (req.file) {
      console.log("File uploaded");
      // The file is now available as req.file
    } else {
      console.log("No file uploaded");
    }
    next();
  });
};

module.exports = { cloudinary, uploadMedia };
