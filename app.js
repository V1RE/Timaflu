const dotenv = require("dotenv");
const express = require("express");
const mysql = require("mysql");
const path = require("path");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
app.use(cookieParser());
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

app.use("/login", function(req, res, next) {
  next();
});

app.use(/^\/(?!login).*/, function(req, res, next) {
  console.log(req.cookies);
  console.log(req.url);

  var medewerkerID = req.cookies.medewerkerID;
  if (medewerkerID === undefined) {
    res.redirect("/login");
  } else {
    console.log(medewerkerID);
    getMedewerkers(function(medewerkers) {
      curmedewerker = medewerkers.find(function(findmw) {
        return findmw.idWerknemer == req.cookies.medewerkerID;
      });

      if (!curmedewerker) {
        res.clearCookie("medewerkerID");
        res.redirect("/login");
      } else {
        res.locals.data = {
          medewerkers: medewerkers,
          curmedewerker: curmedewerker,
          active: path.normalize(req.path),
          menu: menu
        };
        next();
      }
    });
  }
});

// Login
app.get("/login", (req, res) => {
  getMedewerkers(function(medewerkers) {
    res.render("login", {
      title: "Login",
      medewerkers: medewerkers
    });
  });
});

// Page rendering
app.get("/", (req, res) => {
  res.render("index", {
    title: "Overzicht",
    data: res.locals.data
  });
});

app.get("/inkoop", (req, res) => {
  res.render("inkoop", {
    title: "Inkoop",
    data: res.locals.data
  });
});

var menu = [
  { href: "/", title: "Overzicht", icon: "activity" },
  { href: "/inkoop", title: "Inkoop", icon: "log-in" },
  { href: "/verkoop", title: "Verkoop", icon: "log-out" },
  { href: "/facturering", title: "Facturering", icon: "trending-up" },
  { href: "/magazijn", title: "Magazijn", icon: "package" }
];

function getMedewerkers(next) {
  db.query("select * from nmentink_db2.werknemer", function(err, res) {
    next(res);
  });
}
