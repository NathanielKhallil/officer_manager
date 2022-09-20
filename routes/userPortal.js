const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  if (req.user && req.user.is_admin === true) {
    return res.render("userPortal", {
      name: req.user.username,
      admin: req.user.is_admin,
    });
  }
  if (req.user) {
    return res.render("userPortal", { name: req.user.username });
  } else {
    return res.redirect("/login");
  }
});

module.exports = router;
