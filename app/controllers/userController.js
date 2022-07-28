const Post = require("../models").User;
exports.show = (request, response) => {
  return User.findByPk(request.params.Id, {})
    .then((user) => {
      if (!user) {
        response.status(404).send({ error: "User not found" });
      } else {
        response.status(200).send(post);
      }
    })
    .catch((error) => response.status(400).send(error));
};
