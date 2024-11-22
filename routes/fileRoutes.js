//Imports
const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const { Readable } = require("stream");
const multer = require("multer");
require("dotenv").config();
const { aFiles, uaFiles } = require("../models/model");

// Variables
const client_email = process.env.CLIENT_EMAIL;
const private_key = process.env.PRIVATE_KEY;
const upload = multer({ storage: multer.memoryStorage() });

// Google Drive Credential and Authentication
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
async function authorize() {
  const jwtClient = new google.auth.JWT(
    client_email,
    null,
    private_key,
    SCOPES,
    null
  );
  await jwtClient.authorize();
  return jwtClient;
}

// Upload Route Request
// Helper Function to create a readable stream from a buffer
function createStreamFromBuffer(buffer) {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
}
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const authClient = await authorize();
    const drive = google.drive({ version: "v3", auth: authClient });
    const fileMetadata = {
      name: req.file.originalname,
    };
    const media = {
      mimeType: req.file.mimetype,
      body: createStreamFromBuffer(req.file.buffer),
    };
    const uploadedFile = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, webViewLink",
    });
    await drive.permissions.create({
      fileId: uploadedFile.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    nuaFile = new uaFiles({
      _id: uploadedFile.data.id,
      subjectName: req.body.subjectName,
      subjectCode: req.body.subjectCode,
      paperType: req.body.paperType,
      session: req.body.session,
      semester: req.body.semester,
      driveLink: uploadedFile.data.webViewLink,
    });
    nuaFile.save();
    res.json({
      response: "File Uploaded Successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Error uploading file" });
    console.log(error);
  }
});

// List Files Route Request
// Helper Function to list files
async function listFiles(authClient) {
  const drive = google.drive({ version: "v3", auth: authClient });
  const res = await drive.files.list({
    pageSize: 10,
    fields: "nextPageToken, files(id, name)",
  });
  const files = res.data.files;
  return files;
}
router.get("/list", async (req, res) => {
  try {
    const authClient = await authorize();
    const files = await listFiles(authClient);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: "Error listing files" });
  }
});

// Show Top File from unapprovedFiles Route Request
router.get("/unapprovedFiles", async (req, res) => {
  if ((await uaFiles.countDocuments()) === 0) {
    res.send("No Files to Show");
  } else {
    res.send(await uaFiles.find().limit(1));
  }
});

// Accept Files from unapprovedFiles Route Request
router.get("/acceptFile", async (req, res) => {
  const id = req.query.id;
  const uaFile = await uaFiles.findById(id);
  const naFile = new aFiles(uaFile.toObject());
  naFile.save();
  await uaFiles.deleteOne({ _id: id });
  res.send("File Accepted");
});

// Reject Files from unapprovedFiles Route Request
router.get("/rejectFile", async (req, res) => {
  const id = req.query.id;
  await uaFiles.deleteOne({ _id: id });
  res.send("File Accepted");
});

// Return Files that Match Description Route Request
router.get("/search", async (req, res) => {
  let subjectName = req.query.subjectName;
  let subjectCode = req.query.subjectCode;

  // Create case-insensitive regular expressions for partial matching
  const nameRegex = subjectName ? new RegExp(subjectName, "i") : null;
  const codeRegex = subjectCode ? new RegExp(subjectCode, "i") : null;

  // Build the query object based on the provided parameters
  const query = {};
  if (nameRegex) query.subjectName = { $regex: nameRegex };
  if (codeRegex) query.subjectCode = { $regex: codeRegex };

  try {
    const ss = await aFiles.find(query).exec();
    res.send({ data: ss });
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
