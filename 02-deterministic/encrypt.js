#!/usr/bin/env node

const fs = require("fs");
const crypto = require("crypto");
const constants = require("constants");
const seedrandom = require("seedrandom");

function *main() {
  const plaintext = yield readFile("../plaintext.txt");
  const publicKeyPem = yield readFile("../public_key.pem");
  console.log("Encrypting:");
  console.log("-----------------");
  console.log(plaintext);
  console.log("-----------------");

  // we need a buffer as long as the key
  const buffer = new Buffer(256);
  // the we copy the plaintext to the beginning of the buffer
  const plaintextBuffer = new Buffer(plaintext, "utf8");
  plaintextBuffer.copy(buffer);
  // we have to pad the buffer with some data that is the same every time we encrypt the same string so
  // 1) we seed the random number generator with something that depends on the plaintext
  //    ops: there is no Math.seed in JavaScript and NodeJs so we use the seedrandom module
  const rng = seedrandom(crypto.createHmac("sha256", plaintext));
  // 2) and fill with random data
  for (var i = 256 - plaintextBuffer.length; i < 256; i++) {
    buffer[i] = Math.floor(rng() * 256);
  }
  // 3) but we'll have a problem when decrypting: where do the plaintext ends and the random data start?
  //    we mark it with a 0, in C tradition
  buffer[plaintextBuffer.length] = 0;

  // 4) we disable automatic padding
  const encryptionOptions = { key: publicKeyPem, padding: constants.RSA_NO_PADDING };
  const ciphertext1 = crypto.publicEncrypt(encryptionOptions, buffer);
  const ciphertext2 = crypto.publicEncrypt(encryptionOptions, buffer);
  if (ciphertext1.equals(ciphertext2)) {
    console.log("Good, they were encrypted to the same ciphertext");
    const privateKeyPem = yield readFile("../private_key.pem");
    const decryptionOptions = { key: privateKeyPem, padding: constants.RSA_NO_PADDING };
    console.log("\n\nand they decrypt to the same plaintext:")
    console.log("-----------------");
    const plaintext1 = crypto.privateDecrypt(decryptionOptions, ciphertext1).toString("utf8");
    console.log(plaintext1.substring(0, plaintext1.indexOf("\0")));
    console.log("-----------------");
    const plaintext2 = crypto.privateDecrypt(decryptionOptions, ciphertext2).toString("utf8");
    console.log(plaintext2.substring(0, plaintext2.indexOf("\0")));
    console.log("-----------------");
  } else {
    console.log("Something must be wrong");
  }
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

const encrypt = main();
encrypt.next();
