const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  let loggedIn = false;
  if (req.user && req.user.is_admin === true) {
    const admin = req.user.is_admin;
    loggedIn = true;
    return res.render("index", {
      loggedIn: loggedIn,
      admin: admin,
    });
  }
  if (req.user) {
    loggedIn = true;
    const admin = req.user.is_admin;
    return res.render("index", { loggedIn: loggedIn, admin: admin });
  }
  return res.render("index", {
    title: "Office Manager - Home",
    loggedIn: loggedIn,
  });
});

module.exports = router;
