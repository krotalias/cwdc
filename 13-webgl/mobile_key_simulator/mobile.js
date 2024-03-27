/**
 * @file
 *
 * Summary.
 * <p>Simulate Key Press for Mobiles.</p>
 *
 * @author Paulo Roma
 * @since 26/03/2024
 * @see <a href="/cwdc/13-webgl/mobile_key_simulator/mobile.html">link</a>
 * @see <a href="/cwdc/13-webgl/mobile_key_simulator/mobile.js">source</a>
 * @see <a href="https://medium.com/coding-beauty/javascript-simulate-keypress-9fcd5a31ff20">How to Simulate a Key Press in JavaScript</a>
 */

const textField = document.querySelector("#text-field");
const keyPresses = document.getElementById("key-presses");
const keyPressed = document.getElementById("key-pressed");
const simulate = document.getElementById("simulate");
const dispatcher = true ? window : textField;

// Set 'keydown' event listener, for testing purposes
let keyPressCount = 0;
dispatcher.addEventListener("keydown", (event) => {
  keyPressCount++;
  keyPresses.textContent = keyPressCount;
  keyPressed.textContent = event.key;
});

// Ctrl + c, Ctrl + o, Ctrl + d, Ctrl + e
const keysToSend = "code";

let keyIndex = 0;

simulate.addEventListener("click", () => {
  simulateKeyPress(keyPressed.textContent || " ");
  // simulateCtrlKeyPress(keysToSend.at(keyIndex++) || keysToSend.at(-1));
});

function simulateCtrlKeyPress(key) {
  const event = new KeyboardEvent("keydown", { key, ctrlKey: true });
  textField.dispatchEvent(event);
}

function simulateKeyPress(key) {
  const event = new KeyboardEvent("keydown", { key });
  dispatcher.dispatchEvent(event);
}
