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

describe("Todo/task functions add, update, and remove todos", () => {
  // teardown
  beforeEach(() => {
    serverListen = app.listen("5002"); //specify different port to avoid port already in use
  });
  afterEach(() => {
    serverListen.close();
  });

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

  it("updates the content field of the todo associated with the user Id", async () => {
    const user = await models.User.findOne({
      where: { username: "TestDudeTodos" },
    });

    const userId = await user.id;

    await server
      .post(`/todos/update/${userId}`)
      .send({ content: "Updated content" })
      .expect(302);

    const foreignKey = await models.Todos.findOne({
      where: { userId: userId },
    });
    console.log(foreignKey);
  });

  // Application iterates over the table of todos associated with the session user and identifies the appropriate todo id
  // to delete at the time it is rendered from the .ejs file. the actual id in the database will not be sequential per user
  // therefore, this test is limited in scope by assuming the only todo created is a matching todo id for the user's selection
  it("deletes the todo associated with the user Id", async () => {
    const user = await models.User.findOne({
      where: { username: "TestDudeTodos" },
    });
    const todo = await models.Todos.findOne({
      where: { userId: user.id },
    });

    const todoId = await todo.id;
    await server.post(`/todos/delete/${todoId}`).expect(302);
  });
});
