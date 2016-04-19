const cyphertext = document.getElementById("base64").textContent;
const openFormBtn = document.getElementById("open-form");
const privateKeyForm = document.getElementById("private-key-form");
const unknownKeyText = document.getElementById("unknown-key-text");
const knownKeyText = document.getElementById("known-key-text");
const privateKeyTextArea = document.getElementById("private-key");
const decryptBtn = document.getElementById("decrypt");
const plaintextDisplay = document.getElementById("plaintext");

function addEventListener(el, eventName, handler) {
  if (el.addEventListener) {
    el.addEventListener(eventName, handler);
  } else {
    el.attachEvent("on" + eventName, function() {
      handler.call(el);
    });
  }
}

addEventListener(openFormBtn, "click", function () {
  if(localStorage.getItem('key'))
    showStoredKey();
  else
    askKey();
});

addEventListener(decryptBtn, "click", function () {
  if(!localStorage.getItem('key'))
    localStorage.setItem('key', privateKeyTextArea.value);
  const jse = new JSEncrypt();
  jse.setKey(localStorage.getItem('key'));
  const buffer = jse.decryptNoPadding(cyphertext);
  const plaintext = buffer.substring(0, buffer.indexOf("\0"));
  plaintextDisplay.textContent = plaintext;
  plaintextDisplay.style.display = "inline";
});

function showStoredKey() {
  privateKeyTextArea.value = localStorage.getItem('key');
  knownKeyText.style.display = "inline";
  unknownKeyText.style.display = "none";
  privateKeyForm.style.display = "inline";
}

function askKey() {
  knownKeyText.style.display = "none";
  unknownKeyText.style.display = "inline";
  privateKeyForm.style.display = "inline";
}
