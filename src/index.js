require("dotenv").config();

const PORT = process.env.PORT || 8008;
const ENV = process.env.ENV || "development";
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const server = require("http").Server(app);
const cookieSession = require("cookie-session");

// web socket for real-time data updating
const WebSocket = require("ws");
const wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
  socket.onmessage = (event) => {
    console.log(`Message Received: ${event.data}`);

    if (event.data === "ping") {
      socket.send(JSON.stringify("pong"));
    }
  };
});

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.

app.use(morgan("dev"));
app.use(cors());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser());

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("../lib/db.js");
const db = new Pool(dbParams);
db.connect();

const databaseHelperFunctions = require("../routes/helpers")(db);

// Using cookies to maintain logged in state
app.use(
  cookieSession({
    name: "session",
    keys: ["key1"],
  })
);

// on the request to root (localhost:8008)
app.get("/", function (req, res) {
  res.send("We out here!");
});

// ******************** REGISTER, LOGIN, LOGOUT ********************
app.put("/register", function (req, res) {
  const { username, name, email, password, avatar } = req.body;
  databaseHelperFunctions
    .register(username, name, email, password, avatar)
    .then((data) => res.json(data))
    .catch((err) => console.error(err));
});

app.post("/login", (req, res) => {
  const { userId } = req.body;
  databaseHelperFunctions
    .login(userId)
    .then((user) => {
      console.log(user[0].id);
      req.session.userId = user[0].id;
      res.json(user[0]);
    })
    .catch((err) => res.send(err));
});

app.post("/logout", (req, res) => {
  console.log("hitting logout route");
  req.session = null;
  res.send({});
});

// ******************** FOLLOWING USERS ********************

app.get("/getAllUsers", (req, res) => {
  databaseHelperFunctions
    .getAllUsers()
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err))
});

// show users following
app.get("/following", (req, res) => {
  const { userId } = req.session;
  databaseHelperFunctions
    .getFollowingUsers(userId)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

// search for a particular user to follow
app.get("/searchForUser", (req, res) => {
  const { userId } = req.session;
  const { username } = req.query;

  databaseHelperFunctions
    .searchForUser(userId, username)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

// add user to following
app.post("/addUserToFollowing", (req, res) => {
  const { userId } = req.session;
  const { followId } = req.body;

  databaseHelperFunctions
    .addUserToFollowing(userId, followId)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

//delete user from following
app.delete("/removeUserFromFollowing", (req, res) => {
  const { userId } = req.session;
  const { followId } = req.body;

  databaseHelperFunctions
    .removeUserFromFollowing(userId, followId)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

// *********** SHOW USER DATA ************
app.get("/displayUserData", (req, res) => {
  const { userId } = req.session;
  const {startDate , endDate, userChoice} = req.body
  console.log(startDate , endDate, userChoice)
  databaseHelperFunctions
    .displayUserData(userId, date)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

// ******************** FAVOURITES ********************

// check if recipe exists
app.post("/checkRecipe", (req, res) => {
  // const {
  //   recipeName,
  //   calories,
  //   fatInG,
  //   carbsInG,
  //   proteinInG,
  //   sugarInG,
  //   fiberInG,
  //   cholesterolInMg,
  //   sodiumInMg,
  //   imageUrl,
  // } = req.query;
  // databaseHelperFunctions
  //   .checkRecipe(
  //     recipeName,
  //     calories,
  //     fatInG,
  //     carbsInG,
  //     proteinInG,
  //     sugarInG,
  //     fiberInG,
  //     cholesterolInMg,
  //     sodiumInMg,
  //     imageUrl
  //   )
  const { recipeName } = req.query;
  databaseHelperFunctions
    .checkRecipe(recipeName)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(500).send(err));
});

// display user's favourite recipes
app.get("/favourites", (req, res) => {
  const { userId } = req.session;
  console.log("thissss",userId)
  databaseHelperFunctions
    .getFavourites(userId)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

app.post("/addToFavourites", function (req, res) {
  const { userId } = req.session;
  const { recipeId } = req.body;

  databaseHelperFunctions
    .addToFavourites(userId, recipeId)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

app.post("/deleteFavourite", (req, res) => {
  const { userId } = req.session;
  const { recipeId } = req.body;
  console.log(userId, "recipeId", recipeId);
  databaseHelperFunctions
    .deleteFavourite(userId, recipeId)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

// ******************** DAY SLOT MANAGEMENT ********************
// display user's daily meal plan
app.get("/day", (req, res) => {
  const { userId } = req.session;
  const { date } = req.query;

  databaseHelperFunctions
    .getRecipesForDay(userId, date)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

// add recipe to date
app.post("/addRecipeToDay", (req, res) => {
  const { userId } = req.session;
  const { date, recipeId, mealNumber } = req.body;
  console.log("date", date, "mealNumber:", mealNumber);
  databaseHelperFunctions
    .addRecipeToDay(userId, date, recipeId, mealNumber)
    .then((data) => res.json(data))
    .catch((err) => console.error(err));
});

// delete recipe from meal plan
app.post("/deleteFromDay", (req, res) => {
  const { dateId } = req.body;
  databaseHelperFunctions
    .deleteFromDay(dateId)
    .then((data) => res.json(data))
    .catch((err) => console.error(err));
});

// edit recipe in a day
app.post("/editRecipe", (req, res) => {
  const { dateId } = req.body;
  databaseHelperFunctions
    .editRecipeFromDay(dateId)
    .then((data) => res.json(data))
    .catch((err) => console.error(err));
});

//********** ADD RECIPE */
// add recipe to recipe table
app.post("/addRecipe", (req, res) => {
  const {
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
  } = req.body;

  databaseHelperFunctions
    .addRecipe(
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
    )
    .then((data) => {
      console.log("the data is:", data);
      res.json(data);
    })
    .catch((err) => console.error(err));
});

// Change the 404 message modifing the middleware
app.use(function (req, res, next) {
  res.status(404).send("Page not found!)");
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
