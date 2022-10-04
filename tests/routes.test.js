const request = require("supertest");
const app = require("../app.js");
const server = request.agent(app);
const bcrypt = require("bcrypt");
const models = require("../app/models");

let session = null;

//Create new test user on test database
beforeAll(async () => {
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
});

afterEach(async () => {
  await server.get("/logout");
});

//clean up the model when finished test block
afterAll(async () => {
  await models.User.destroy({ where: { username: "TestDude" } });
});

//Login State and Session Test //
describe("Confirms session is functioning and recognizing login state", () => {
  it("url that requires user to be logged in", async () => {
    const response = await server
      .post("/login")
      .set({ "content-Type": "application/json" })
      .send({ username: "TestDude", password: "1234!abCD" });

    session = response.headers["set-cookie"][0]
      .split(/,(?=\S)/)
      .map((item) => item.split(";")[0])
      .join(";");

    expect(response.status).toEqual(302);
    await server.get("/userPortal").expect(200);
  });
});

//INDEX route //
describe("should return successful response", () => {
  it("should return a successful response", async () => {
    const response = await server.get("/");

    expect(response.statusCode).toEqual(200);
  });
});

// USERPORTAL route

describe("User Portal route", () => {
  it("redirects user to login page if not logged in", async () => {
    await server.get("/userPortal").expect(302);
  });
});

// TODOS route

describe("Todos route", () => {
  it("It responds with a message indicating no permission to access the page if not logged in or access_granted is false", async () => {
    const result = await server.get("/todos");
    expect(result.statusCode).toBe(200);

    // console.log(JSON.parse(JSON.stringify(result)));
    expect(result.text).toBe(
      "You do not have permission to view this page. Contact the Administrator."
    ); //check response text for when user.req is undefined
  });

  it("successfully reaches the todos page when logged in", async () => {
    const response = await server
      .post("/login")
      .set({ "content-Type": "application/json" })
      .send({ username: "TestDude", password: "1234!abCD" });

    session = response.headers["set-cookie"][0]
      .split(/,(?=\S)/)
      .map((item) => item.split(";")[0])
      .join(";");

    const result = await server.get("/todos");

    expect(result.status).toEqual(200);
  });
});

// MATTERS route

describe("Matters route", () => {
  it("It responds with a message indicating no permission to access the page if not logged in or access_granted is false", async () => {
    const result = await server.get("/matters");
    expect(result.statusCode).toBe(200);

    // console.log(JSON.parse(JSON.stringify(result)));
    expect(result.text).toBe(
      "You do not have permission to view this page. Contact the Administrator."
    ); //check response text for when user.req is undefined
  });

  it("successfully reaches the matters page when logged in", async () => {
    const response = await server
      .post("/login")
      .set({ "content-Type": "application/json" })
      .send({ username: "TestDude", password: "1234!abCD" });

    session = response.headers["set-cookie"][0]
      .split(/,(?=\S)/)
      .map((item) => item.split(";")[0])
      .join(";");

    expect(response.status).toEqual(302);

    await server.get("/matters").expect(200);
  });
});

// UserProfile route

// Appointments route

describe("Appointments route", () => {
  it("successfully reaches the appointments page", async () => {
    const response = await server
      .post("/login")
      .set({ "content-Type": "application/json" })
      .send({ username: "TestDude", password: "1234!abCD" });

    session = response.headers["set-cookie"][0]
      .split(/,(?=\S)/)
      .map((item) => item.split(";")[0])
      .join(";");
    await server.get("/appointments").expect(200);
  });
});

// FILES route

// REGISTER route

// Admin route

describe("Admin route", () => {
  it("fails to reach the adminPortal page when not logged in with valid credentials", async () => {
    await server
      .get("/adminPortal")
      .expect(200)
      .then((result) => {
        expect(result.text).toBe(
          "You do not have permission to view this page."
        );
      });
  });
});
