const express = require("express");
const router = express.Router();
const passport = require("passport");
require("../passport-config")(passport);

router.get("/", (req, res) => {
  if (req.user) {
    return res.render("userPortal", { name: req.user.username });
  }

  return res.render("login", { title: "Office Manager - login" });
});

router.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/userPortal",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

module.exports = router;
