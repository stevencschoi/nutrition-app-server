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
  // console.log("THis", req.body)
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
  // const { userId } = req.session;
  console.log("Req body", req.body);
  const { favId } = req.body;
  // console.log("userId:", userId, "favId:", favId);
  databaseHelperFunctions
    .deleteFavourite(favId)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

// ******************** DAY SLOT MANAGEMENT ********************
// display user's daily meal plan
app.get("/day", (req, res) => {
  const { dateId } = req.body;
  databaseHelperFunctions
    .getSlotsForDay(dateId)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

// add recipe slot to meal plan
app.post("/addSlot", (req, res) => {
  const { dateId } = req.body;
  databaseHelperFunctions
    .addSlot(dateId)
    .then((data) => res.json(data))
    .catch((err) => console.error(err));
});

// delete recipe slot from meal plan
app.delete("/deleteSlot", (req, res) => {
  const { slotId, dateId } = req.body;
  databaseHelperFunctions
    .deleteSlot(slotId, dateId)
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
  const { slotId, dateId } = req.body;
  databaseHelperFunctions
    .deleteFromSlot(slotId, dateId)
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
