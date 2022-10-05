const express = require("express");
const router = express.Router();

const models = require("../app/models");

router.get("/", async (req, res, next) => {
  if (req.user && req.user.access_granted === true) {
    const appointments = await models.Appointments.findAll({
      order: [["date"]],
    });
    return res.render("appointments", { appointments: appointments });
  } else {
    return res.send(
      "You do not have permission to view this page. Contact the Administrator."
    );
  }
});

// APPOINTMENTS - Create

router.post("/", async (req, res) => {
  const title = await req.body.title;
  const phone = await req.body.phone;
  const date = await req.body.date;
  const time = await req.body.time;
  const notes = await req.body.notes;
  const newClient = await req.body.new_client;
  console.log(date);
  try {
    let newAppointment = {
      title: title,
      phone_num: phone,
      date: date,
      time: time,
      notes: notes,
      new_client: newClient,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await models.Appointments.create(newAppointment).then(function () {
      return res.redirect("/appointments");
    });
  } catch {
    console.log(date);
    res.redirect("/appointments");
  }
});

// APPOINTMENTS - Update

router.post("/update/:id", async (req, res) => {
  try {
    let updatedPhone = await req.body.updatedPhone;
    let updatedNewClient = await req.body.updatedNewClient;
    let updatedDate = await req.body.updatedDate;
    let updatedTime = await req.body.updatedTime;
    let updatedNotes = await req.body.updatedNotes;

    await models.Appointments.update(
      {
        id: req.params.id,
        phone_num: updatedPhone,
        date: updatedDate,
        time: updatedTime,
        new_client: updatedNewClient,
        notes: updatedNotes,
        updatedAt: new Date(),
      },
      {
        where: { id: req.params.id },
      }
    ).then(function () {
      res.redirect("/appointments");
    });
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

// APPOINTMENTS - Delete

router.post("/delete/:id", async (req, res) => {
  if (req.user && req.user.is_admin === true) {
    try {
      await models.Appointments.destroy({ where: { id: req.params.id } }).then(
        function () {
          res.redirect("/appointments");
        }
      );
    } catch {
      res.send("Failed to delete matter.");
    }
  } else {
    res.send("You must be an Administrator to delete matters.");
  }
});

module.exports = router;
