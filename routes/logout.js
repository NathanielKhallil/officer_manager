const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  if (req.user) {
    req.session.cookie.expires = new Date(Date.now());
    console.log(req.session.cookie.maxAge);
    res.clearCookie("connect.sid", { path: "/" });
    res.redirect("/");
  }
});

module.exports = router;
