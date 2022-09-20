const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const models = require("../app/models");

router.get("/", async (req, res, next) => {
  if (req.user && req.user.is_admin === true) {
    const data = await models.User.findAll({
      order: [["username"]],
    });
    console.log(data);
    return res.render("adminPortal", { data: data, admin: req.user.is_admin });
  }
  res.send("You do not have permission to view this page.");
});

// update user details

router.post("/update/:id", async (req, res) => {
  if (req.user.is_admin) {
    try {
      let updatedAccess = await req.body.accessStatus;
      let updatedEmail = await req.body.newEmail;

      await models.User.update(
        {
          access_granted: updatedAccess,
          email: updatedEmail,

          updatedAt: new Date(),
        },
        {
          where: { id: req.params.id },
        }
      ).then(function () {
        res.redirect("/adminPortal");
      });
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }
  return res.send("Bad request");
});

// password change

router.post("/reset/:id", async (req, res) => {
  if (req.user.is_admin) {
    try {
      const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

      await models.User.update(
        {
          password: hashedPassword,
          updatedAt: new Date(),
        },
        {
          where: { id: req.params.id },
        }
      ).then(function () {
        res.redirect("/adminPortal");
      });
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  }
  return res.send("Bad request");
});

module.exports = router;
