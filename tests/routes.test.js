const request = require("supertest");
const app = require("../app.js");
const server = request.agent(app);
const bcrypt = require("bcrypt");
const models = require("../app/models");

function loginTest() {
  return function (done) {
    server
      .post("/login")
      .send({ username: "TestDude", password: "1234!abCD" })
      .expect(302)
      .expect("Location", "/userPortal")
      .end(onResponse);

    function onResponse(err, res) {
      if (err) return done(err);
      return done();
    }
  };
}

// Disconnect after all tests
afterAll(async (done) => {
  console.log("Disconnect Jest database");
  database.close();
  done();
});

// LOGIN route //
describe("login route", () => {
  beforeEach(async () => {
    try {
      const hashedPassword = await bcrypt.hash("1234!abCD", 10);
      const username = "TestDude";
      const email = "TestDude@thedude.com";

      let newReg = {
        username: username,
        email: email,
        password: hashedPassword,
        access_granted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await models.User.create(newReg);
    } catch (e) {
      console.log(e);
    }
  });

  afterEach(async () => {
    await models.User.destroy({ where: { username: "TestDude" } });
  });

  it("should sign in and redirect to userPortal", () => {
    loginTest(); //runs login function that expects 302 with userPortal as the location
  });
});

//INDEX route //

describe("Index page endpoint check", () => {
  beforeEach(async () => {
    try {
      const hashedPassword = await bcrypt.hash("1234!abCD", 10);
      const username = "TestDude";
      const email = "TestDude@thedude.com";

      let newReg = {
        username: username,
        email: email,
        password: hashedPassword,
        access_granted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await models.User.create(newReg);
    } catch (e) {
      console.log(e);
    }
  });

  beforeEach(loginTest());

  afterEach(async () => {
    await models.User.destroy({ where: { username: "TestDude" } });
  });

  it("url that requires user to be logged in", function (done) {
    try {
      server
        .get("/userPortal")
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    } catch (e) {
      console.log(e);
    }
  });

  it("should return a successful response even if no user logged in", function (done) {
    // request(app).post("/logout"); // log user out, clear, expire active cookie
    server
      .get("/logout")
      .expect(302)
      .expect("Location", "/")
      .then(() => {
        request(app).get("/").expect(200);
      });
    done();
  });

  it("should know if a user is logged when loading the page", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
  });
});

// MATTERS route //

describe("User Portal route", () => {
  beforeEach(async () => {
    try {
      const hashedPassword = await bcrypt.hash("1234!abCD", 10);
      const username = "TestDude";
      const email = "TestDude@thedude.com";

      let newReg = {
        username: username,
        email: email,
        password: hashedPassword,
        access_granted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await models.User.create(newReg);
    } catch (e) {
      console.log(e);
    }
  });

  beforeEach(loginTest());

  afterEach(async () => {
    await models.User.destroy({ where: { username: "TestDude" } });
  });

  it("successfully reaches the matters page when logged in", function (done) {
    try {
      server
        .get("/userPortal")
        .accept("json")
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    } catch (e) {
      console.log(e);
    }
  });
});

// TODOS route //

describe("todos route", () => {
  beforeEach(async () => {
    try {
      const hashedPassword = await bcrypt.hash("1234!abCD", 10);
      const username = "TestDude";
      const email = "TestDude@thedude.com";

      let newReg = {
        username: username,
        email: email,
        password: hashedPassword,
        access_granted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await models.User.create(newReg);
    } catch (e) {
      console.log(e);
    }
  });

  beforeEach(loginTest());

  afterEach(async () => {
    await models.User.destroy({ where: { username: "TestDude" } });
  });

  it("successfully reaches the todos page when logged in", function (done) {
    try {
      server
        .get("/todos")
        .accept("json")
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    } catch (e) {
      console.log(e);
    }
  });
});

// MATTERS route //

describe("Matters route", () => {
  beforeEach(async () => {
    try {
      const hashedPassword = await bcrypt.hash("1234!abCD", 10);
      const username = "TestDude";
      const email = "TestDude@thedude.com";

      let newReg = {
        username: username,
        email: email,
        password: hashedPassword,
        access_granted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await models.User.create(newReg);
    } catch (e) {
      console.log(e);
    }
  });

  beforeEach(loginTest());

  afterEach(async () => {
    await models.User.destroy({ where: { username: "TestDude" } });
  });

  it("successfully reaches the matters page when logged in", function (done) {
    try {
      server
        .get("/matters")
        .accept("json")
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    } catch (e) {
      console.log(e);
    }
  });
});

// USERPROFILE route //

describe("User Profile route", () => {
  beforeEach(async () => {
    try {
      const hashedPassword = await bcrypt.hash("1234!abCD", 10);
      const username = "TestDude";
      const email = "TestDude@thedude.com";

      let newReg = {
        username: username,
        email: email,
        password: hashedPassword,
        access_granted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await models.User.create(newReg);
    } catch (e) {
      console.log(e);
    }
  });

  beforeEach(loginTest());

  afterEach(async () => {
    await models.User.destroy({ where: { username: "TestDude" } });
  });

  it("successfully reaches the user profile page", function (done) {
    try {
      server
        .get("/userProfile")
        .accept("json")
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          done();
        });
    } catch (e) {
      console.log(e);
    }
  });
});
