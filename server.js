if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const https = require("https");
fs = require("fs");

const path = require("path");
const app = require("./app");
const cors = require("cors");

// Port

const PORT = process.env.SECRET_PORT;

// Cors
app.use(cors({ origin: `http://localhost:${PORT}` }));

// SSL Options
const options = {
  key: fs.readFileSync(path.join(__dirname, "./cert/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "./cert/cert.pem")),
};
// Models
const models = require("./app/models");

//Sync Database
models.sequelize.sync();

if (process.env.NODE_ENV !== "production") {
  const server = https.createServer(options, app);
  server.listen(PORT, () => {
    console.log(`Running securely...`);
  });
  module.exports = server;
}

// SSL should be implemented with openSSL (requires local download)
if (process.env.NODE_ENV === "production") {
  https
    .createServer(options, app)
    .listen(PORT)
    .then(() => {
      console.log(`Running securely...`);
    });
}
