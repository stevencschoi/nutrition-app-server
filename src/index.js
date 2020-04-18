// load .env data into process.env
require("dotenv").config();

// Web server config
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

app.use(morgan("dev"));
app.use(cors());
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

// Separated routes on functionality
const userRoutes = require("../routes/user");
const favRoutes = require("../routes/favourites");
const recipeRoutes = require("../routes/recipe");

app.use("/user", userRoutes(databaseHelperFunctions));
app.use("/favourites", favRoutes(databaseHelperFunctions));
app.use("/recipe", recipeRoutes(databaseHelperFunctions));

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

// Change the 404 message modifing the middleware
app.use(function (req, res, next) {
  res.status(404).send("Page not found!)");
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
