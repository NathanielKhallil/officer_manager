const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  let loggedIn = false;
  if (req.user) {
    loggedIn = true;
    return res.render("index", { loggedIn: loggedIn });
  }
  res.render("index", { title: "Office Manager - Home", loggedIn: loggedIn });
});

module.exports = router;
