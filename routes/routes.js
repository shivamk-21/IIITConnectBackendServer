const express = require("express");
const router = express.Router();

// Importing route files
const quoteRoutes = require("./quoteRoutes");
const fileRoutes = require("./fileRoutes");
const contactRoutes = require("./contactRoutes");

// Base Route Request
router.get("/", (req, res) => {
  res.send("IIIT Connect Server");
});

// Using imported route files
router.use("/", quoteRoutes);
router.use("/", fileRoutes);
router.use("/", contactRoutes);

module.exports = router;
