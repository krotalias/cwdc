/**
 * A wrapping function, so we can print its source to an element of a document.
 *
 * @author Paulo Roma
 * @since 06/08/2021
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/toString
 */
function displayCode() {
  const zip = (a, b) => a.map((k, i) => [k, b[i]]), level = 20;
  const center = (str, len) => str.padStart(str.length + Math.floor((len - str.length) / 2), " ").padEnd(len, " ");

  function* pascal(nlines, line = [1]) {
    yield line;
    for (let i = 0; i < nlines - 1; ++i) {
      line = zip([0].concat(line), line.concat(0)).map((a) => a[0] + a[1]);
      yield line;
    }
  }

  const pascalTri = [...pascal(level)];
  const mlen = pascalTri.slice(-1).map(String).join(" ").length;
  pascalTri.forEach((p) => console.log(center(p.map(String).join(" "), mlen)));
}

displayCode();
