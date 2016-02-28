const fs = require("fs");
const crypto = require("crypto");

function *main() {
  const plaintext = yield readFile("plaintext.txt");
  const publicKeyPem = yield readFile("../public_key.pem");
  console.log("Encrypting:");
  console.log("-----------------");
  console.log(plaintext);
  console.log("-----------------");
  const ciphertext1 = crypto.publicEncrypt(publicKeyPem, new Buffer(plaintext));
  const ciphertext2 = crypto.publicEncrypt(publicKeyPem, new Buffer(plaintext));
  if (ciphertext1 == ciphertext2) {
    // this is what you might expect
    process.exit(0);
  }
  console.log("Surprise!");
  console.log("Encryption is not deterministic. You got two different ciphertexts:");
  console.log(ciphertext1);
  console.log(ciphertext2);
  const privateKeyPem = yield readFile("../private_key.pem");
  console.log("\n\nBut they decrypt to the same plaintext:")
  console.log("-----------------");
  console.log(crypto.privateDecrypt(privateKeyPem, ciphertext1).toString("utf8"));
  console.log("-----------------");
  console.log(crypto.privateDecrypt(privateKeyPem, ciphertext2).toString("utf8"));
  console.log("-----------------");
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
