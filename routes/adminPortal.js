const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const models = require("../app/models");

router.get("/", async (req, res, next) => {
  if (req.user && req.user.is_admin === true) {
    const data = await models.User.findAll({
      order: [["username"]],
    });
    return res.render("adminPortal", { data: data, admin: req.user.is_admin });
  }
  return res.send("You do not have permission to view this page.");
});

// update user details

router.post("/update/:id", async (req, res) => {
  if (req.user && req.user.is_admin) {
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
        return res.redirect("/adminPortal");
      });
    } catch (e) {
      console.log(e);
    }
  } else {
    return res.send("Bad request");
  }
});

// password change

router.post("/reset/:id", async (req, res) => {
  if (req.user && req.user.is_admin == false) {
    return res.send("Bad request");
  }

  if (
    req.user &&
    req.user.is_admin &&
    req.body.newPassword === req.body.verifyPassword
  ) {
    console.log(req.body.newPassword, req.body.verifyPassword);
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
        return res.redirect("/adminPortal");
      });
    } catch (e) {
      console.log(e);
    }
  } else {
    console.log(req.body.newPassword, req.body.verifyPassword);
    return res.send("passwords do not match");
  }
});

module.exports = router;
