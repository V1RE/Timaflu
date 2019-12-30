const dotenv = require("dotenv");
const express = require("express");
const mysql = require("mysql");
const path = require("path");

dotenv.config();

const app = express();
app.set("view engine", "ejs");

const port = process.env.PORT || 2300;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
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
  res.render("index", {
    title: "Timaflu - Overzicht",
    menu: menu,
    active: path.normalize(req.path)
  });
});

app.get("/inkoop", (req, res) => {
  res.render("inkoop", {
    title: "Timaflu - Inkoop",
    menu: menu,
    active: path.normalize(req.path)
  });
});

var menu = [
  { href: "/", title: "Overzicht", icon: "activity" },
  { href: "/inkoop", title: "Inkoop", icon: "log-in" },
  { href: "/verkoop", title: "Verkoop", icon: "log-out" },
  { href: "/facturering", title: "Facturering", icon: "trending-up" },
  { href: "/magazijn", title: "Magazijn", icon: "package" }
];
