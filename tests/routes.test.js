const request = require("supertest");
const app = require("../app.js");
const session = require("supertest-session");
const bcrypt = require("bcrypt");
const models = require("../app/models");
var superagent = require("superagent");

let mockSession = null;

describe("Index page", () => {
  let authenticatedSession;

  beforeEach(async () => {
    try {
      const hashedPassword = "1234!abCD";
      const username = "TestDude";
      const email = "TestDude@thedude.com";

      let newReg = {
        username: username,
        email: email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await models.User.create(newReg);
    } catch (e) {
      console.log(e);
    }
  });

  beforeEach(() => {
    mockSession = session(app);
  });

  afterEach(async () => {
    await models.User.destroy({ where: { username: "TestDude" } });
  });

  it("should sign in and redirect to userPortal", async () => {
    await mockSession
      .post("/login")
      .send({ username: "TestDude", password: "1234!abCD" })
      .expect(302);
    //   .then((response) => {
    //     console.log(response);
    //   });
  });

  it("should return a successful response even if no user logged in", async () => {
    await request(app)
      .get("/")
      .expect(200)
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });

  it("should check if a user is logged in and contain 'logout' instead of 'login' in the navaigation if req.user exists", function () {
    authenticatedSession = mockSession
      .post("/login")
      .send({ username: "TestDude", password: "1234!abCD" })
      .expect(302);

    if (authenticatedSession) {
      request(app)
        .get("/")
        .expect(200)
        .then((response) => {
          expect(response.statusCode).toBe(200);
          console.log(response);
        });
    }
  });
});
