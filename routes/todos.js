const express = require("express");
const router = express.Router();

const models = require("../app/models");

router.get("/", async (req, res, next) => {
  if (req.user && req.user.access_granted === true) {
    const tasks = await models.Todos.findAll({
      where: {
        userId: req.user.id,
      },
      order: [["id"]],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    return res.render("todos", { tasks: tasks });
  } else {
    return res.send(
      "You do not have permission to view this page. Contact the Administrator."
    );
  }
});

//create new todos
router.post("/", async (req, res) => {
  try {
    const title = await req.body.title;
    const content = await req.body.content;
    const userId = await req.user.id;

    let newToDo = {
      title: title,
      content: content,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: userId,
    };
    await models.Todos.create(newToDo).then(function () {
      res.redirect("/todos");
    });
  } catch {
    res.redirect("/todos");
  }
});
// update todos
router.post("/update/:id", async (req, res) => {
  try {
    let newContent = req.body.content;
    await models.Todos.update(
      {
        id: req.params.id,
        content: newContent,
        updatedAt: new Date(),
      },
      {
        where: { id: req.params.id },
      }
    ).then(function () {
      res.redirect("/todos");
    });
  } catch {
    res.send("Failed to update task.");
  }
});

// delete todos

router.post("/delete/:id", async (req, res) => {
  try {
    await models.Todos.destroy({ where: { id: req.params.id } }).then(
      function () {
        res.redirect("/todos");
      }
    );
  } catch {
    res.send("Failed to delete task.");
  }
});

module.exports = router;
