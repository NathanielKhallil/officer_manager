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

// Passport related
const passport = require("passport");
const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (username) => users.find((user) => user.username === username),
  (id) => users.find((user) => user.id === user.id)
);

// Temp users storage to be replaced with actual database after code refactor
const users = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Port
const PORT = process.env.PORT;

// Cors
app.use(cors({ origin: `http://localhost:${PORT}` }));

// static directories
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));

// Templating Engine
app.use(expressLayouts);
app.set("view engine", "ejs");

// Home route
app.get("", (request, response) => {
  response.render("index", { title: "Office Manager - Home" });
});

// Login route
app.get("/login", (request, response) => {
  response.render("login", { title: "Office Manager - login" });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// Register route

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(), //not needed after DB connected
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
  console.log(users);
});

// Info route

// Matters route

// Todos route

// File access route

//Models
var models = require("./app/models");
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
