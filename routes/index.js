const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  let loggedIn = false;
  if (req.user && req.user.is_admin === true) {
    let admin = req.user.is_admin;
    loggedIn = true;
    return res.render("index", {
      loggedIn: loggedIn,
      admin: admin,
    });
  }
  if (req.user) {
    loggedIn = true;
    return res.render("index", { loggedIn: loggedIn });
  }
  res.render("index", { title: "Office Manager - Home", loggedIn: loggedIn });
});

module.exports = router;
