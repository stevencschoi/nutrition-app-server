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
      JOIN favourites ON users.id = user_id
      WHERE favourites.user_id = $1
      `,
        [userId]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  const addToFavourites = function (userId, recipeName) {
    console.log(`userId ${userId}, recipeName  ${recipeName}`);
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
        console.log("addToFavourites function",res.rows);
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
  const getSlotsForDay = function (dateId) {
    return db
      .query(
        `SELECT * FROM slots
      WHERE date_id = $1;
    `,
        [dateId]
      )
      .then((res) => res.rows)
      .catch((err) => console.error(err));
  };

  const addSlot = function (dateId) {
    return db
      .query(
        `INSERT INTO slots (date_id)
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
        `DELETE FROM slots
        WHERE slots.id = $1 AND date_id = $2;
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

  const deleteFromSlot = function (slotId, dateId) {
    return db
      .query(
        `
    DELETE FROM slots
    WHERE slots.id = $1 AND date_id = $2;
      `,
        [slotId, dateId]
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
  };
};
