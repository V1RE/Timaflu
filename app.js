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
  getProducts(function(products) {
    res.render("inkoop", {
      title: "Inkoop",
      data: res.locals.data,
      products: products
    });
  });
});

app.get("/inkoop/:idProduct", function(req, res) {
  getProduct(req.params.idProduct, function(product) {
    res.render("inkoopproduct", {
      title: "Inkoop",
      data: res.locals.data,
      product: product[0]
    });
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

function getProducts(next) {
  db.query(
    "SELECT p.Artikelnummer, p.Productnaam, v.Huidige_voorraad as Voorraad, v.Minimum_voorraad as MinVoorraad, p.idProduct FROM nmentink_db2.voorraad AS v INNER JOIN nmentink_db2.product AS p ON p.idProduct = v.idProduct;",
    function(err, res) {
      next(res);
    }
  );
}

function getProduct(idProduct, next) {
  if (idProduct.match(/^[0-9]*$/)) {
    db.query(
      "SELECT p.Productnaam, p.Artikelnummer, p.Lange_omschrijving, p.Korte_omschrijving, ROUND((v.Huidige_voorraad / v.Maximum_voorraad) * 100) AS BezettingsGraad, v.Huidige_voorraad, v.Maximum_voorraad, v.Minimum_voorraad FROM nmentink_db2.voorraad AS v INNER JOIN nmentink_db2.product AS p ON p.idProduct = v.idProduct WHERE p.idProduct = " +
        idProduct +
        ";",
      function(err, res) {
        next(res);
      }
    );
  } else {
    throw err;
  }
}
