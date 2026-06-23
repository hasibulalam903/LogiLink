const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "LogiLink API Running"
  });
});

module.exports = app;