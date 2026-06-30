const express = require("express");
const cors=require("./config/cors");

const app = express();

app.use(express.json());
app.use(cors)

app.get("/", (req, res) => {
  res.json({
    message: "LogiLink API Running"
  });
});

module.exports = app;