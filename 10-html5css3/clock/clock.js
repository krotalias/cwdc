/**
 * @file
 *
 * Summary.
 * <p>Draw a clock using the canvas API from HTML5.</p>
 *
 *  Description.
 *  <p>A simple method consists in mapping hours, minutes and seconds into angles,
 *   and then map polar coordinates to cartesian coordinates, considering 0°
 *   at three o'clock.
 *  </p>
 *
 *  <p>If the browser allows querying the current position (sometimes only when using a secure connection - https),
 *  the time of the clock is the local time from the browser. <br/ >
 *  Otherwise, a series of locations is read from a localtime.json file, and the time of each location can
 *  be used by pressing the "n" or "N" keys, which cicles forward or backward between them.
 *  </p>
 *
 *  <p>The day light hours are indicated by means of a bright curve drawn on top of the clock's circular border.</p>
 *
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm7 (or npm8)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d docjs clock.js
 *  </pre>
 *
 *  @author Paulo Roma Cavalcanti
 *  @since 14/11/2020
 *
 *  @see <a href="/cwdc/10-html5css3/clock/11.5.html?timeZone=America/New_York">link</a>
 *  @see <a href="/cwdc/10-html5css3/clock/11.5.php?timeZone=America/Edmonton">Edmonton</a>
 *  @see <a href="/cwdc/10-html5css3/clock/clock.js">source</a>
 *  @see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 *  @see <a href="../clock/localtime.json">json file</a>
 *  @see <img src="../clock/clock.png">
 *  @see <img src="../clock/clock2.png">
 */

"use strict";

/**
 * @var {HTMLElement} canvas HTML Canvas.
 */
var canvas = document.getElementById("clock");

/**
 * @var {CanvasRenderingContext2D} context Clock canvas context.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
var context = canvas.getContext("2d");

/**
 * @var {CanvasRenderingContext2D} ctx Handle canvas context.
 */
var ctx = document.getElementById("handles").getContext("2d");

/** π */
const pi = Math.PI;

/** Each 5 min is 30 degrees. */
const fiveMin = pi / 6;

var style = getComputedStyle(document.head);

// Handle's origin border, III and IX, and clock border color.
const grena = style.getPropertyValue("--cgrena");

// Unused.
const green = style.getPropertyValue("--cgreen");

// Handles and day light arc color.
const orange = style.getPropertyValue("--corange");

// Handle's origin fill color.
const white = style.getPropertyValue("--cwhite");

// Roman numbers and date color.
const white1 = style.getPropertyValue("--cwhite1");

// Decimal numbers color.
const white2 = style.getPropertyValue("--cwhite2");

// 6 and 18 and 24h handle color.
const white3 = style.getPropertyValue("--cwhite3");

/**
 * Clock radius.
 * @type {Number}
 */
var clockRadius = Math.min(canvas.width, canvas.height) / 3.1;

/**
 * Canvas center.
 * @type {point}
 */
var center = [canvas.width / 2, canvas.height / 2];

/**
 * Clock location UTC offset.
 */
var cityOffset = null;

/**
 * Get the image scale.
 *
 * @param {Number} w image width.
 * @param {Number} w image height.
 * @param {Number} r clock radius.
 * @return {Number[]} scale to fit the image in the clock without distortion.
 */
function imgSize(w, h, r) {
  let d = 2 * r * 0.8;
  return [(d * w) / h, d];
}

/**
 * Sets font size and style.
 *
 * @param {Number} size font size in pixels.
 * @return {String} html font.
 */
function setFont(size) {
  return `bold ${1.2 * size}px arial`;
}

/**
 * A 2D point.
 *
 * @typedef {Object} point
 * @property {Number} x - coordinate.
 * @property {Number} y - coordinate.
 */

/**
 * Convert from polar to cartesian coordinates.
 * <ul>
 * <li>Note that 0° is at three o'clock.</li>
 * <li>For the clock, however, 0° is at twelve o'clock.</li>
 * </ul>
 *
 * @param {Number} radius vector length.
 * @param {Number} angle vector angle.
 * @return {point} a 2D point.
 */
