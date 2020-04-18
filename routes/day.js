const express = require("express");
const router = express.Router();

// ******************** SCHEDULE MANAGEMENT ********************
module.exports = (databaseHelperFunctions) => {
  // display user's daily meal plan
  router.get("/", (req, res) => {
    const { userId } = req.session;
    const { date } = req.query;

    databaseHelperFunctions
      .getRecipesForDay(userId, date)
      .then((data) => res.json(data))
      .catch((err) => res.status(500).send(err));
  });

  // add recipe to date
  router.post("/add", (req, res) => {
    const { userId } = req.session;
    const { date, recipeId, mealNumber } = req.body;
    databaseHelperFunctions
      .addRecipeToDay(userId, date, recipeId, mealNumber)
      .then((data) => res.json(data))
      .catch((err) => console.error(err));
  });

  // delete recipe from meal plan
  router.post("/delete", (req, res) => {
    const { dateId } = req.body;
    databaseHelperFunctions
      .deleteFromDay(dateId)
      .then((data) => res.json(data))
      .catch((err) => console.error(err));
  });

  // edit recipe in a day
  // router.post("/editRecipe", (req, res) => {
  //   const { dateId } = req.body;
  //   databaseHelperFunctions
  //     .editRecipeFromDay(dateId)
  //     .then((data) => res.json(data))
  //     .catch((err) => console.error(err));
  // });

  return router;
};
