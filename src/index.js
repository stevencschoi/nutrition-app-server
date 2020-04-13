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

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("../lib/db.js");
const db = new Pool(dbParams);
db.connect();

const databaseHelperFunctions = require("../routes/database")(db);

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
app.put("/register", function (req, res) {});

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

// ******************** FAVOURITES ********************

// Only favourite recipes are displayed on favourites route
app.get("/favourites", (req, res) => {
  console.log("IT WORKS");
  userId = req.session.userId;
  databaseHelperFunctions
    .getFavourites(userId)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).send(err));
});

app.post("/favourites/:id", function (req, res) {
  res.send("Hello, world!");
});

// Change the 404 message modifing the middleware
app.use(function (req, res, next) {
  res.status(404).send("Page not found!)");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
