/**
 * addAsync() immediately invokes the Promise constructor.
 * The actual implementation of that function resides in the callback
 * that is passed to that constructor (line A).
 * That callback is provided with two functions:
 *
 * <ul>
 *  <li>resolve is used for delivering a result (in case of success).</li>
 *  <li>reject is used for delivering an error (in case of failure).</li>
 * </ul>
 * @see https://exploringjs.com/impatient-js/ch_promises.html#the-basics-of-using-promises
 */
function addAsync(x, y) {
  return new Promise((resolve, reject) => {
    // (A)
    if (x === undefined || y === undefined) {
      reject(new Error("Must provide two parameters"));
    } else {
      resolve(x + y);
    }
  });
}

/**
 * Promises are similar to the event pattern:
 * There is an object (a Promise), where we register callbacks:
 *
 * <ul>
 *  <li>Method .then() registers callbacks that handle results.</li>
 *  <li>Method .catch() registers callbacks that handle errors.</li>
 * </ul>
 */
addAsync(3, 2)
  .then((result) => {
    console.log(`sum = ${result}`);
  })
  .catch((err) => {
    console.error(`Error: ${err.message}`);
  });

addAsync(2).then(
  (result) => {
    console.log(`sum = ${result}`);
  },
  (err) => {
    console.error(`Error: ${err.message}`);
  }
);
