const dotenv = require("dotenv");
const express = require("express");
const mysql = require("mysql");
const path = require("path");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.urlencoded());
app.set("view engine", "ejs");

const port = process.env.PORT || 2300;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  multipleStatements: true
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
  var medewerkerID = req.cookies.medewerkerID;
  if (medewerkerID === undefined) {
    res.redirect("/login");
  } else {
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
    getFabrikantenForProduct(product[0].Productnaam, function(fabrikanten) {
      res.render("inkoopproduct", {
        title: "Inkoop",
        data: res.locals.data,
        product: product[0],
        fabrikanten: fabrikanten
      });
    });
  });
});

app.get("/verkoop", function(req, res) {
  sort = req.query.s || "k.Bedrijfsnaam";
  order = req.query.o || "asc";
  search = req.query.q || "";
  getKlanten(sort, order, search, function(klanten) {
    res.render("verkoop", {
      title: "Verkoop",
      data: res.locals.data,
      klanten: klanten
    });
  });
});

app.get("/verkoop/:idKlant", function(req, res) {
  getKlant(req.params.idKlant, function(klant) {
    getProducts(function(products) {
      res.render("verkoopklant", {
        title: "Verkoop",
        data: res.locals.data,
        klant: klant[0],
        products: products
      });
    });
  });
});

app.post("/verkoop", function(req, res) {
  console.log(req.body);
  var huisnummer = "" + req.body.adres;
  var d = new Date(),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  db.query(
    "INSERT INTO `nmentink_db2`.`bestelling` (`idklant`, `Datum`, `Bezorg_postcode`, `Bezorg_huisnummer`) VALUES ('" +
      req.body.idKlant +
      "', '" +
      [year, month, day].join("-") +
      "', '" +
      req.body.postcode +
      "', '" +
      huisnummer.split(" ")[huisnummer.split(" ").length - 1] +
      "');",
    function(err, resp) {
      var query =
        "INSERT INTO `nmentink_db2`.`factuur` (`idBestelling`, `idWerknemer`, `Factuurdatum`, `Afleveradres`, `Betaaladres`) VALUES ('15', '" +
        req.cookies.medewerkerID +
        "', '" +
        [year, month, day].join("-") +
        "', '" +
        req.body.postcode +
        ", " +
        req.body.adres +
        "', '" +
        req.body.postcode +
        ", " +
        req.body.adres +
        "');";
      for (let i = 0; i < req.body.product.length; i++) {
        query +=
          "INSERT INTO `nmentink_db2`.`bestelregel` (`idBestelling`, `idProduct`, `Aantal`) VALUES ('" +
          resp.insertId +
          "', '" +
          req.body.product[i] +
          "', '" +
          req.body.amount[i] +
          "'); UPDATE `nmentink_db2`.`voorraad` SET `Huidige_voorraad` = `Huidige_voorraad` - " +
          req.body.amount[i] +
          " WHERE (`idProduct` = '" +
          req.body.product[i] +
          "');";
      }
      db.query(query, function(err, responso) {
        console.log(resp);
        console.log(responso);
        res.send("test");
      });
    }
  );
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
    "SELECT p.Artikelnummer, p.Productnaam, v.Huidige_voorraad as Voorraad, v.Minimum_voorraad as MinVoorraad, ROUND((v.Huidige_voorraad / v.Maximum_voorraad) * 100) AS BezettingsGraad, p.idProduct FROM nmentink_db2.voorraad AS v INNER JOIN nmentink_db2.product AS p ON p.idProduct = v.idProduct;",
    function(err, res) {
      next(res);
    }
  );
}

function getProduct(idProduct, next) {
  if (idProduct.match(/^[0-9]*$/)) {
    db.query(
      "SELECT p.Productnaam, p.Artikelnummer, p.Lange_omschrijving, p.Korte_omschrijving, ROUND((v.Huidige_voorraad / v.Maximum_voorraad) * 100) AS BezettingsGraad, v.Huidige_voorraad, v.Maximum_voorraad, v.Minimum_voorraad, ig.Datum, ig.Prijs FROM nmentink_db2.voorraad AS v INNER JOIN nmentink_db2.product AS p ON p.idProduct = v.idProduct inner join nmentink_db2.inkoopgeschiedenis as ig on ig.idProduct = p.idProduct inner join nmentink_db2.fabrikant as f on f.idFabrikant = ig.idFabrikant WHERE p.idProduct = " +
        idProduct +
        " order by ig.Datum desc limit 1;",
      function(err, res) {
        next(res);
      }
    );
  } else {
    throw err;
  }
}

function getKlanten(sort, order, search, next) {
  db.query(
    "SELECT k.idKlant, k.Bedrijfsnaam, k.Telefoonnummer, c.Voornaam, c.Achternaam, c.Mailadres FROM nmentink_db2.klant as k inner join nmentink_db2.contactpersoon_klant as c on k.idKlant = c.idKlant where k.Bedrijfsnaam like '%" +
      search +
      "%' or k.Telefoonnummer like '%" +
      search +
      "%' or c.Voornaam like '%" +
      search +
      "%' or c.Achternaam like '%" +
      search +
      "%' or c.Mailadres like '%" +
      search +
      "%' group by k.idKlant order by " +
      sort +
      " " +
      order +
      ";",
    function(err, res) {
      next(res);
    }
  );
}

function getFabrikantenForProduct(productName, next) {
  db.query(
    "SELECT i.idProduct, p.Productnaam, i.Prijs, f.Bedrijfsnaam, p.Bestelcode FROM nmentink_db2.inkoopgeschiedenis as i JOIN nmentink_db2.product as p ON i.idProduct = p.idProduct JOIN nmentink_db2.fabrikant as f ON i.idFabrikant = f.idFabrikant WHERE p.Productnaam LIKE " +
      "'%" +
      productName +
      "%'group by Productnaam order by idProduct;",
    function(err, res) {
      next(res);
    }
  );
}

function getKlant(idKlant, next) {
  if (idKlant.match(/^[0-9]*$/)) {
    db.query(
      "SELECT * FROM nmentink_db2.klant as k where k.idKlant = " +
        idKlant +
        " group by k.idKlant limit 1;",
      function(err, res) {
        next(res);
      }
    );
  } else {
    throw err;
  }
}
