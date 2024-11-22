//Imports
const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const multer = require("multer");
require("dotenv").config();

// Variables
const client_email = process.env.CLIENT_EMAIL;
const private_key = process.env.PRIVATE_KEY;
const sheet_id = process.env.SHEET_ID;

// Google Drive Credential and Authentication
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
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

// Get Contact Details Route Request
router.get("/contact", async (req, res) => {
  const name = (req.query.name || "").toLowerCase();
  const type = (req.query.type || "").toLowerCase();
  const department = (req.query.department || "").toLowerCase();
  const number = (req.query.number || "").toLowerCase();

  const authClient = await authorize();
  const sheets = google.sheets({ version: "v4", auth: authClient });
  const getRows = await sheets.spreadsheets.values.get({
    spreadsheetId: sheet_id,
    range: "Sheet1",
  });

  const data = getRows.data.values;
  const filteredData = data.slice(1).filter((row) => {
    if (name && row[0].toLowerCase().indexOf(name.toLowerCase()) === -1) {
      return false;
    }
    if (type && row[1].toLowerCase().indexOf(type.toLowerCase()) === -1) {
      return false;
    }
    if (department && row[2].toLowerCase().indexOf(department.toLowerCase()) === -1) {
      return false;
    }
    if (number && row[3].toLowerCase().indexOf(number.toLowerCase()) === -1) {
      return false;
    }
    return true;
  });
  res.send(JSON.stringify({ filteredData }));
});

//Exporting Router for Server
module.exports = router;
