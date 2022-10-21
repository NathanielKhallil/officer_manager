const request = require("supertest");
const app = require("../app.js");
const server = request.agent(app);
const bcrypt = require("bcrypt");
const models = require("../app/models");

// Unit

// considering mocking database for better coverage despite integration tests accessing an actual test database *WIP*
describe("Tests users table related features", () => {
  it("finds the specific user requested", () => {
    const users = [
      { id: 1, username: "Jake", password: "12345Ab!" },
      { id: 2, username: "Tom", password: "12345Ac!" },
    ];
    const foundUser = users[0].id;
    expect(foundUser).toBe(1);
  });

  describe("Tests password change related features", () => {
    it("changes a specific user's password by Id if the new password matches the verified password and the required pattern is satisfied", () => {
      const users = [
        { id: 1, username: "Jake", password: "12345Ab!" },
        { id: 2, username: "Tom", password: "12345Ac!" },
      ];
      const newPassword = "1245AbC!";
      const verifiedPassword = "1245AbC!";
      if (
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,32}$/.test(
          newPassword
        ) &&
        newPassword === verifiedPassword
      ) {
        users[0].password = newPassword;
        expect(users[0].password).toBe("1245AbC!");
      }
    });

    it("fails to change the specific user's password if the new password does not match the verified password", () => {
      const users = [
        { id: 1, username: "Jake", password: "12345Ab!" },
        { id: 2, username: "Tom", password: "12345Ac!" },
      ];
      const newPassword = "1245AbD!";
      const verifiedPassword = "1245AbE!";
      if (
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,32}$/.test(
          newPassword
        ) &&
        newPassword !== verifiedPassword
      ) {
        expect(users[0].password).toBe("12345Ab!");
      }
    });
  });

  describe("Tests REGEX pattern requirements", () => {
    it("checks the REGEX pattern for potential edge cases by iterating over a list of passwords that should fail", () => {
      const passwordList = [
        "1245abd!", // no uppercase letter
        "1245AbD1", // no symbol
        "1245ADC$", // no lowercase letter
        "!!!^1234", // no lowercase or uppercase letter
        "AbCdEfGh", // no symbol or number
        "abcDe!h", // under 8 chars
        "1245678", // only numbers
        "%^$#$%^!", // only symbols
        "1245abd!", // only lower case
        "1245ABD!", // only uppercase
      ];

      passwordList.forEach(checkPattern);

      function checkPattern(item) {
        expect(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,32}$/.test(
            item
          )
        ).toBeFalsy();
      }
    });

    it("checks the REGEX pattern for successful pattrn cases by iterating over a list of passwords that should succeed", () => {
      const passwordList = ["1245Abd!", "aBcD123$", "&^%$#aB1", "ABCd^123"];

      passwordList.forEach(checkPattern);

      function checkPattern(item) {
        expect(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,32}$/.test(
            item
          )
        ).toBeTruthy();
      }
    });
  });
});

// Integeration

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
