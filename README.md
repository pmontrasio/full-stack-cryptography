# Software versions

nvm install 5.7.0
nvm use 5.7.0

# References #

https://nodejs.org/api/crypto.html
https://en.wikibooks.org/wiki/Cryptography/Generate_a_keypair_using_OpenSSL
https://davidwalsh.name/es6-generators

# Generate a key pair

    openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
    openssl rsa -pubout -in private_key.pem -out public_key.pem


