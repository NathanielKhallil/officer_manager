const request = require("supertest");
const app = require("../app.js");

describe("Index page", () => {
  it("should return a successful response", async () => {
    const res = request(app).get("/");
    expect(res.statusCode).toEqual(200);
  });
});
