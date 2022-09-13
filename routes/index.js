const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  if (req.user) {
    return res.render("index", { loggedIn: true });
  }
  res.render("index", { title: "Office Manager - Home" });
});

module.exports = router;
