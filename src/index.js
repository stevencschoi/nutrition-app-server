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
// app.get("/displayUserData", (req, res) => {
//   const { userId } = req.session;

//   databaseHelperFunctions
//     .displayUserData(userId, followId)
//     .then((data) => res.json(data))
//     .catch((err) => res.status(500).send(err));
// });

// ******************** FAVOURITES ********************

// display user's favourite recipes
app.get("/favourites", (req, res) => {
  const { userId } = req.session;
  databaseHelperFunctions
    .getFavourites(userId)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

app.post("/addToFavourites", function (req, res) {
  const { userId } = req.session;
  const { recipeName } = req.body;

  databaseHelperFunctions
    .addToFavourites(userId, recipeName)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

app.post("/deleteFavourite", (req, res) => {
  const { userId } = req.session;
  const { favId } = req.body;
  databaseHelperFunctions
    .deleteFavourite(favId)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

// ******************** DAY SLOT MANAGEMENT ********************
// display user's daily meal plan
app.get("/day", (req, res) => {
  const { userId } = req.session;
  const { date } = req.query;
  console.log("user_id:", userId, "date", date);
  databaseHelperFunctions
    .getSlotsForDay(userId, date)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

// add recipe to date
app.post("/addRecipe", (req, res) => {
  const { userId } = req.session;
  const { date, recipeName, image, mealNumber } = req.query;
  console.log(
    "date",
    date,
    "recipeName",
    recipeName,
    "image",
    image,
    "mealNumber:",
    mealNumber
  );
  databaseHelperFunctions
    .addRecipe(userId, date, recipeName, image, mealNumber)
    .then((data) => res.json(data))
    .catch((err) => console.error(err));
});

// add recipe slot to meal plan
app.post("/addSlot", (req, res) => {
  const { date } = req.body;
  databaseHelperFunctions
    .addSlot(date)
    .then((data) => res.json(data))
    .catch((err) => console.error(err));
});

// delete recipe slot from meal plan
app.delete("/deleteSlot", (req, res) => {
  const { slotId, date } = req.body;
  databaseHelperFunctions
    .deleteSlot(slotId, date)
    .then((data) => res.json(data))
    .catch((err) => console.error(err));
});
// ******************** RECIPE SLOT MANAGEMENT ********************

// edit recipe in a time slot
app.post("/editSlot", (req, res) => {
  const { slotId, recipeId } = req.body;
  databaseHelperFunctions
    .editSlot(slotId, recipeId)
    .then((data) => res.json(data))
    .catch((err) => console.error(err));
});

// delete recipe from time slot
app.delete("/deleteFromSlot", (req, res) => {
  const { dateId } = req.query;
  console.log(dateId);
  databaseHelperFunctions
    .deleteFromSlot(dateId)
    .then((data) => res.json(data))
    .catch((err) => console.error(err));
});

// app.post("/addFavToDate", (req, res) => {
//   const { userId, favId } = req.body;
//   databaseHelperFunctions
//     .addFaveToDate(userId, favId)
//     .then((data) => res.json(data))
//     .catch((err) => console.error(err));
// });

// Change the 404 message modifing the middleware
app.use(function (req, res, next) {
  res.status(404).send("Page not found!)");
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
