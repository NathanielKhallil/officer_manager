const express = require("express");
const router = express.Router();

const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

// AWS
aws.config.update({
  secretAccessKey: process.env.ACCESS_SECRET,
  accessKeyId: process.env.ACCESS_KEY,
  region: process.env.REGION,
});

const BUCKET = process.env.BUCKET;
const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    bucket: BUCKET,
    s3: s3,
    acl: "public-read",
    key: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

router.get("/", async (req, res, next) => {
  if (req.user && req.user.access_granted === true) {
    const admin = req.user.is_admin;
    let read = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
    let listContents = read.Contents.map((item) => item);
    return res.render("files", { listContents, admin: admin });
  } else {
    return res.send(
      "You do not have permission to view this page. Contact the Administrator."
    );
  }
});

// File - UPLOADING

router.post("/upload", upload.single("file"), (req, res) => {
  res.redirect("/files");
});

// File - DOWNLOADING

router.get("/download/:filename", async (req, res) => {
  const filename = req.params.filename;
  if (req.user && req.user.access_granted === true) {
    let fileObject = await s3
      .getObject({ Bucket: BUCKET, Key: filename })
      .promise();
    res.send(fileObject.Body);
  } else {
    return res.send("You are not authorized to perform this action.");
  }
});

// File - DELETION

router.get("/delete/:filename", async (req, res) => {
  const filename = req.params.filename;
  await s3.deleteObject({ Bucket: BUCKET, Key: filename }).promise();

  return res.redirect("/files");
});

module.exports = router;
