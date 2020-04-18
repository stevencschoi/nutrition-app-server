const express = require("express");
const router = express.Router();

// ******************** FOLLOWING USERS ********************
module.exports = (databaseHelperFunctions) => {
  // show all users in carousel
  router.get("/all", (req, res) => {
    const { userId } = req.session;
    databaseHelperFunctions
      .getAllUsers(userId)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => res.status(500).send(err));
  });

  // show users following
  router.get("/following", (req, res) => {
    const { userId } = req.session;
    databaseHelperFunctions
      .getFollowingUsers(userId)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).send(err));
  });

  // add user to following
  router.post("/add", (req, res) => {
    const { userId } = req.session;
    const { followId } = req.query;

    databaseHelperFunctions
      .toggleFollower(userId, followId)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).send(err));
  });

  // search for a particular user to follow
  router.get("/search", (req, res) => {
    const { userId } = req.session;
    const { username } = req.query;

    databaseHelperFunctions
      .searchForUser(userId, username)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).send(err));
  });

  return router;
};
