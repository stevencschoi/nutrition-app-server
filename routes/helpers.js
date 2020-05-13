module.exports = (db) => {
  // *********** HELPER FUNCTIONS FOR USER ROUTES ************
  const verifyUser = (userId) => {
    return db
      .query(
        `
    SELECT * FROM users
    WHERE username = $1`,
        [username]
      )
      .then((res) => {
        res.rows[0] ? true : false;
      })
      .catch((err) => console.error(err));
  };

  const register = (
    username,
    first_name,
    last_name,
    email,
    password,
    avatar
  ) => {
    return db
      .query(
        `INSERT INTO users (username, first_name, last_name, email, password, avatar)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [username, first_name, last_name, email, password, avatar]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  const login = (userId, password) => {
    return db
      .query(
        `
      SELECT * FROM users
      WHERE username = $1
      AND password = $2
      `,
        [userId, password]
      )
      .then((res) => {
        return res.rows;
      })
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
    SELECT follow_id FROM following
    WHERE user_id = $1
    `,
        [userId]
      )
      .then((res) => {
        return res.rows;
      })
      .catch((err) => console.error(err));
  };

  // get following username
  const getFollowingUsername = (userId) => {
    return db
      .query(
        `
          SELECT username
          FROM users
          WHERE id = $1
        `,
        [userId]
      )
      .then((res) => {
        return res.rows;
      })
      .catch((err) => console.error(err));
  };

  // search for user
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

  // toggle following user data
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

  // *********** HELPER FUNCTION TO SHOW USER DATA ************
  const displayUserData = (
    userId,
    startDate,
    endDate,
    userChoice,
    getFollowers
  ) => {
    // receive getFollowers (boolean) - if true, getFollowers false get only user
    // based on getFollowers result, call getFollowers
    return db
      // WITH creates temporary tables current_data and current_username that exist for just one query
      // generate_series creates a helper table to fill in missing rows if data does not exist for a certain day
      // COALESCE accepts an unlimited number of arguments and returns the first argument that is not null
      // If all arguments are null, the COALESCE will return null.
      .query(
        `
          WITH current_data AS(
            SELECT
              date_trunc('day', date),
              users.username,
              SUM(recipes.${ userChoice }) 
            FROM recipes
            JOIN dates on recipe_id = recipes.id
            JOIN users on user_id = users.id
            WHERE user_id = $1 AND date BETWEEN $2 AND $3
            GROUP BY date_trunc('day', date), username
            ORDER BY date_trunc
          ), current_username AS(
            SELECT
              users.username
            FROM recipes
            JOIN dates on recipe_id = recipes.id
            JOIN users on user_id = users.id
            WHERE user_id = $1
            GROUP BY username
          )

          SELECT 
            a.date_trunc AS date,
            (SELECT * FROM current_username) AS username,
            COALESCE(b.sum, 0) AS sum
          FROM(
            SELECT generate_series(
              $2:: timestamp,
              $3,
              '1 day'):: date AS date_trunc
          FROM current_data) a
            LEFT JOIN current_data b USING(date_trunc)
            GROUP BY a.date_trunc, username, b.sum
            ORDER BY a.date_trunc
        `,
        [userId, startDate, endDate]
      )
      .then(async (res) => {
        const followers =
          getFollowers &&
          (await getFollowingUsers(userId).then((result) =>
            Promise.all(
              result.map((follower) =>
                displayUserData(
                  follower.follow_id,
                  startDate,
                  endDate,
                  userChoice
                )
              )
            )
          ));
        return { userData: res.rows, followers, userId }; // returned object includes user data AND followers
      })
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
    imageUrl,
    recipe_yield
  ) => {
    return db
      .query(
        `INSERT INTO recipes (name, calories, fat_in_g, carbs_in_g, protein_in_g, sugar_in_g, fiber_in_g, cholesterol_in_mg, sodium_in_mg, image_url, recipe_yield)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
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
          recipe_yield,
        ]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  return {
    verifyUser,
    register,
    login,
    getAllUsers,
    getFollowingUsers,
    getFollowingUsername,
    searchForUser,
    toggleFollower,
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
