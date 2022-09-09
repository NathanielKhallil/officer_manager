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
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

// AWS
aws.config.update({
  secretAccessKey: process.env.ACCESS_SECRET,
  accessKeyId: process.env.ACCESS_KEY,
  region: process.env.REGION,
});

const BUCKET = process.env.BUCKET;
const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    bucket: BUCKET,
    s3: s3,
    acl: "public-read",
    key: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
});

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

// functon consts

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
    return res.render("userPortal", { name: req.user.username });
  } else {
    return res.redirect("/");
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
      order: [["id"]],
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
app.post("/todos/update/:id", async (req, res) => {
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

app.post("/todos/:id", async (req, res) => {
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
// Matters route

app.get("/matters", async (req, res, next) => {
  if (req.user && req.user.access_granted === true) {
    const matters = await models.Matters.findAll({
      order: [["matter_number"]],
    });
    return res.render("matters", { matters: matters });
  } else {
    return res.redirect("/");
  }
});

//create new matter
app.post("/matters", async (req, res) => {
  const matterNum = await req.body.matterNum;
  const notes = await req.body.notes;
  const matterExists = await models.Matters.findOne({
    where: { matter_number: matterNum },
  });
  if (matterExists) {
    console.log(matterExists);
    return res.send("Matter number already exists.");
  } else {
    try {
      console.log(matterNum);
      console.log(notes);

      let newMatter = {
        matter_number: matterNum,
        notes: notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await models.Matters.create(newMatter).then(function () {
        return res.redirect("/matters");
      });
    } catch {
      res.redirect("/matters");
    }
  }
});

// update matters

app.post("/matters/update/:id", async (req, res) => {
  try {
    let updatedCFA = req.body.cfa_signed;
    let updatedStatementOfClaimFiled = req.body.statement_of_claim_filed;
    let updatedStatementOfClaimServed = req.body.s_of_c_served;
    let updatedStatementOfDefenceServed = req.body.s_of_d_served;
    let updatedAffOfRecords = req.body.aff_of_recs_served;
    let updatedProduciblesSent = req.body.producibles_sent;
    let updatedQuestioningDone = req.body.questioning_done;
    let updatedUndertakingsRemaining = req.body.undertakings_remaining;

    await models.Matters.update(
      {
        id: req.params.id,
        cfa_signed: updatedCFA,
        statement_of_claim_filed: updatedStatementOfClaimFiled,
        s_of_c_served: updatedStatementOfClaimServed,
        s_of_d_served: updatedStatementOfDefenceServed,
        aff_of_recs_served: updatedAffOfRecords,
        producibles_sent: updatedProduciblesSent,
        questioning_done: updatedQuestioningDone,
        undertakings_remaining: updatedUndertakingsRemaining,
        updatedAt: new Date(),
      },
      {
        where: { id: req.params.id },
      }
    ).then(function () {
      res.redirect("/matters");
    });
  } catch {
    res.send("Failed to update matter.");
  }
});

// delete matters

app.post("/matters/delete/:id", async (req, res) => {
  if (req.user && req.user.is_admin === true) {
    try {
      await models.Matters.destroy({ where: { id: req.params.id } }).then(
        function () {
          res.redirect("/matters");
        }
      );
    } catch {
      res.send("Failed to delete matter.");
    }
  } else {
    res.send("You must be an Administrator to delete matters.");
  }
});

// File access route

app.get("/files", async (req, res, next) => {
  if (req.user && req.user.access_granted === true) {
    let read = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
    let listContents = read.Contents.map((item) => item);
    return res.render("files", { listContents });
  } else {
    return res.redirect("/");
  }
});

// File - UPLOADING

app.post("/upload", upload.single("file"), (req, res) => {
  res.redirect("/files");
});

// File - DOWNLOADING

app.get("/download/:filename", async (req, res) => {
  const filename = req.params.filename;
  if (req.user && req.user.is_admin === true) {
    let fileObject = await s3
      .getObject({ Bucket: BUCKET, Key: filename })
      .promise();
    res.send(fileObject.Body);
  } else {
    res.send("You are not authorized to perform this action.");
  }
});

// File - DELETION

app.get("/delete/:filename", async (req, res) => {
  const filename = req.params.filename;
  await s3.deleteObject({ Bucket: BUCKET, Key: filename }).promise();

  res.redirect("/files");
});

// APPOINTMENTS

app.get("/appointments", async (req, res, next) => {
  if (req.user && req.user.access_granted === true) {
    const appointments = await models.Appointments.findAll({
      order: [["date"]],
    });
    console.log(appointments);
    return res.render("appointments", { appointments: appointments });
  } else {
    return res.redirect("/");
  }
});

// APPOINTMENTS - Create

app.post("/appointments", async (req, res) => {
  const title = await req.body.title;
  const phone = await req.body.phone;
  const date = await req.body.date;
  const time = await req.body.time;
  const notes = await req.body.notes;
  const newClient = await req.body.new_client;
  try {
    let newAppointment = {
      title: title,
      phone_num: phone,
      date: date,
      time: time,
      notes: notes,
      new_client: newClient,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await models.Appointments.create(newAppointment).then(function () {
      return res.redirect("/appointments");
    });
  } catch {
    res.redirect("/appointments");
  }
});

// APPOINTMENTS - Update

app.post("/appointments/update/:id", async (req, res) => {
  try {
    let updatedPhone = await req.body.updatedPhone;
    let updatedNewClient = await req.body.updatedNewClient;
    let updatedDate = await req.body.updatedDate;
    let updatedTime = await req.body.updatedTime;
    let updatedNotes = await req.body.updatedNotes;

    await models.Appointments.update(
      {
        id: req.params.id,
        phone_num: updatedPhone,
        date: updatedDate,
        time: updatedTime,
        new_client: updatedNewClient,
        notes: updatedNotes,
        updatedAt: new Date(),
      },
      {
        where: { id: req.params.id },
      }
    ).then(function () {
      res.redirect("/appointments");
    });
  } catch {
    res.send("Failed to update Appointment.");
  }
});

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
