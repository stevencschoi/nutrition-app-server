module.exports = (db) => {
  // *********** HELPER FUNCTIONS FOR USER ROUTES ************
  const register = () => {
    return db
      .query(
        `INSERT INTO users (username, name, email, password, avatar)
    VALUES ($1, $2, $3, $4, $5)`,
        [username, name, email, password, avatar]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  const login = (userId) => {
    return db
      .query(
        `
      SELECT * FROM users
      WHERE username = $1
      `,
        [userId]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  // *********** HELPER FUNCTIONS FOR FOLLOWING USERS ************
  const getFollowingUsers = (userId) => {
    return db
      .query(
        `
    SELECT * FROM following
    WHERE user_id = $1
    RETURNING *;
    `,
        [userId]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  const searchForUser = (username) => {
    return db
      .query(
        `
      SELECT * FROM users
      WHERE username = $1
      RETURNING *;
      `,
        [username]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  const addUserToFollowing = (userId, followId) => {
    return db
      .query(
        `
    INSERT INTO following (user_id, follow_id)
    VALUES ($1, $2)
    RETURNING *;
    `,
        [userId, followId]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  const removeUserFromFollowing = (userId, followId) => {
    return db
      .query(
        `
    DELETE FROM following
    WHERE user_id = $1 AND follower_id = $2;
      `,
        [userId, followId]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  // *********** HELPER FUNCTION TO SHOW USER DATA ************

  const displayUserData = (userId, date, recipeId) => {
    return db
      .query(
        `
    SELECT * FROM recipes
    JOIN dates on recipe_id = recipe.id
    WHERE user_id = $1 AND date = $2
    `,
        [userId, date]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  // *********** HELPER FUNCTIONS FOR HANDLING FAVOURITES ************
  const getFavourites = (userId) => {
    return db
      .query(
        `
      SELECT * FROM favourites
      JOIN recipes ON recipes.id = recipe_id
      WHERE favourites.user_id = $1
      `,
        [userId]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  const addToFavourites = (userId, recipeId) => {
    return db
      .query(
        `
      INSERT INTO favourites (user_id, recipe_id)
      VALUES ($1, $2)
      RETURNING *;
      `,
        [userId, recipeId]
      )
      .then((res) => {
        console.log("addToFavourites function", res.rows);
        res.rows;
      })
      .catch((err) => {
        // if combination exists in favourites, delete from favourites db
        if (err.code === "23505") {
          return db.query(
            `
                DELETE FROM favourites
                WHERE
                user_id = $1 AND recipe_id = $2
                RETURNING *;
              `,
            [userId, recipeId]
          );
        }
      });
  };

  const deleteFavourite = (userId, recipeId) => {
    return db
      .query(
        `
    DELETE FROM favourites
    WHERE user_id = $1 AND recipe_id = $2`,
        [userId, recipeId]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  // *********** HELPER FUNCTIONS FOR HANDLING CALENDAR ENTRIES ************
  const getRecipesForDay = (userId, date) => {
    return db
      .query(
        `SELECT * FROM dates
      WHERE user_id = $1 AND date = $2
      ORDER BY meal_number;
    `,
        [userId, date]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  const addRecipeToDay = (userId, date, recipeId, mealNumber) => {
    return db
      .query(
        `INSERT INTO dates (user_id, date, recipe_id, meal_number)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
        [userId, date, recipeId, mealNumber]
      )
      .then((res) => {
        console.log(res.rows);
        res.rows;
      })
      .catch((err) => console.error(err));
  };

  const addSlot = (dateId) => {
    return db
      .query(
        `INSERT INTO dates (date_id)
      VALUES ($1)
      RETURNING *;
      `,
        [dateId]
      )
      .then((res) => {
        console.log(res.rows);
        res.rows;
      })
      .catch((err) => console.error(err));
  };

  const deleteSlot = (slotId, dateId) => {
    return db
      .query(
        `DELETE FROM dates
        WHERE dates.id = $1 AND date_id = $2;
      `,
        [slotId, dateId]
      )
      .then((res) => {
        console.log(res.rows);
        res.rows;
      })
      .catch((err) => console.error(err));
  };

  const editRecipeFromDay = (dateId) => {
    console.log(`dateId ${dateId}`);
    return db
      .query(
        `
        SELECT slots.id, recipe_id,
        REPLACE(recipe_id, $2)
        FROM slots
        WHERE slots.id = $1
        RETURNING *;
      `,
        [slotId, recipeId]
      )
      .then((res) => {
        console.log(res.rows);
        res.rows;
      })
      .catch((error) => console.error(error));
  };

  const deleteFromDay = (dateId) => {
    return db
      .query(
        `
    DELETE FROM dates
    WHERE dates.id = $1;
      `,
        [dateId]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  // *********** HELPER FUNCTIONS FOR RECIPE TABLE ************
  // check if recipe exists in database
  const checkRecipe = (recipeName) => {
    return db
      .query(
        `
    SELECT * FROM recipes
    WHERE recipes.name = $1`,
        [recipeName]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  // add recipe to database
  const addRecipe = (
    recipeName,
    calories,
    fatInG,
    carbsInG,
    proteinInG,
    sugarInG,
    fiberInG,
    cholesterolInMg,
    sodiumInMg,
    imageUrl
  ) => {
    return db
      .query(
        `INSERT INTO recipes (name, calories, fat_in_g, carbs_in_g, protein_in_g, sugar_in_g, fiber_in_g, cholesterol_in_mg, sodium_in_mg, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          recipeName,
          calories,
          fatInG,
          carbsInG,
          proteinInG,
          sugarInG,
          fiberInG,
          cholesterolInMg,
          sodiumInMg,
          imageUrl,
        ]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  return {
    register,
    login,
    getFollowingUsers,
    searchForUser,
    addUserToFollowing,
    removeUserFromFollowing,
    displayUserData,
    getFavourites,
    addToFavourites,
    deleteFavourite,
    getRecipesForDay,
    addSlot,
    deleteSlot,
    editRecipeFromDay,
    deleteFromDay,
    addRecipeToDay,
    addRecipe,
    checkRecipe,
  };
};