function polar2Cartesian(radius, angle) {
  angle -= pi / 2;
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

/**
 * Translate a point.
 *
 * @param {point} pos given point.
 * @param {number[]} vec translation vector.
 * @return {point} a new translated point.
 */
function translate(pos, vec) {
  return {
    x: pos.x + vec[0],
    y: pos.y + vec[1],
  };
}

/**
 * Scale a vector.
 *
 * @param {point} pos given vector (pos-[0,0]).
 * @param {Number[]} vec scale factor.
 * @return {point} a new scaled vector.
 */
function scale(pos, vec) {
  return {
    x: pos[0] * vec[0],
    y: pos[1] * vec[1],
  };
}

/**
 * Draw a circle.
 *
 * @param {point} center center of the circle.
 * @param {Number} radius radius of the circle.
 * @param {Boolean} fill draws a solid or hollow circle.
 * @see https://riptutorial.com/html5-canvas/example/11126/beginpath--a-path-command-
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/closePath
 */
function circle(center, radius, fill = true) {
  context.beginPath();
  context.arc(center[0], center[1], radius, 0, 2 * pi);
  if (fill) context.fill();
  else context.stroke();
}

/**
 * Draw an arc.
 *
 * @param {point} center center of the arc.
 * @param {Number} radius radius of the arc.
 * @param {String} t1 time of start of the arc.
 * @param {String} t2 time of end of the arc.
 * @param {Boolean} fill draws a solid or hollow arc.
 * @see https://riptutorial.com/html5-canvas/example/11126/beginpath--a-path-command-
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/closePath
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
 */
function arc(center, radius, t1, t2, fill = true) {
  let [arcInit, arcEnd] = [t1, t2].map((t) => {
    let [hour, minutes] = t.split(":").map((q) => Number(q));
    return 0.5 * (fiveMin * (hour + minutes / 60) - pi);
  });

  context.beginPath();
  context.arc(center[0], center[1], radius, arcInit, arcEnd);
  if (fill) context.fill();
  else context.stroke();
}

/**
 * Read the coordinates of a set of locations from a json file.
 *
 * @returns {Object} array of city coordinates.
 */
async function readZones() {
  const requestURL = `${location.protocol}/cwdc/10-html5css3/clock/localtime.json`;
  const request = new Request(requestURL);

  const response = await fetch(request);
  const timeZonesText = await response.text();
  const timeZones = JSON.parse(timeZonesText);

  return timeZones;
}

/**
 * Draw the clock: a logo, a circle, and the ticks.
 *
 * @param {String} place a location name.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API
 */
function drawClock(place) {
  // Browsers first loads a compressed version of image, then decodes it, finally paints it.
  // Draw the logo.
  const img = new Image();
  img.src = "./rolex_bezel.png";
  img.decode().then(() => {
    // Translate the center of the logo
    // to the center of the canvas.
    let size = imgSize(img.width, img.height, 1.8 * clockRadius);
    var coord = translate(scale(size, [-1 / 2, -1 / 2]), center);
    context.drawImage(img, coord.x, coord.y, size[0], size[1]);

    const logo = new Image();
    logo.src = "./fluminense.png";
    logo.decode().then(() => {
      // Translate the center of the logo
      // to the center of the canvas.
      let size = imgSize(logo.width, logo.height, 0.9 * clockRadius);
      var coord = translate(scale(size, [-1 / 2, -1 / 2]), center);
      context.drawImage(logo, coord.x, coord.y, size[0], size[1]);
      // Handle origin.
      context.strokeStyle = grena;
      context.fillStyle = white;
      circle(center, 10);
      circle(center, 10, false);
    });
  });

  // context.globalAlpha = 0.3; // set global alpha

  // Draw clock border.
  context.strokeStyle = grena;
  context.lineWidth = 3;
  circle(center, clockRadius - 8, false);

  navigator.geolocation.getCurrentPosition(
    (position) => {
      // this is an asynchronous callback
      drawArc({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    () => {
      // safari blocks geolocation unless using a secure connection
      (async () => {
        let tz = await readZones();
        //let index = localStorage.getItem("placeIndex") || place;
        //let city = tz.cities[index];
        let city = tz.cities.filter(function (c) {
          return c.city == place;
        })[0];
        if (city) {
          let lat = city.coordinates.latitude;
          let lng = city.coordinates.longitude;
          drawArc({ latitude: lat, longitude: lng }, city.offset);
        }
        window.onkeydown = function (event) {
          if (event.key === "n" || event.key === "N") {
            let index = localStorage.getItem("placeIndex") || 0;
            index = (+index + (event.key === "n" ? 1 : -1)).mod(
              tz.cities.length
            );
            localStorage.setItem("placeIndex", String(index));
            city = tz.cities[index];
            window.location.href =
              window.location.href.split("?")[0] +
              `?timeZone=${city.region}/${city.city}`;
          } else if (event.key === "Escape" || event.key === "e") {
            if (event.metaKey || event.ctrlKey) {
              localStorage.clear();
              alert("Local storage has been cleared");
            }
          } else if (event.key == "b") {
            window.location.href = "/cwdc";
          } else if (event.key == "B") {
            let path = window.location.pathname;
            window.location.href = path.split("/", 3).join("/");
          }
        };
      })();
    }
  );

  /**
   * <p>A modulo function that works for negative numbers.</p>
   * The modulo is calculated from remainder using the modular property:<br/>
   * • (a + b) mod c = (a mod c + b mod c) mod c.
   *
   * @function
   * @global
   * @param {Number} b divisor.
   * @returns {Number} this modulo b.
   * @see https://en.wikipedia.org/wiki/Modulo_operation
   * @see https://www.geeksforgeeks.org/how-to-get-negative-result-using-modulo-operator-in-javascript/
   */
  Number.prototype.mod = function (b) {
    return ((this % b) + b) % b;
  };

  /**
   * Draw the sun light arc.
   *
   * @param {Object<{latitude, longitude}>} loc location.
   * @param {Number} utcoff UTC offset.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
   */
  function drawArc(loc, utcoff) {
    let today = new Date();
    let times = SunCalc.getTimes(today, loc.latitude, loc.longitude);

    // your local timezone offset in minutes (eg -180).
    // NOT the timezone offset of the date object.
    let offset;
    let timezoneOffset = today.getTimezoneOffset() / 60;
    if (typeof utcoff === "undefined") {
      offset = 0;
      cityOffset = -timezoneOffset;
    } else {
      offset = timezoneOffset + utcoff;
      cityOffset = utcoff;
    }

    // format sunrise time from the Date object
    let sunriseStr =
      times.sunrise.getHours() + offset + ":" + times.sunrise.getMinutes();

    // format sunset time from the Date object
    let sunsetStr =
      times.sunset.getHours() + offset + ":" + times.sunset.getMinutes();

    console.log(sunriseStr, sunsetStr);
    context.strokeStyle = orange;
    arc(center, clockRadius - 8, sunriseStr, sunsetStr, false);
  }

  // Draw the tick numbers.
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Draw 12 inner numbers.
  context.font = setFont(clockRadius / 10);
  drawClock.romans.map((n, i) => {
    context.fillStyle = n.c;
    var coord = polar2Cartesian(0.85 * clockRadius, i * fiveMin);
    // translate to the center of the canvas
    coord = translate(coord, center);
    context.fillText(n.txt, coord.x, coord.y);
  });

  // Draw 24 outer numbers.
  context.font = setFont(clockRadius / 20);
  drawClock.decimals.map((n, i) => {
    context.fillStyle = n.c;
    // runs at half the speed
    var coord = polar2Cartesian(1.01 * clockRadius, i * fiveMin * 0.5);
    // translate to the center of the canvas
    coord = translate(coord, center);
    context.fillText(n.txt, coord.x, coord.y);
  });
}

/**
 * Clock roman x color.
 * @member {Array<{txt: String, c: color}>} roman clock numbers.
 */
drawClock.romans = [
  { txt: "XII", c: white1 },
  { txt: "I", c: white1 },
  { txt: "II", c: white1 },
  { txt: "III", c: grena },
  { txt: "IV", c: white1 },
  { txt: "V", c: white1 },
  { txt: "VI", c: white1 },
  { txt: "VII", c: white1 },
  { txt: " VIII", c: white1 },
  { txt: "IX", c: grena },
  { txt: "X", c: white1 },
  { txt: "XI", c: white1 },
];

/**
 * Clock number x color.
 * @member {Array<{txt: String, c: color}>} decimal clock numbers.
 */
drawClock.decimals = Array.from(Array(24), (_, i) => {
  return { txt: String(i), c: white2 };
});
drawClock.decimals[0].txt = "24";
drawClock.decimals[6].c = white3;
drawClock.decimals[18].c = white3;

/**
 * A closure to redraw the clock handles.
 *
 * @function
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
 * @see https://javascript.plainenglish.io/better-understanding-of-timers-in-javascript-settimeout-vs-requestanimationframe-bf7f99b9ff9b
 * @see https://attacomsian.com/blog/javascript-current-timezone
 */
var runAnimation = (() => {
  // clock handles width x length X color
  const clock_handles = [
    { width: 8, length: 0.5, c: orange },
    { width: 8, length: 0.8, c: orange },
    { width: 2, length: 0.9, c: orange },
    { width: 1, length: 0.95, c: white3 },
  ];
  const oneMin = pi / 30; // 6 degrees
  let timer = null;

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  var tz = urlParams.get("timeZone") || timezone;
  var city = tz.split("/")[1];

  function drawHandles() {
    // '06/02/2022, 08:20:50'
    //                         (0-23)  (0-59)  (0-59)
    while (true) {
      try {
        var today = new Date();
        var [day, month, year, hours, minutes, seconds] = today
          .toLocaleString("en-GB", { timeZone: tz })
          .slice()
          .split(/:|\/|,/);
        break;
      } catch (e) {
        if (e instanceof RangeError) {
          tz = timezone;
        } else {
          console.log(e);
          throw new Error("By, bye. See you later, alligator.");
        }
      }
    }

    // 12 hours format: AM / PM
    let hours12 = hours % 12 || 12;

    clock_handles[0].time2Angle = fiveMin * (+hours12 + minutes / 60);
    clock_handles[1].time2Angle = oneMin * (+minutes + seconds / 60);
    clock_handles[2].time2Angle = oneMin * seconds;
    clock_handles[3].time2Angle = fiveMin * (+hours + minutes / 60) * 0.5;

    // Clear screen.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw date.
    let date = `${day} / ${month} / ${year}`;
    let utc = `UTC ${cityOffset}`;
    let [region, city] = tz.split("/");
    let [tcity, tregion, tlen, tutc] = [city, region, date, utc].map((p) =>
      ctx.measureText(p)
    );
    let theight = clockRadius / 15;
    ctx.font = setFont(theight);
    ctx.fillStyle = white1;
    [
      [date, tlen],
      [city, tcity],
      [region, tregion],
      [utc, tutc],
    ].map((p, i) => {
      ctx.fillText(
        p[0],
        2 * center[0] - p[1].width,
        2 * center[1] - i * theight
      );
    });

    ctx.lineCap = "round";

    // Draw the handles.
    clock_handles.map((handle) => {
      ctx.strokeStyle = handle.c;
      ctx.beginPath();
      coord = polar2Cartesian(0.057 * clockRadius, handle.time2Angle);
      coord = translate(coord, center);
      ctx.moveTo(coord.x, coord.y);

      var coord = polar2Cartesian(
        handle.length * clockRadius,
        handle.time2Angle
      );
      coord = translate(coord, center);
      ctx.lineTo(coord.x, coord.y);
      ctx.lineWidth = handle.width;
      ctx.stroke();
    });
    cancelAnimationFrame(timer);
    timer = requestAnimationFrame(drawHandles);
  }
  drawClock(city);
  timer = requestAnimationFrame(drawHandles);
  return drawHandles;
})();
