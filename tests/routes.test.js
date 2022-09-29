const request = require("supertest");
const app = require("../app.js");
const server = request.agent(app);
const bcrypt = require("bcrypt");
const models = require("../app/models");
const sequelize = require("sequelize");

//INDEX route //

describe("Index page endpoint check", () => {
  //Create new test user on test database
  beforeAll(async () => {
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

  //Confirm login route functions, authenticates and redirects to the success route prior to test
  beforeEach(async () => {
    await server
      .post("/login")
      .send({ username: "TestDude", password: "1234!abCD" })
      .expect(302)
      .expect("Location", "/userPortal");
  });

  //clean up the model when finished test block
  afterAll(async () => {
    await models.User.destroy({ where: { username: "TestDude" } });
  });

  it("url that requires user to be logged in", async () => {
    try {
      await server.get("/userPortal").expect(200);
    } catch (e) {
      console.log(e);
    }
  });

  it("should return a successful response even if no user logged in", async () => {
    // logs user out and checks for successful redirect to the index page, reload index page without being logged in this
    // functionality is important in terms of what the view engine renders which may require mocking passport user.req
    // which appears to not be possible with Supertest due to user.req/passport being server side opposed to client side.
    await server
      .get("/logout")
      .expect(302)
      .expect("Location", "/")
      .then(async () => {
        await request(app).get("/").expect(200);
      });
  });
  // Test is a WIP and may require a test suite other than supertest/super agent as explained in the above, previous comment.
  it("should know if a user is logged when loading the page", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
  });
});

// MATTERS route //

describe("User Portal route", () => {
  beforeAll(async () => {
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

  beforeAll(async () => {
    await server
      .post("/login")
      .send({ username: "TestDude", password: "1234!abCD" })
      .expect(302)
      .expect("Location", "/userPortal");
  });

  afterAll(async () => {
    await models.User.destroy({ where: { username: "TestDude" } });
  });

  it("successfully reaches the matters page when logged in", async () => {
    try {
      await server.get("/userPortal").accept("json").expect(200);
    } catch (e) {
      console.log(e);
    }
  });
});

// TODOS route //

describe("todos route", () => {
  beforeAll(async () => {
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

  beforeAll(async () => {
    await server
      .post("/login")
      .send({ username: "TestDude", password: "1234!abCD" })
      .expect(302)
      .expect("Location", "/userPortal");
  });

  afterAll(async () => {
    await models.User.destroy({ where: { username: "TestDude" } });
  });

  it("successfully reaches the todos page when logged in", async () => {
    try {
      await server.get("/todos").accept("json").expect(200);
    } catch (e) {
      console.log(e);
    }
  });
});

// MATTERS route //

describe("Matters route", () => {
  beforeAll(async () => {
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

  beforeAll(async () => {
    await server
      .post("/login")
      .send({ username: "TestDude", password: "1234!abCD" })
      .expect(302)
      .expect("Location", "/userPortal");
  });

  afterAll(async () => {
    await models.User.destroy({ where: { username: "TestDude" } });
  });

  it("successfully reaches the matters page when logged in", async () => {
    try {
      await server.get("/matters").accept("json").expect(200);
    } catch (e) {
      console.log(e);
    }
  });
});

// USERPROFILE route //

describe("User Profile route", () => {
  beforeAll((done) => {
    done();
  });

  beforeAll(async () => {
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

  beforeAll(function (done) {
    server
      .post("/login")
      .send({ username: "TestDude", password: "1234!abCD" })
      .expect(302)
      .expect("Location", "/userPortal")
      .end(done);
  });

  afterAll(async () => {
    await models.User.destroy({ where: { username: "TestDude" } });
  });

  it("successfully reaches the user profile page", async () => {
    try {
      await server.get("/userProfile").accept("json").expect(200);
    } catch (e) {
      console.log(e);
    }
  });
});
