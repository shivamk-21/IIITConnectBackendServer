//Import
const mongoose = require("mongoose");
require("dotenv").config();

// Variables
const db_user = process.env.DB_USER;
const db_pass = process.env.DB_PASS;
const mongo_url = process.env.MONGO_URL;

//Setting Parameters and Conncting to MongoDB
mongoose.set("strictQuery", false);
mongoose
  .connect(
    `mongodb+srv://${db_user}:${db_pass}@${mongo_url}`,
  )
  .then(() => console.log("Connected Successfully"))
  .catch((err) => {
    console.error(err);
  });

//Schemas
const approvedFilesSchema = new mongoose.Schema({
  _id: String,
  subjectName: String,
  subjectCode: String,
  paperType: String,
  session: String,
  semester: String,
  driveLink: String,
});
const unapprovedFilesSchema = new mongoose.Schema({
  _id: String,
  subjectName: String,
  subjectCode: String,
  paperType: String,
  session: String,
  semester: String,
  driveLink: String,
});

//Models
const aFiles = mongoose.model("approvedFiles", approvedFilesSchema);
const uaFiles = mongoose.model("unapprovedFiles", unapprovedFilesSchema);

//Exporting Models
module.exports = { aFiles, uaFiles };
