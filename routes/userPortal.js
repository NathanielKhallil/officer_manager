const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  if (req.user) {
    let admin = req.user.is_admin;
    return res.render("userPortal", { name: req.user.username, admin: admin });
  } else {
    return res.redirect("/login");
  }
});

module.exports = router;
