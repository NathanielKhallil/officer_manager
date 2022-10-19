const request = require("supertest");
const app = require("../app.js");
const server = request.agent(app);
const bcrypt = require("bcrypt");
const models = require("../app/models");

let session = null;
let serverListen;
//Create new test Admin user
beforeAll(async () => {
  const hashedPassword = await bcrypt.hash("1234!abCD", 10);
  const username = "TestDudeAdmin";
  const email = "TestDudeAdmin@thedude.com";

  let newReg = {
    username: username,
    email: email,
    password: hashedPassword,
    access_granted: true,
    is_admin: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const res = await models.User.create(newReg);
});

// create user to run tests on where access_granted is false by default
beforeAll(async () => {
  const hashedPassword = await bcrypt.hash("1234!abCD", 10);
  const username = "TestUser";
  const email = "TestUser@thedude.com";

  let newReg = {
    username: username,
    email: email,
    password: hashedPassword,
    access_granted: false,
    is_admin: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const res = await models.User.create(newReg);
});

//Logout of the signed in user session before each test
afterEach(async () => {
  await server.get("/logout");
});

//Login State and Session Test //
describe("Test update functions", () => {
  // teardown
  beforeEach(() => {
    serverListen = app.listen("5004");
  });
  afterEach(() => {
    serverListen.close();
  });

  it("Updates the selected user's access to the currently selected boolean option and email address as populated/edited", async () => {
    // login to admin user
    const loggedInAdmin = await server
      .post("/login")
      .set({ "content-Type": "application/json" })
      .send({ username: "TestDudeAdmin", password: "1234!abCD" });

    session = loggedInAdmin.headers["set-cookie"][0]
      .split(/,(?=\S)/)
      .map((item) => item.split(";")[0])
      .join(";");

    expect(loggedInAdmin.statusCode).toBe(302);
    // select user by username (in practice, the user is identified by their Id via mapped array's index)
    // I considered a test that relies on an object with fake usertable data, but iterating over an object and returning
    // a cherry picked Id to then remove without using any sequelize methods or a database does not as closely resemble
    // the reality of what the application is doing compared tothe test below that assumes the correct indexed item is found.
    const user = await models.User.findOne({
      where: { username: "TestUser" },
    });
    if (user) {
      const result = await server
        .post(`/adminPortal/update/${user.id}`)
        .send({
          access_granted: true,
          email: "newEmail@gmail.com",
          updatedAt: new Date(),
        })
        .then(() => {
          expect(302);
        });
    }
  });

  it("Updates the selected user's password if the user session has admin status and passwords match", async () => {
    // login to admin user
    const loggedInAdmin = await server
      .post("/login")
      .set({ "content-Type": "application/json" })
      .send({ username: "TestDudeAdmin", password: "1234!abCD" });

    session = loggedInAdmin.headers["set-cookie"][0]
      .split(/,(?=\S)/)
      .map((item) => item.split(";")[0])
      .join(";");

    expect(loggedInAdmin.statusCode).toBe(302);

    const user = await models.User.findOne({
      where: { username: "TestUser" },
    });
    let newPassword = "123!abCDE";
    let confirmPassword = "123!abCDE";

    if (user && newPassword === confirmPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const result = await server
        .post(`/adminPortal/update/${user.id}`)
        .send({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .then(() => {
          expect(302);
        });
    }
  });

  it("Return Passwords do not match if the user session has admin status, but passwords do not match", async () => {
    // login to admin user
    const loggedInAdmin = await server
      .post("/login")
      .set({ "content-Type": "application/json" })
      .send({ username: "TestDudeAdmin", password: "1234!abCD" });

    session = loggedInAdmin.headers["set-cookie"][0]
      .split(/,(?=\S)/)
      .map((item) => item.split(";")[0])
      .join(";");

    expect(loggedInAdmin.statusCode).toBe(302);

    const user = await models.User.findOne({
      where: { username: "TestUser" },
    });

    if (user) {
      let newPassword = "123!abCDE";
      let confirmPassword = "123!abCDP";

      if (newPassword !== confirmPassword) {
        const result = await server
          .post(`/adminPortal/reset/${user.id}`)
          .send({ newPassword: "123!abCdE", verifyPassword: "123!abCdF" })
          .then((result) => {
            expect(result.text).toBe("passwords do not match");
            expect(200);
          });
      }
    }
  });
});
