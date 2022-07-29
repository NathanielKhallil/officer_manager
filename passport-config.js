const bcrypt = require("bcrypt");

const LocalStrategy = require("passport-local").Strategy;
const models = require("./app/models");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },

      async (username, password, done) => {
        try {
          const userFound = await models.User.findOne(
            { where: { username: username } },
            { raw: true }
          );
          if (userFound) {
            if (await bcrypt.compare(password, userFound.password)) {
              done(null, userFound);
            } else {
              return done(null, false, { message: "Incorrect credentials." });
            }
          } else {
            return done(null, false, { message: "Incorrect credentials." });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
};
