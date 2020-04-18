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

  const getAllUsers = (userId) => {
    return db
      .query(
        `
    SELECT * FROM users WHERE
    NOT id = $1
    `,
        [userId]
      )
      .then((res) => {
        return res.rows;
      })
      .catch((err) => console.error(err));
  };

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
      .then((res) => {
        console.log(res.rows);
        return res.rows;
      })
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

  const toggleFollower = (userId, followId) => {
    return (
      db
        .query(
          `
    INSERT INTO following (user_id, follow_id)
    VALUES ($1, $2)
    `,
          [userId, followId]
        )
        .then((res) => {
          console.log("query result:", res.rows);
          return res.rows;
        })
        // if combination exists in following, delete from following db
        .catch((err) => {
          if (err.code === "23505") {
            return db.query(
              `
              DELETE FROM following
              WHERE
              user_id = $1 AND follow_id = $2
              RETURNING *;
            `,
              [userId, followId]
            );
          }
        })
    );
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

  const displayUserData = (userId, startDate, endDate, userChoice) => {
    return db
      .query(
        `
    SELECT date_trunc('day',date), SUM(recipes.${userChoice}) FROM recipes
    JOIN dates on recipe_id = recipes.id
    WHERE user_id = $1 AND date BETWEEN $2 AND $3
    GROUP BY date_trunc('day', date)
    ORDER BY date_trunc
    `,
        [userId, startDate, endDate]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  // const displayUserDataSum = (userId, date, recipeId) => {
  //   return db
  //     .query(
  //       `
  //   SELECT * FROM recipes
  //   JOIN dates on recipe_id = recipes.id
  //   WHERE user_id = $1 AND date = $2
  //   ORDER BY meal_number
  //   `,
  //       [userId, date]
  //     )
  //     .then((res) => res.rows)
  //     .catch((err) => console.error(err));
  // };

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
        `SELECT * FROM recipes
        JOIN dates ON recipes.id = recipe_id
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

  const editRecipeFromDay = (dateId, recipeId) => {
    console.log(`dateId ${dateId}, recipe ${recipeId}`);
    return db
      .query(
        `
        SELECT dates.id, recipe_id,
        REPLACE(recipe_id, $2)
        FROM dates
        WHERE dates.id = $1
        RETURNING *;
      `,
        [dateId, recipe_id]
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
    getAllUsers,
    getFollowingUsers,
    searchForUser,
    toggleFollower,
    removeUserFromFollowing,
    displayUserData,
    getFavourites,
    addToFavourites,
    deleteFavourite,
    getRecipesForDay,
    editRecipeFromDay,
    deleteFromDay,
    addRecipeToDay,
    addRecipe,
    checkRecipe,
  };
};
