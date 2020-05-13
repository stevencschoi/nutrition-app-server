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
    const { followId } = req.body;

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

  // *********** SHOW USER DATA ************
  router.get("/data", (req, res) => {
    const { userId } = req.session;
    const { startDate, endDate, userChoice } = req.query;
    console.log(userId, startDate, endDate, userChoice)
    // control user inputs into sql query
    const columnName = {
      Calories: "calories",
      Fat: "fat_in_g",
      Carbohydrates: "carbs_in_g",
      Fiber: "fiber_in_g",
      Sugar: "sugar_in_g",
      Protein: "protein_in_g",
      Cholesterol: "cholesterol_in_mg",
      Sodium: "sodium_in_mg",
    };

    // throw error if userChoice is not from object
    if (!columnName[userChoice]) {
      res.status(400);
    } else {
      databaseHelperFunctions
        .displayUserData(
          userId,
          startDate,
          endDate,
          columnName[userChoice],
          true
        )
        .then((data) => res.json(data))
        .catch((err) => res.status(500).send(err));
    }
  });


  // *********** SHOW FOLLOWING USER USERNAME ************
  router.get("/followingusername", (req, res) => {
    const { userId } = req.query;
    console.log("YOOOOOO", userId)
    databaseHelperFunctions
      .getFollowingUsername(userId)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).send(err));
  })

  return router;
};