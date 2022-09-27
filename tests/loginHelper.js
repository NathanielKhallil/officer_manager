var superagent = require("superagent");
var agent = superagent.agent();

var testAccount = {
  username: "TestDude",
  password: "1234!abCD",
};

exports.login = function (request, done) {
  request
    .post("/login")
    .send(testAccount)
    .end(function (err, res) {
      if (err) {
        throw err;
      }
      agent.saveCookies(res);
      done(agent);
    });
};
