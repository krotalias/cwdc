/**
 *  @file
 *
 *  <p>Online offline detection.</p>
 *
 * <p>The online property of the navigator interface, navigator.onLine,
 * is frequently used to detect the online and offline status of the browser.</p>
 *
 * Combined with listeners for online and offline events, it appears to provide
 * a simple solution for developers that is easy to implement.
 *
 * @see https://www.freecodecamp.org/news/how-to-check-internet-connection-status-with-javascript/
 * @see <a href="../internet-connection.js">source</a>
 */

/**
 * <p>Returns the online status of the browser. </p>
 * The property returns a boolean value,
 * with true meaning online and false meaning offline.
 * <ul>
 *  <li>The property sends updates whenever the browser's ability to connect to the network changes.</li>
 *  <li>The update occurs when the user follows links or when a script requests a remote page.</li>
 *  <li>For example, the property should return false when users click links soon after they lose internet connection.</li>
 * </ul>
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine
 */
function navigatorOnline() {
  const statusDisplay = document.getElementById("status");
  statusDisplay.innerHTML = `Browser is ${navigator.onLine ? online : offline}`;
}

/**
 * Request a small image at an interval to determine status.
 * Get a 1x1 pixel image {@link https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png here}.
 * Use this code with an HTML element with id="status".
 * @return {Boolean} status.
 */
const checkOnlineStatus = async () => {
  try {
    const online = await fetch("/1x1.png", { cache: "no-cache" });
    return online.ok; // either true or false
  } catch (err) {
    return false; // definitely offline
  }
};

/**
 * Keep checking online status each 30s untill we're online.
 */
let intervalID = setInterval(async () => {
  const result = checkOnlineStatus();
  const statusDisplay = document.getElementById("status");
  statusDisplay.textContent = result ? "We're Online" : "Sorry, OFFline";
  if (result) clearInterval(intervalID);
}, 3000); // probably too often, try 30000 for every 30 seconds

/**
 * Check online status when page is loaded.
 * @param {Event} a generic event.
 * @function load
 */
window.addEventListener("load", async (event) => {
  const statusDisplay = document.getElementById("status");
  statusDisplay.textContent = checkOnlineStatus() ? "ONline" : "OFFline";
});

/**
 * The offline event of the Window interface is fired when the browser
 * has lost access to the network and the value of Navigator.onLine switches to false.
 * @param {Event} a generic event.
 * @function offline
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/offline_event
 */
window.addEventListener("offline", (event) => {
  const statusDisplay = document.getElementById("status");
  statusDisplay.textContent = "Offline";
});

/**
 * The online event of the Window interface is fired when the browser
 * has gained access to the network and the value of Navigator.onLine switches to true.
 * @param {Event} a generic event.
 * @function online
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/online_event
 */
window.addEventListener("online", (event) => {
  const statusDisplay = document.getElementById("status");
  statusDisplay.textContent = "Online";
});
