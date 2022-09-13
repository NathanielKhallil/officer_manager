const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  if (req.user) {
    return res.render("userPortal", { name: req.user.username });
  } else {
    return res.redirect("/login");
  }
});

module.exports = router;
