const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const server = require("http").Server(app);
// const cookieSession = require('cookie-session');

const PORT = process.env.PORT || 8008;
app.use(cors());

// on the request to root (localhost:8008)
app.get("/", function(req, res) {
  res.send("Hello, world!");
});

// Change the 404 message modifing the middleware
app.use(function(req, res, next) {
  res.status(404).send("Page not found!)");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
