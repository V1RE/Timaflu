const express = require("express");
const mysql = require("mysql");

const app = express();
app.set("view engine", "ejs");

const port = process.env.PORT || 2300;

const db = mysql.createConnection({
  host: "databases.aii.avans.nl",
  user: "nmentink",
  password: "toor"
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log("Connected to database");
});
global.db = db;

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

app.use("/public", express.static(__dirname + "/public"));

// Page rendering
app.get("/", (req, res) => {
  res.render("index", { title: "Timaflu - Home" });
});

app.get("/inkoop", (req, res) => {
  res.render("inkoop", { title: "Timaflu - Home" });
});
