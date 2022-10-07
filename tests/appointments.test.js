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
    const username = "TestDudeAppointments";
    const email = "TestDudeAppointments@thedude.com";

    let newReg = {
      username: username,
      email: email,
      password: hashedPassword,
      access_granted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const res = await models.User.create(newReg);
  } catch (e) {
    console.log(e);
  }
});

// Login to user with access_granted

beforeAll(async () => {
  const loggedIn = await server
    .post("/login")
    .set({ "content-Type": "application/json" })
    .send({ username: "TestDudeAppointments", password: "1234!abCD" });

  session = loggedIn.headers["set-cookie"][0]
    .split(/,(?=\S)/)
    .map((item) => item.split(";")[0])
    .join(";");

  expect(loggedIn.statusCode).toBe(302);
});

describe("Matters functions add, update, and remove matters", () => {
  // teardown
  beforeEach(() => {
    serverListen = app.listen("5003"); //specify different port to avoid port already in use
  });
  afterEach(() => {
    serverListen.close();
  });

  it("It adds a new appointment/deadline", async () => {
    //create new appointment/deadline
    const testTitle = "Test Appointment Title";
    const testPhone = "403-849-0978";
    const testDate = new Date();
    const testTime = "14:00";
    const testNotes = "Test appointment booking";
    const testNewClient = false;

    const result = await server
      .post("/appointments")
      .set("Cookie", session)
      .send({
        title: testTitle,
        phone_num: testPhone,
        date: testDate,
        time: testTime,
        notes: testNotes,
        new_client: testNewClient,
      });
    console.log(JSON.parse(JSON.stringify(result)));
  });

  // it updates appointments/deadlines with the new, altered content
  it("updates the notes, undertakings_remaining and s_of_c_served field of the selected matter", async () => {
    const appointment = await models.Appointments.findOne({
      where: { id: 1 },
    });

    const appointmentId = await appointment.id;

    const result = await server
      .post(`/appointments/update/${appointmentId}`)
      .set("Cookie", session)
      .send({
        title: "updated title",
        phone_num: "555-555-5555",
        date: new Date(),
        time: "08:00",
        notes: "Updated notes for appointment",
        new_client: true,
      })
      .expect(302);
    console.log(JSON.parse(JSON.stringify(result)));
  });

  // it deletes the appointment by its id

  it("updates the notes, undertakings_remaining and s_of_c_served field of the selected matter", async () => {
    const appointment = await models.Appointments.findOne({
      where: { id: 1 },
    });

    const appointmentId = await appointment.id;

    const result = await server
      .post(`/appointments/delete/${appointmentId}`)
      .set("Cookie", session)
      .expect(302);
    console.log(JSON.parse(JSON.stringify(result)));
  });
});
