fs = require('fs');

function readFile(file) {
  fs.readFile(file, "utf8", function (err, content) {
    if (err) {
      console.log(err);
    } else {
      encrypt.next(content);
    }
  });
}

function *main() {
  var plaintext = yield readFile("plaintext.txt");
  console.log(plaintext);
  var publicKey = yield readFile("../public_key.pem");
  console.log(publicKey);
}

var encrypt = main();
encrypt.next();
