const express = require("express");
const router = express.Router();

router.get("/", async (req, res, next) => {
  if (req.user) {
    const admin = req.user.is_admin;

    return res.render("generalInfo", {
      admin: admin,
    });
  } else {
    return res.send(
      "You do not have permission to view this page. Contact the Administrator."
    );
  }
});

module.exports = router;
