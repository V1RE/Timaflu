const express = require("express");
const mysql = require("mysql");

const app = express();

const port = 5000;

const db = mysql.createConnection({
  host: "aii.databases.avans.nl",
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
