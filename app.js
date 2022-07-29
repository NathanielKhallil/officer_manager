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
    // cookie: { secure: true },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());

// Port
const PORT = process.env.PORT;

// Cors
app.use(cors({ origin: `http://localhost:${PORT}` }));

// static directories
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));

// Home route
app.get("", (req, res) => {
  res.render("index", { title: "Office Manager - Home" });
});

// Login route
app.get("/login", (req, res) => {
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
    const access_granted = false;
    console.log(username);

    let newReg = {
      username: username,
      email: email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      access_granted: access_granted,
    };
    await models.User.create(newReg).then(function () {
      res.redirect("/login");
    });
  } catch {
    res.redirect("/register");
  }
});

// user-portal route
app.get("/userPortal", (req, res) => {
  res.render("userPortal", {req.user.username});
});

// Info route

// Matters route

// Todos route

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

app.listen(PORT || 3000, () => console.log(`Listening on port: ${PORT}`));
