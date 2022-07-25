require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const SERVER_PORT = process.env.SERVER_PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: `http://localhost:${SERVER_PORT}` }));

app.get("/", (request, response) => response.send("Test get path"));

app.listen(SERVER_PORT || 3000, () =>
  console.log(`Listening on port: ${SERVER_PORT}`)
);
