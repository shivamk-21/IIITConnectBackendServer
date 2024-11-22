// Imports
const express = require("express");
const routes = require("./routes/routes.js");
const app = express();
const PORT = process.env.PORT || 3000;
//Routes
app.use("/", routes);
// Server
const server = app.listen(PORT, () => {
  const { address, port } = server.address();
  console.log(`Server listening at http://${address}:${port}`);
});

module.exports = app;