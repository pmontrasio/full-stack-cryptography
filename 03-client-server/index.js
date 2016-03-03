#!/usr/bin/env node

const fs = require("fs");
const crypto = require("crypto");
const constants = require("constants");
const seedrandom = require("seedrandom");
const express = require("express");
const port = 4000;

const app = express();
app.use("/static", express.static("static"));
app.set("views", "views");
app.set("view engine", "ejs");

var data;
const encrypt = prepare_data();
encrypt.next();

app.get("/", function (req, res) {
  res.render("index", { data: data });
});

app.listen(port, function () {
    console.log("Demo 03 app listening on http://localhost:" + port);
});

function *prepare_data() {
  const plaintext = yield readFile("../plaintext.txt");
  //console.log(plaintext);
  const publicKeyPem = yield readFile("../public_key.pem");
  //console.log(publicKeyPem);
  const buffer = new Buffer(256);
  const plaintextBuffer = new Buffer(plaintext, "utf8");
  plaintextBuffer.copy(buffer);
  buffer[plaintextBuffer.length] = 0;
  const encryptionOptions = { key: publicKeyPem, padding: constants.RSA_NO_PADDING };
  const rng = seedrandom(crypto.createHmac("sha256", plaintext));
  for (var i = 256 - plaintextBuffer.length + 1; i < 256; i++) {
    buffer[i] = Math.floor(rng() * 256);
  }

  // TODO encode in base64
  data = crypto.publicEncrypt(encryptionOptions, buffer).toString("base64");
  //console.log(data);
}

function readFile(file) {
  fs.readFile(file, "utf8", function (err, content) {
    if (err) {
      console.log(err);
    } else {
      encrypt.next(content);
    }
  });
}
