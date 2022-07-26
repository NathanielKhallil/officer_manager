require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT;
app.use(cors({ origin: `http://localhost:${PORT}` }));

// static directories
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));

// Templating Engine
app.use(expressLayouts);
app.set("view engine", "ejs");

// Routing
app.get("", (request, response) => {
  response.render("index", { title: "Office Manager - Home" });
});

// Login route
app.get("/login", (request, response) => {
  response.render("login", { title: "Office Manager - login" });
});

app.listen(PORT || 3000, () => console.log(`Listening on port: ${PORT}`));
