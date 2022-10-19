const request = require("supertest");
const app = require("../app.js");
const server = request.agent(app);
const bcrypt = require("bcrypt");
const models = require("../app/models");

let session = null;
let serverListen;

// create user to run tests
beforeAll(async () => {
  const hashedPassword = await bcrypt.hash("1234!abCD", 10);
  const username = "TestPersonProfile";
  const email = "TestPersonProfile@testperson.com";

  let newReg = {
    username: username,
    email: email,
    password: hashedPassword,
    access_granted: true, // access is required to test the profile page, but false by default
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const res = await models.User.create(newReg);
});

describe("Tests the password change features for the userProfile route", () => {
  // teardown
  beforeEach(() => {
    serverListen = app.listen("5006");
  });
  afterEach(() => {
    serverListen.close();
  });

  //Logout of the signed in user session before each test
  afterEach(async () => {
    await server.get("/logout");
  });

  it("fails to change a user's password if the user enters a password that does not meet the designated criteria", async () => {
    const response = await server
      .post("/login")
      .set({ "content-Type": "application/json" })
      .send({ username: "TestPersonProfile", password: "1234!abCD" });

    session = response.headers["set-cookie"][0]
      .split(/,(?=\S)/)
      .map((item) => item.split(";")[0])
      .join(";");

    const user = await models.User.findOne({
      where: { username: "TestPersonProfile" },
    });
    if (user) {
      await server
        .post(`/userProfile/update/${user.id}`)
        .set({ "content-Type": "application/json" })
        .send({
          newPassword: "1234abCD",
          verifyPassword: "1234abD",
        })
        .then((result) => {
          expect(result.text).toBe(
            "Passwords must be alphanumeric and contain at least one lowercase and uppercase alphabetical letter and one symbol."
          );
        });
    }
  });

  it("fails to change a user's password if the new password and confirmed password fields do not match", async () => {
    const response = await server
      .post("/login")
      .set({ "content-Type": "application/json" })
      .send({ username: "TestPersonProfile", password: "1234!abCD" });

    session = response.headers["set-cookie"][0]
      .split(/,(?=\S)/)
      .map((item) => item.split(";")[0])
      .join(";");

    const user = await models.User.findOne({
      where: { username: "TestPersonProfile" },
    });
    if (user) {
      await server
        .post(`/userProfile/update/${user.id}`)
        .set({ "content-Type": "application/json" })
        .send({
          newPassword: "1234!abCD",
          verifyPassword: "12345aCD!",
        })
        .then((result) => {
          expect(result.text).toBe(
            "passwords do not match! Use the back button in your browser to try again."
          );
        });
    }
  });

  it("successfully changes a user's password if new password and confirmed password field match", async () => {
    const response = await server
      .post("/login")
      .set({ "content-Type": "application/json" })
      .send({ username: "TestPersonProfile", password: "1234!abCD" });

    session = response.headers["set-cookie"][0]
      .split(/,(?=\S)/)
      .map((item) => item.split(";")[0])
      .join(";");

    const user = await models.User.findOne({
      where: { username: "TestPersonProfile" },
    });

    if (user) {
      await server
        .post(`/userProfile/update/${user.id}`)
        .set({ "content-Type": "application/json" })
        .send({
          newPassword: "123456!abCD",
          verifyPassword: "123456!abCD",
        })
        .then((result) => {
          expect(result.text).toBe("Found. Redirecting to /userPortal");
        });
    }
  });
});
