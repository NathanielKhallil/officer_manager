if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
require("./passport-config")(passport);

// Models
const models = require("./app/models");

// Templating Engine
app.use(expressLayouts);
app.set("view engine", "ejs");

// Passport related
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 2 * 60 * 60 * 1000,
      // secure: false
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());

// Port
const PORT = process.env.SECRET_PORT;

// Cors
app.use(cors({ origin: `http://localhost:${PORT}` }));

// static directories
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));

// Home route
app.get("", (req, res) => {
  if (req.user) {
    return res.render("index", { loggedIn: true });
  }
  res.render("index", { title: "Office Manager - Home" });
});

// Login route
app.get("/login", (req, res) => {
  if (req.user) {
    return res.render("userPortal", { name: req.user.username });
  }

  res.render("login", { title: "Office Manager - login" });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/userPortal",
    failureRedirect: "/login",
    failureFlash: true,
  })
),
  // Register route

  app.get("/register", (req, res) => {
    res.render("register");
  });

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const username = await req.body.username;
    const email = await req.body.email;

    console.log(username);

    let newReg = {
      username: username,
      email: email,
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

// logout

app.get("/logout", function (req, res) {
  if (req.user) {
    req.session.cookie.expires = new Date(Date.now());
    console.log(req.session.cookie.maxAge);
    res.clearCookie("connect.sid", { path: "/" });
    res.redirect("/");
  }
});

// user-portal route
app.get("/userPortal", (req, res) => {
  if (req.user) {
    res.render("userPortal", { name: req.user.username });
  }
});

// Info route

// Todos route

app.get("/todos", async (req, res, next) => {
  if (req.user.access_granted === true) {
    const tasks = await models.Todos.findAll({
      where: {
        userId: req.user.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    return res.render("todos", { tasks: tasks });
  }
  res.send(
    "You do not have permission to view this page. Please contact the Administrator."
  );
});

//create new todos
app.post("/todos", async (req, res) => {
  try {
    const title = await req.body.title;
    const content = await req.body.content;
    const userId = await req.user.id;

    console.log(title);
    console.log(content);
    console.log(userId);

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
app.put("/todos", (req, res) => {});
// delete todos
app.delete("/todos", (req, res) => {});

// Matters route

// File access route

//Sync Database
models.sequelize
  .sync()
  .then(function () {
    console.log("sync successful");
  })
  .catch(function (err) {
    console.log(err, "Something went wrong!");
  });
console.log(PORT);
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
