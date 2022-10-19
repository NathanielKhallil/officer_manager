const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const models = require("../app/models");

router.get("/", (req, res) => {
  res.render("register");
});

router.post("/", async (req, res) => {
  try {
    if (
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,32}$/.test(
        req.body.password
      ) === false
    ) {
      return res.send(
        "Passwords must be alphanumeric and contain at least one lowercase and uppercase alphabetical letter and one symbol."
      );
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    let newReg = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await models.User.create(newReg).then(function () {
      res.redirect("/login");
    });
  } catch {
    res.redirect("/register");
  }
});

module.exports = router;
