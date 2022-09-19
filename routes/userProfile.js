const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const model = require("../app/models");

router.get("/", async (req, res, next) => {
  if (req.user && req.user.access_granted === true) {
    const profile = req.user;
    return res.render("userProfile", { profile: profile });
  }
  res.send(
    "You do not have permission to view this page. Please contact the Administrator."
  );
});

// update

router.post("/update/:id", async (req, res) => {
  if (req.body.newPassword === req.body.verifyPassword) {
    try {
      const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
      await model.User.update(
        {
          password: hashedPassword,
          updatedAt: new Date(),
        },
        {
          where: { id: req.params.id },
        }
      ).then(function () {
        console.log(hashedPassword);
        res.redirect("/userPortal");
      });
    } catch (e) {
      console.log(e);
    }
  } else {
    res.send("passwords do not match!");
  }
});

module.exports = router;
