module.exports = (db) => {
  // *********** HELPER FUNCTIONS FOR USER ROUTES ************
  const register = function () {
    return db
      .query(
        `INSERT INTO users (username, name, email, password, avatar)
    VALUES ($1, $2, $3, $4, $5)`,
        [username, name, email, password, avatar]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  const login = function (userId) {
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

  // *********** HELPER FUNCTIONS FOR HANDLING FAVOURITES ************
  const getFavourites = function (userId) {
    return db
      .query(
        `
      SELECT * FROM favourites
      WHERE favourites.user_id = $1
      `,
        [userId]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  const addToFavourites = function (userId, recipeName) {
    return db
      .query(
        `
      INSERT INTO favourites (user_id, recipe_name)
      VALUES ($1, $2)
      RETURNING *;
      `,
        [userId, recipeName]
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
                user_id = $1 AND recipe_name = $2
                RETURNING *;
              `,
            [userId, recipeName]
          );
        }
      });
  };

  const deleteFavourite = function (favId) {
    return db
      .query(
        `
    DELETE FROM favourites
    WHERE favourites.id = $1;
      `,
        [favId]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  // *********** HELPER FUNCTIONS FOR HANDLING CALENDAR ENTRIES ************
  const getSlotsForDay = function (userId, date) {
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

  const addRecipe = function (userId, date, recipeName, image, mealNumber) {
    return db
      .query(
        `INSERT INTO dates (user_id, date, recipe_name, image, meal_number)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
        [userId, date, recipeName, image, mealNumber]
      )
      .then((res) => {
        console.log(res.rows);
        res.rows;
      })
      .catch((err) => console.error(err));
  };

  const addSlot = function (dateId) {
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

  const deleteSlot = function (slotId, dateId) {
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

  const editSlot = function (slotId, recipeId) {
    console.log(`slotId ${slotId}, recipeId  ${recipeId}`);
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

  const deleteFromSlot = function (dateId) {
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

  return {
    register,
    login,
    getFavourites,
    addToFavourites,
    deleteFavourite,
    getSlotsForDay,
    addSlot,
    deleteSlot,
    editSlot,
    deleteFromSlot,
    addRecipe,
  };
};
