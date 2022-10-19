const request = require("supertest");
const app = require("../app.js");
const server = request.agent(app);

let serverListen;

describe("Tests the registration end point to ensure new account creation is functioning as intended", () => {
  // teardown
  beforeEach(() => {
    serverListen = app.listen("5005");
  });
  afterEach(() => {
    serverListen.close();
  });

  it("fails to create a new user account if the user enters a password that does not meet the designated criteria", async () => {
    await server
      .post("/register")
      .set({ "content-Type": "application/json" })
      .send({
        username: "Peter",
        password: "12345abc",
        email: "newGuyPeter@gmail.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .then((result) => {
        expect(result.text).toBe(
          "Passwords must be alphanumeric and contain at least one lowercase and uppercase alphabetical letter and one symbol."
        );
      });
  });
  it("creates a new user account if the user enters a password that meets the designated criteria", async () => {
    const result = await server
      .post("/register")
      .set({ "content-Type": "application/json" })
      .send({
        username: "Peter",
        password: "12345!abCD",
        email: "newGuyPeter@gmail.com",
      });
    console.log(result.text);
    expect(result.statusCode).toBe(302);
    expect(result.text).toBe("Found. Redirecting to /login"); //redirects to login following successful account creation
  });
});
