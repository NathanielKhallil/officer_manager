if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const app = express();
const flash = require("express-flash");
const session = require("express-session");

const passport = require("passport");
require("./passport-config")(passport);

// const FileStore = require("session-file-store")(session);
const home = require("./routes/index");
const login = require("./routes/login");
const logout = require("./routes/logout");
const register = require("./routes/register");
const userPortal = require("./routes/userPortal");
const todos = require("./routes/todos");
const matters = require("./routes/matters");
const files = require("./routes/files");
const appointments = require("./routes/appointments");
const userProfile = require("./routes/userProfile");

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
      secure: "auto",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Port
const PORT = process.env.SECRET_PORT;

// Cors
app.use(cors({ origin: `http://localhost:${PORT}` }));

// static directories
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));

// Routes

// Home route
app.use("/", home);

// Login route
app.use("/login", login);

// Register route

app.use("/register", register);

// logout

app.use("/logout", logout);

// user-portal route

app.use("/userPortal", userPortal);

// Info route

// Todos route

app.use("/todos", todos);

// Matters route

app.use("/matters", matters);

// File access route

app.use("/files", files);

// Appointments route

app.use("/appointments", appointments);

// User Profile route

app.use("/userProfile", userProfile);

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
