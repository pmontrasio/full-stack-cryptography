const openFormBtn = document.getElementById("open-form");
const privateKeyForm = document.getElementById("private-key-form");
const privateKeyTextArea = document.getElementById("private-key");
const cipherText = document.getElementById("base64").value;
const decryptBtn = document.getElementById("decrypt");

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
  const privateKeyPem = privateKeyTextArea.value;
  const cipherText =
  decrypt()
});
