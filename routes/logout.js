const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  if (req.user) {
    req.session.cookie.expires = new Date(Date.now());
    console.log(req.session.cookie.maxAge);
    res.clearCookie("connect.sid", { path: "/" });
    return res.redirect("/");
  }
  return res.redirect("/");
});

module.exports = router;
