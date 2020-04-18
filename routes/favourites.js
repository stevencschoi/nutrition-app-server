const express = require("express");
const router = express.Router();

// ******************** FAVOURITES ********************
module.exports = (databaseHelperFunctions) => {
  // display user's favourite recipes
  router.get("/", (req, res) => {
    const { userId } = req.session;
    databaseHelperFunctions
      .getFavourites(userId)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).send(err));
  });

  // add to favourites
  router.post("/add", function (req, res) {
    const { userId } = req.session;
    const { recipeId } = req.body;

    databaseHelperFunctions
      .addToFavourites(userId, recipeId)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).send(err));
  });

  // delete favourite
  router.post("/delete", (req, res) => {
    const { userId } = req.session;
    const { recipeId } = req.body;
    console.log(userId, "recipeId", recipeId);
    databaseHelperFunctions
      .deleteFavourite(userId, recipeId)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).send(err));
  });

  return router;
};
