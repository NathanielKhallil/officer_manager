const request = require("supertest");
const app = require("../app.js");
const server = request.agent(app);
const bcrypt = require("bcrypt");
const models = require("../app/models");

let session = null;
let serverListen;

//Create new test user on test database
beforeAll(async () => {
  try {
    const hashedPassword = await bcrypt.hash("1234!abCD", 10);
    const username = "TestDudeMatters";
    const email = "TestDudeMatters@thedude.com";

    let newReg = {
      username: username,
      email: email,
      password: hashedPassword,
      access_granted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const res = await models.User.create(newReg);
    console.log(res);
  } catch (e) {
    console.log(e);
  }
});

// Login to user with access_granted

beforeAll(async () => {
  const loggedIn = await server
    .post("/login")
    .set({ "content-Type": "application/json" })
    .send({ username: "TestDudeMatters", password: "1234!abCD" });

  session = loggedIn.headers["set-cookie"][0]
    .split(/,(?=\S)/)
    .map((item) => item.split(";")[0])
    .join(";");

  expect(loggedIn.statusCode).toBe(302);
});

describe("Matters functions add, update, and remove matters", () => {
  // teardown
  beforeEach(() => {
    serverListen = app.listen("5001"); //specify different port to avoid port already in use
  });
  afterEach(() => {
    serverListen.close();
  });

  it("It adds a new matter", async () => {
    //create new matter
    const matterNum = 5000;
    const notes = "Test notes";

    const result = await server.post("/matters").set("Cookie", session).send({
      matterNum: matterNum,
      notes: notes,
    });
    // console.log(JSON.parse(JSON.stringify(result.text)));
  });

  // The application iterates over the table of matters associated with the session user and identifies the appropriate matters id
  // to delete at the time when it is rendered from the .ejs file. In practice/production, the matter id associated with each user
  // will not be predictable outside of sequential numbering. Therefore, this test is limited in scope by assuming the only matter
  // created is the matching iterated matter id for the user's selection.

  it("updates the notes, undertakings_remaining and s_of_c_served field of the selected matter", async () => {
    const matter = await models.Matters.findOne({
      where: { id: 1 },
    });

    const matterId = await matter.id;

    await server
      .post(`/matters/update/${matterId}`)
      .send({
        notes: "Updated notes",
        undertakings_remaining: 5,
        s_of_c_served: true,
      })
      .expect(302);
  });

  // The application iterates over the table of matters associated with the session user and identifies the appropriate matters id
  // to delete at the time when it is rendered from the .ejs file. In practice/production, the matter id associated with each user
  // will not be predictable outside of sequential numbering. Therefore, this test is limited in scope by assuming the only matter
  // created is the matching iterated matter id for the user's selection.

  it("Fails to delete the matter associated with the rendered, iterated id if is_admin is false", async () => {
    const matter = await models.Matters.findOne({
      where: { id: 1 },
    });

    const matterId = await matter.id;
    const result = await server.post(`/matters/delete/${matterId}`).expect(200);
    expect(result.text).toBe("You must be an Administrator to delete matters.");
  });
});
