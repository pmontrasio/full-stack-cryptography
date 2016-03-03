# Context

Problem to solve: encrypt some data, store it in a database and be able to make query on the ciphertext.

    select * from table where cipertext = '...';

It must be reasonably safe, better than plaintext: it must be inconvenient for a determined attacker but it's not required to be impossible to crack. If you want it to be impossible to crack you must do away with the ability to query the database on the cipertext. More about this soon.

# Software versions

    nvm install 5.7.0
    nvm use 5.7.0

# Generate a key pair

    openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
    openssl rsa -pubout -in private_key.pem -out public_key.pem

# Demos walkthrough

    echo -n "This is the plaintext" > plaintext.txt

# 01

    cd 01-naive
    node encrypt.js # or ./encrypt.js
    cd ..

Easy, encrypt with the public key and store the cipertext in the database.
NEVER put the private key on the server. If you do you could just use symmetric encryption, which is much faster.

We discovered that public key encryption works on buffers of the same length of the key.
Data must be broken into chunks and the last chunk must be padded. We were using the openssl library and it takes care of padding.

But... the queries don't retrieve all the records they should. Actually the return only one record.

How naive! We thought that encrypting a string always yields the same ciphertext. That is bad because it helps to brute force the decryption: encrypt many different plaintexts with the public key and you get. This works best if the plaintext is short and brute forcing and rainbow tables are feasible.

So...

# 02

    cd 02-deterministic
    npm install
    node encrypt.js # or ./encrypt.js
    cd ..

We discovered that there exists a thing called "deterministic encryption".
A. So we must pad the string with data that must be the same every time we encrypt the same string. We could pad with zeroes but it leaks information. We pad with random bytes, but...
B. JS doesn't have a seeding tool so we can't generate the same padding for the same strings.
So we use an external random number generator with support for seeding.
By the way, randomly padding (we are deterministically padding!) with a naive algoritm is evil and there are very serious studies about that. I think you can feel that random data at the end of non random one somewhat leaks information about the string you want to encrypt. The standard padding algorithm used to be PKCS#1 v1.5 (in short PKCS1v15) but OAEP is recommended now.

But... how to tell where the string ends and the padding starts?
C. We use a 0 byte, in the best C tradition. This might not work for your data. Find your schema.

And remember that deterministic encryption weakens the safety of the data.
And you better use proven libraries, not write your code. Oh well...

Good, we have a deterministic ciphertext now. We stored it in the database and we could use it in our SQL selects.

How about seeing those data in the browser, in plaintext?

# 03

    cd 03-client-server
    npm install
    node index.js # or ./index.js
    # browse to http://localhost:3000 and follow the instructions

We must send the ciphertext to the browser. We embedded it into the HTML page, which is equivalent to sending it in a JSON. But we can't send arbitrary binary data in HTML or JSON.
D. We use Base64. If your backend is not Node be careful and check the format of the encoded string: it might not be compatible with JavaScript's Base64 parser. Example: the Ruby Base64 library terminates the Base64 string with a newline and that breaks the JavaScript parser.

Then we must decrypt. We must ask the user to paste the private key into the browser. Doubts about the security of doing crypto in a browser, with all sorts or possible attacks, still... if the customer is informed and agrees we do it, right?

E. Pasting the key every time is a pain, so you might want to store it in the browser storage. One more security hazard. The customer agreed.

F. Decryption: we're using the JSEncrypt library which wraps http://www-cs-students.stanford.edu/~tjw/jsbn/
Problem: it handles only the PKCS1v15 padding but we're using no padding. Plus: they were not testing for 2048 bit keys.
Solution: fork the library to https://github.com/pmontrasio/jsencrypt and add the decryption for the RSA_NO_PADDING case.
Then you look at the code and you are like "OMG I can't possibly make it".
Then you run the debugger and narrow it down to this function. Still OMG but less scary

    function pkcs1unpad2(d,n) {
      var b = d.toByteArray();
      var i = 0;
      while(i < b.length && b[i] == 0) ++i;
      if(b.length-i != n-1 || b[i] != 2)
        return null;
      ++i;
      while(b[i] != 0)
        if(++i >= b.length) return null;
      var ret = "";
      while(++i < b.length) {
        var c = b[i] & 255;
        if(c < 128) { // utf-8 decode
          ret += String.fromCharCode(c);
        }
        else if((c > 191) && (c < 224)) {
          ret += String.fromCharCode(((c & 31) << 6) | (b[i+1] & 63));
          ++i;
        }
        else {
          ret += String.fromCharCode(((c & 15) << 12) | ((b[i+1] & 63) << 6) | (b[i+2] & 63));
          i += 2;
        }
      }
      return ret;
    }

Some hacking and it finally works.

# Curiosities

We run into this issue with V8 in November 2015
https://github.com/travist/jsencrypt/issues/57

It has been fixed but remember that server side you have crypto which does a much better job than plain JS.

# References #

* https://nodejs.org/api/crypto.html
* https://en.wikibooks.org/wiki/Cryptography/Generate_a_keypair_using_OpenSSL
* https://davidwalsh.name/es6-generators
* http://youmightnotneedjquery.com/
* https://en.wikipedia.org/wiki/Padding_%28cryptography%29
* https://en.wikipedia.org/wiki/OAEP
* http://travistidwell.com/jsencrypt/
* http://www-cs-students.stanford.edu/~tjw/jsbn/
* https://github.com/pmontrasio/jsencrypt
* https://nodejs.org/api/crypto.html
