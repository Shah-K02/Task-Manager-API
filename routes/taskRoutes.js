const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Task route is working");
});

module.exports = router;
