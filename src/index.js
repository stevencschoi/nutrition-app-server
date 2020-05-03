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
const bcrypt = require("bcrypt");
const io = require("socket.io")(server);

// listen for socket connection
io.on("connection", (client) => {
  console.log("A user connected");
  // when receiving this message type, emit update message
  client.on("new", () => {
    io.emit("update");
  });
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
const dayRoutes = require("../routes/day");

app.use("/user", userRoutes(databaseHelperFunctions));
app.use("/favourites", favRoutes(databaseHelperFunctions));
app.use("/recipe", recipeRoutes(databaseHelperFunctions));
app.use("/day", dayRoutes(databaseHelperFunctions));

// ******************** REGISTER, LOGIN, LOGOUT ********************
app.put("/register", function (req, res) {
  // create & store user info
  // conditionals if empty strings entered
  if (
    req.body.username === "" ||
    req.body.email === "" ||
    req.body.password === ""
  ) {
    return res.status(400).send("Bad request");
  } else {
    let { username, first_name, last_name, email, password, avatar } = req.body;
    console.log("req.body:", req.body);
    if (!avatar) {
      avatar =
        "https://cdn.dribbble.com/users/2319/screenshots/1658343/knife_and_fork.png";
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    console.log("Hashed password:", hashedPassword);

    databaseHelperFunctions
      .register(username, first_name, last_name, email, password, avatar)
      // .register(username, first_name, last_name, email, hashedPassword, avatar)
      .then((data) => res.json(data))
      .catch((err) => console.error(err));
  }
});

app.post("/login", (req, res) => {
  const { userId, password } = req.body;

  databaseHelperFunctions
    .login(userId, password)
    .then((user) => {
      if (!user[0]) {
        // if user does not exist, throw error
        return res.status(400).send("Bad response");
      } else {
        console.log(
          "From login: User ID",
          user[0].id,
          "First name",
          user[0].first_name,
          "Password",
          user[0].password
        );
        // if (bcrypt.compareSync(password, user[0].password)) {
        req.session.userId = user[0].id;
        req.session.first_name = user[0].first_name;
        res.json(user[0]);
        // }
      }
    })
    .catch((err) => res.send(err));
});

app.post("/logout", (req, res) => {
  console.log("hitting logout route");
  req.session = null;
  res.redirect("/");
});

// Change the 404 message modifing the middleware
app.use(function (req, res, next) {
  res.status(404).send("Page not found!)");
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
