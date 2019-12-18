const express = require("express");
const mysql = require("mysql");

const app = express();

const port = 5000;

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

db.query("SELECT * FROM mrchrzan_db2.product", function(err, dbres) {
  if (err) {
    throw err;
  } else {
    console.log(dbres);
  }
});
