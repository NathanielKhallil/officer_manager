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
  if (
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,32}$/.test(
      req.body.newPassword
    ) === false
  ) {
    return res.send(
      "Passwords must be alphanumeric and contain at least one lowercase and uppercase alphabetical letter and one symbol."
    );
  }
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
        return res.redirect("/userPortal");
      });
    } catch (e) {
      console.log(e);
    }
  } else {
    res.send(
      "passwords do not match! Use the back button in your browser to try again."
    );
  }
});

module.exports = router;
