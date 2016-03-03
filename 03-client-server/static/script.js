const ciphertext = document.getElementById("base64").textContent;
const openFormBtn = document.getElementById("open-form");
const privateKeyForm = document.getElementById("private-key-form");
const privateKeyTextArea = document.getElementById("private-key");
const decryptBtn = document.getElementById("decrypt");
const plaintextDisplay = document.getElementById("plaintext");

function addEventListener(el, eventName, handler) {
  if (el.addEventListener) {
    el.addEventListener(eventName, handler);
  } else {
    el.attachEvent("on" + eventName, function(){
      handler.call(el);
    });
  }
}

addEventListener(openFormBtn, "click", function () {
  privateKeyForm.style.display = "inline";
});

addEventListener(decryptBtn, "click", function () {
  const jse = new JSEncrypt();
  jse.setKey(privateKeyTextArea.value);
  const buffer = jse.decryptNoPadding(ciphertext);
  const plaintext = buffer.substring(0, buffer.indexOf("\0"));
  plaintextDisplay.textContent = plaintext;
  plaintextDisplay.style.display = "inline";
});
