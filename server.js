if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const https = require("https");

const app = require("./app");
const cors = require("cors");

// Port

const PORT = process.env.SECRET_PORT;

// Cors
app.use(cors({ origin: `http://localhost:${PORT}` }));

// Models
const models = require("./app/models");

//Sync Database
models.sequelize.sync();

const sslServer = https.createServer(
  {
    key: "",
    cert: "",
  },
  app
);

if (process.env.NODE_ENV !== "production") {
  const server = app.listen(PORT, () =>
    console.log(`Listening on port: ${PORT}`)
  );
  module.exports = server;
}

// SSL should be implemented with openSSL (requires local download)
if (process.env.NODE_ENV === "production") {
  const server = sslServer.listen(PORT, () =>
    console.log("Secure server connected!")
  );
  module.exports = server;
}
