const request = require("supertest");
const app = require("../app.js");
const server = request.agent(app);
const bcrypt = require("bcrypt");
const models = require("../app/models");

let session = null;

//Create new test user on test database
beforeAll(async () => {
  try {
    const hashedPassword = await bcrypt.hash("1234!abCD", 10);
    const username = "TestDudeTodos";
    const email = "TestDudeTodos@thedude.com";

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
    .send({ username: "TestDudeTodos", password: "1234!abCD" });

  session = loggedIn.headers["set-cookie"][0]
    .split(/,(?=\S)/)
    .map((item) => item.split(";")[0])
    .join(";");

  expect(loggedIn.statusCode).toBe(302);
});

//clean up the model when finished test block
afterAll(async () => {
  try {
    await models.User.destroy({
      where: { username: "TestDudeTodos" },
    });
  } catch (e) {
    console.log(e);
  }
});

describe("Todo/task functions add, update, and remove todos", () => {
  it("It adds a new todo", async () => {
    const user = await models.User.findOne({
      where: { username: "TestDudeTodos" },
    });
    const userId = await user.id;

    //create new todos
    const title = "Test Title";
    const content = "Test Content";

    const result = await server
      .post("/todos")
      .set("Cookie", session)
      .send({ title: title, content: content, userId: userId });
    console.log(JSON.parse(JSON.stringify(result.text)));
  });

  it("deletes the todo associated with the user Id", async () => {
    const user = await models.User.findOne({
      where: { username: "TestDudeTodos" },
    });

    const userId = await user.id;

    await server.post(`/todos/delete/${userId}`).expect(302);
  });
});
