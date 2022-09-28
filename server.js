if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

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

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
