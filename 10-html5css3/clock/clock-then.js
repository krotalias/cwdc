/**
 * @file
 *
 * Summary.
 * <p>Draw an analog {@link https://www.timeanddate.com/worldclock/personal.html world clock}
 * using the HTML5
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API canvas API}.
 * </p>
 *
 * Description.
 * <p>Here, it has been used three canvases: one for the clock's background
 * another for the legend and the other for its four handles.
 *
 * A simple method for drawing a handle consists in mapping
 * hours, minutes and seconds from the computer into angles,
 * and then mapping {@link https://en.wikipedia.org/wiki/Polar_coordinate_system polar coordinates}
 * to {@link https://en.wikipedia.org/wiki/Cartesian_coordinate_system cartesian coordinates},
 * considering 0° at three o'clock.
 * </p>
 *
 * <p>If the browser allows querying the
 * {@link https://docs.buddypunch.com/en/articles/919258-how-to-enable-location-services-for-chrome-safari-edge-and-android-ios-devices-gps-setting current geographic location}
 * (sometimes only when using a secure connection - https),
 * the {@link https://www.timeanddate.com/time/map/ time zone} of the clock is the local time
 * from the browser.
 * Otherwise, a series of locations is read from a
 * <a href="../clock/localtime.json">localtime.json</a> file,
 * and the time of each location can
 * be set by pressing the "n" or "N" keys, which cycles forward or backward between them.
 * </p>
 *
 * <p>The day light hours are indicated by means of a bright curve drawn
 * on top of the clock's circular border.</p>
 *
 * <p>Whenever the mouse cursor is in the canvas, a reversed clock
 * <a href="../clock/Backwards-Clock.jpg">running backwards</a> is drawn.</p>
 *
 * <pre>
 * Documentation:
 * - Ubuntu:
 *    - sudo apt install jsdoc-toolkit
 * - MacOS:
 *    - sudo port install npm8 (or npm9)
 *    - sudo npm install -g jsdoc
 * - jsdoc -d doc-clock clock/clock-then.js clock/suncalc.js clock/date.js
 * </pre>
 *
 * @author Paulo Roma Cavalcanti
 * @since 14/11/2020
 *
 * @see <a href="/cwdc/10-html5css3/clock/11.5-then.html">Local Time</a>
 * @see <a href="/cwdc/10-html5css3/clock/11.5.eng.html?timeZone=America/Edmonton">Edmonton</a>
 * @see <a href="/cwdc/10-html5css3/clock/11.5.eng.html?timeZone=America/New_York">New York</a>
 * @see <a href="/cwdc/10-html5css3/clock/clock-then.js">source</a>
 * @see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 * @see https://github.com/mourner/suncalc
 * @see <img src="../clock/clock.png" width="256"> <img src="../clock/reversed-clock.png" width="256">
 * @see <img src="../clock/clock2.png" width="512">
 */

"use strict";

/**
 * @var {HTMLElement} canvas HTML Canvas.
 */
var canvas = document.getElementById("clock");

/**
 * @var {Boolean} _USE_LOCAL_TIME_ sets the use of local time.
 */
var _USE_LOCAL_TIME_ = true;

/**
 * @var {Object<{city: String, country: String}>} localRegion holds local city and country.
 */
var localRegion = {
  city: "unknown",
  country: "unknown",
};

/**
 * @var {HTMLElement} legend HTML Canvas.
 */
let legend = document.getElementById("legend");

/**
 * @var {Number} aspect canvas apsct ratio.
 */
let aspect = canvas.width / canvas.height;

/**
 * @var {HTMLElement} tzonesList HTML &lt;select&gt; element.
 */
let tzonesList = document.getElementById("tzones");

/**
 * @var {CanvasRenderingContext2D} context Clock canvas context.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
var context = canvas.getContext("2d");

/**
 * @var {CanvasRenderingContext2D} ctx Handle canvas context.
 */
var ctx = document.getElementById("handles").getContext("2d");

/**
 * @var {CanvasRenderingContext2D} lctx Legend canvas context.
 */
var lctx = document.getElementById("legend").getContext("2d");

/** π */
const pi = Math.PI;

/** Each 5 min is 30 degrees. */
const fiveMin = pi / 6;

/** Document's head. */
var style = getComputedStyle(document.head);

/**
 * Color table.
 * @property {Object} color - colors for the clock's components.
 * @property {hex-color} color.grena - Handle's origin border, III and IX, and clock border color.
 * @property {hex-color} color.green - Unused.
 * @property {hex-color} color.orange - Handles and day light arc color.
 * @property {hex-color} color.white - Handle's origin fill color.
 * @property {hex-color} color.white1 - Roman numbers and date color.
 * @property {hex-color} color.white2 - Decimal numbers color.
 * @property {hex-color} color.white3 - 6, 18 and 24h handle color.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color
 */
const color = {
  grena: style.getPropertyValue("--cgrena"),
  green: style.getPropertyValue("--cgreen"),
  orange: style.getPropertyValue("--corange"),
  white: style.getPropertyValue("--cwhite"),
  white1: style.getPropertyValue("--cwhite1"),
  white2: style.getPropertyValue("--cwhite2"),
  white3: style.getPropertyValue("--cwhite3"),
};

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
 * Clock location UTC real offset.
 */
let realOffset = null;

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
 * A time zone geographic descriptor.
 *
 * @typedef {Object} tz
 * @property {String} tz.city - name.
 * @property {String} tz.region - TZ identifier.
 * @property {Number} tz.offset - UTC offset.
 * @property {Object} tz.geodetic
 * @property {Number} tz.geodetic.latitude - latitude.
 * @property {Number} tz.geodetic.longitude - longitude.
 * @see https://en.wikipedia.org/wiki/Geographic_coordinate_system
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
 * @param {Boolean} reflect whether angles should be reflected.
 * @see https://riptutorial.com/html5-canvas/example/11126/beginpath--a-path-command-
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/closePath
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
 */
function arc(center, radius, t1, t2, fill = true, reflect = false) {
  let [arcInit, arcEnd] = [t1, t2].map((t) => {
    let [hour, minutes] = t.split(":").map((q) => Number(q));
    return 0.5 * (fiveMin * (hour + minutes / 60) - pi);
  });

  if (reflect) {
    [arcInit, arcEnd] = [pi - arcEnd, pi - arcInit];
  }
  context.beginPath();
  context.arc(center[0], center[1], radius, arcInit, arcEnd);
  if (fill) context.fill();
  else context.stroke();
}

/**
 * Read the time zone descriptors of a set of locations from a
 * <a href="../clock/localtime.json">json file</a>.
 *
 * @returns {Promise<Array<tz>>} array of time zones.
 */
function readZones() {
  const requestURL = `${location.protocol}/cwdc/10-html5css3/clock/localtime.json`;

  return fetch(requestURL).then((response) => {
    return response
      .json()
      .then((timeZones) => {
        return timeZones;
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

/**
 * Get the address using
 * {@link https://wiki.openstreetmap.org/wiki/Main_Page OpenStreetMap}
 * given a geodetic location.
 *
 * @param {Number} lat latitude.
 * @param {Number} long longitude.
 * @returns {Promise<Array<String>>} <a href="../clock/Fluminense-reverse.json">address array</a>: [house_number, road, city, suburb, country].
 * @see https://operations.osmfoundation.org/policies/nominatim/
 * @see https://nominatim.openstreetmap.org/reverse?format=json&lat=-22.9369&lon=-43.1857&zoom=18&addressdetails=1
 * @see <iframe width="512" height="350"
 * src="https://www.openstreetmap.org/export/embed.html?bbox=-43.1879934668541%2C-22.93755445951262%2C-43.18112701177598%2C-22.934424772219046&amp;layer=mapnik" style="border: 1px solid black"></iframe>
 * <br/><small>
 * <a href="https://www.openstreetmap.org/#map=19/-22.93599/-43.18456">View Larger Map</a>
 * </small>
 */
function reverseGeoCoding(lat, long) {
  const requestURL =
    "https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
    lat +
    "&lon=" +
    long +
    "&zoom=18&addressdetails=1";

  return fetch(requestURL).then((response) => {
    return response
      .json()
      .then((position) => {
        // console.log(position);
        // Object Destructuring
        const { house_number, road, city, suburb, country } = position.address;
        return Promise.all([house_number, road, city, suburb, country]);
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

/**
 * Get the latitude and longitude using
 * {@link https://wiki.openstreetmap.org/wiki/Main_Page OpenStreetMap}
 * given an address, e.g. "sao_paulo,brazil" or "london,england".
 *
 * @param {String} address location.
 * @returns {Promise<Array<Number>>} <a href="../clock/Fluminense.json">geodetic array</a>: [latitude, longitude].
 * @see https://operations.osmfoundation.org/policies/nominatim/
 * @see https://nominatim.openstreetmap.org/search?format=json&q="Fluminense Football Club"
 * @see https://leafletjs.com
 * @see <a href="../clock/Flusao.png"><img src="../clock/Flusao-512.png"></a>
 * @see <a href="../clock/Fluminense.html">Laranjeiras</a>
 */
function geoCoding(address) {
  const requestURL = `https://nominatim.openstreetmap.org/search?format=json&q=${address}`;

  return fetch(requestURL).then((response) => {
    return response
      .json()
      .then((geoCoding) => {
        // console.log(geoCoding);
        // Object Destructuring
        const { lat, lon } = geoCoding[0];
        return Promise.all([lat, lon]);
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

/**
 * <p>Returns a time zone geographic descriptor given a location name.</p>
 * The {@link readZones json file} is read and searched for.
 *
 * @param {String} name TZ identifier.
 * @returns {Promise<tz>} promise for getting a time zone descriptor.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
 */
function findCity(name) {
  if (typeof name !== "string" && typeof name !== "undefined") {
    return Promise.resolve(name);
  }
  return readZones().then((tz) => {
    let city;
    if (name === undefined) {
      let index = localStorage.getItem("placeIndex");
      if (index !== null) {
        tzonesList.value = index;
        city = tz.cities[index];
      }
    } else {
      city = tz.cities.filter(function (c) {
        return c.city == name;
      })[0];
    }
    drawClock.tz = tz;
    return city;
  });
}

/**
 * Display a time zone location in an element identified by #address
 * <ul>
 *  <li> house number, </li>
 *  <li> road, </li>
 *  <li> city, </li>
 *  <li> suburb, </li>
 *  <li> country </li>
 * </ul>
 * e.g.:
 * <pre>
 *    2, North Central Avenue, Phoenix, United States
 *    Latitude: 33.44844, Longitude: -112.07414
 * </pre>
 * @param {Number} latitude a coordinate that specifies the north–south position of a point on the surface.
 * @param {Number} longitude measures distance east or west of the prime meridian.
 * @param {String} dayLight sunrise - sunset string.
 * @param {String} city name of a city.
 * @param {String} region Africa | America | Asia | Atlantic | Australia | Europe | Indian | Pacific
 */
function displayLocation(latitude, longitude, dayLight, city, region) {
  let tag = document.querySelector("#address");
  const geopos = (pos, lat, lng) => {
    let [h, m, s] = longitude2UTC(longitude);
    return `${pos.filter((str) => str !== undefined).join(", ")}<br>
      Latitude: ${Number(lat).toFixed(5)},
      Longitude: ${Number(lng).toFixed(5)}<br>
      UTC offset: ${h}h, ${m}m and ${Number(s).toFixed(3)}s<br>
      ${dayLight}`;
  };

  reverseGeoCoding(latitude, longitude).then((pos) => {
    localRegion.city = pos[2];
    localRegion.country = pos[4];
    if (city !== undefined && region !== undefined) {
      geoCoding(`${city},${region}`)
        .then((geocode) => {
          tag.innerHTML = geopos(pos, geocode[0], geocode[1]);
        })
        .catch((err) => {
          console.log(err);
          tag.innerHTML = geopos(pos, latitude, longitude);
        });
    } else {
      tag.innerHTML = geopos(pos, latitude, longitude);
    }
  });

  let [h, m, s] = longitude2UTC(longitude);
  realOffset = h;
}

/**
 * Gets UTC offset from longitude, by converting degrees (angle) to hours (time).<br />
 * Negative values are west to Greenwich prime meridian and positive values, east.
 *
 * <ul>
 * <li>360 deg = 24 hours</li>
 * <li>15 deg = 1 hour</li>
 * <li>15 deg = 60 arcminutes</li>
 * <li>1 deg = 4 arcminutes</li>
 * <li>1/4 deg = 1 arcminute</li>
 * <li>1/4 deg = 60 arcseconds</li>
 * <li>1/4 * 1/60 deg = 1 arcsecond</li>
 * <li>0.004167 deg = 1 arcsecond</li>
 * <li>1 deg = 240 arcsecond</li>
 * </ul>
 * @param {Number} lng longitude in degrees.
 * @return {Array<Number>} [hr, min, sec]
 * @see http://cs4fn.org/mobile/owntimezone.php
 * @see https://en.wikipedia.org/wiki/Time_in_France
 * @see https://www.excelbanter.com/excel-programming/378044-decimalising-ra-dec-values.html
 * @see https://astro.unl.edu/naap/motion1/tc_units.html
 * @see https://dayspedia.com/time-zone-map/
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
 */
function longitude2UTC(lng) {
  let sec = lng * 240;
  let hr = Math.trunc(sec / 3600);
  let remainder = sec % 3600;
  let min = Math.trunc(remainder / 60);
  sec = remainder - min * 60;
  return [hr, min, sec];
}

/**
 * <p>Preloads a set of images.</p>
 * Browsers first load a compressed version of an image,
 * then decode it, and finally paint it.
 *
 * @param {String[]} urls array of Image URLs.
 * @returns {Promise<HTMLImageElement[]>} promise that resolves when all images are loaded, or rejects if any image fails to load.
 * @see https://www.freecodecamp.org/portuguese/news/tudo-o-que-voce-precisa-saber-sobre-promise-all/
 * @see https://dev.to/alejandroakbal/how-to-preload-images-for-canvas-in-javascript-251c
 */
function preloadImages(urls) {
  const promises = urls.map((url) => {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.src = url;

      image.decode().then(() => resolve(image));
      image.onerror = () => reject(`Image failed to load: ${url}`);
    });
  });

  // Promise.all keeps the order of the promises.
  return Promise.all(promises);
}

/**
 * Draw the clock background:
 * <ul>
 *  <li>a <a href="../clock/rolex_bezel.png">bezel</a> image,</li>
 *  <li>a <a href="../clock/fluminense.png">team</a> logo,</li>
 *  <li>a {@link circle}, </li>
 *  <li>the {@link drawArc sun light arc}, </li>
 *  <li>and the ticks.</li>
 * </ul>
 *
 * @param {String} place a location name.
 * @property {function} drawClock
 * @property {function} drawClock.location Increment/decrement the clock location.
 * @property {function} drawClock.storage update local storage with the clock location.
 * @property {Array<tz>} drawClock.tz time zone array.
 * @property {Array<{txt: String, c: hex-color}>} drawClock.romans Clock roman x color.
 * @property {Array<{txt: String, c: hex-color}>} drawClock.decimals Clock number x color.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API
 * @see https://en.wikipedia.org/wiki/Solar_time
 */
function drawClock(place) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  const urls = ["./rolex_bezel.png", "./fluminense.png"];

  preloadImages(urls)
    .then((image) => {
      let bezel = image[0];
      // Translate the center of the bezel
      // to the center of the canvas.
      let size = imgSize(bezel.width, bezel.height, 1.8 * clockRadius);
      var coord = translate(scale(size, [-1 / 2, -1 / 2]), center);
      context.rotate = pi;
      context.drawImage(bezel, coord.x, coord.y, size[0], size[1]);
      context.setTransform(1, 0, 0, 1, 0, 0);

      let flu = image[1];
      // Translate the center of the flu logo
      // to the center of the canvas.
      size = imgSize(flu.width, flu.height, 0.9 * clockRadius);
      coord = translate(scale(size, [-1 / 2, -1 / 2]), center);
      context.drawImage(flu, coord.x, coord.y, size[0], size[1]);
      // Handle origin.
      context.strokeStyle = color.grena;
      context.fillStyle = color.white;
      circle(center, 10);
      circle(center, 10, false);
    })
    .catch((error) => {
      console.log(`Could not load iamge: ${error}`);
    });

  // context.globalAlpha = 0.3; // set global alpha

  // Draw clock border.
  context.strokeStyle = color.grena;
  context.lineWidth = 3;
  circle(center, clockRadius - 8, false);

  if (place !== undefined) drawClock.place = place;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      // this is an asynchronous callback
      let lat = position.coords.latitude;
      let lng = position.coords.longitude;
      let srss = drawArc({
        latitude: lat,
        longitude: lng,
      });
      displayLocation(lat, lng, srss);
      _USE_LOCAL_TIME_ = true;
    },
    () => {
      // safari blocks geolocation unless using a secure connection
      _USE_LOCAL_TIME_ = false;
      findCity(drawClock.place).then((city) => {
        if (city) {
          let lat = city.coordinates.latitude;
          let lng = city.coordinates.longitude;
          let srss = drawArc({ latitude: lat, longitude: lng }, city);
          displayLocation(lat, lng, srss, city.city, city.region);
        }
      });
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    },
  );

  /**
   * <p>Callback for key pressed.</p>
   * Valid keys:
   * <ul>
   *  <li>n: next city.</li>
   *  <li>N: previous city.</li>
   *  <li>b: back to cwdc</li>
   *  <li>B: back to 10-html5css3</li>
   *  <li>⌘-esc or ⌘-e: clear local storage</li>
   * </ul>
   * @event KeyboardEvent
   * @param {KeyboardEvent} event keyboard event.
   */
  window.onkeydown = function (event) {
    if (event.key === "n" || event.key === "N") {
      drawClock.location(event.key);
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

  /**
   * <p>A modulo function, added to Number's
   * {@link https://www.freecodecamp.org/news/a-beginners-guide-to-javascripts-prototype/ prototype},
   * that works for negative numbers.</p>
   * The modulo is calculated from remainder using the modular property:<br/>
   * • (a + b) mod c = (a mod c + b mod c) mod c.
   *
   * @function
   * @param {Number} b divisor.
   * @returns {Number} this modulo b.
   * @memberof Number
   * @global
   * @see https://en.wikipedia.org/wiki/Modulo_operation
   * @see https://www.geeksforgeeks.org/how-to-get-negative-result-using-modulo-operator-in-javascript/
   */
  Number.prototype.mod = function (b) {
    return ((this % b) + b) % b;
  };

  let invertedClock = style.getPropertyValue("--inverted-clock") == "true";

  /**
   * <p>Draw the sun light arc.</p>
   *
   * <p>Apparently, suncalc returns the sunset and sunrise hours using
   * the local time from the browser. <br>
   * To get them in the time of the given city,
   * we have to calculate the time difference between the city and the browser,
   * and add it to the hours returned.</p>
   *
   * <pre>
   * The Indian problem - UTC offset 5:30:
   *    India     UTC            India     UTC
   *    16:18     10:48          16:32     11:02
   *    978m      648m           992m      662m
   *    330m = 5.5h              330m = 5.5h
   *    16 - 10 = 6h             16 - 11 = 5h
   *    48m ≥ 30m → -1h
   * </pre>
   *
   * @global
   * @param {Object<{latitude, longitude}>} loc location.
   * @param {tz} city time zone.
   * @return {String} Sunrise - Sunset hours.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
   * @see https://wtfjs.com/wtfs/2010-02-15-undefined-is-mutable
   * @see https://www.timeanddate.com/sun/usa/new-york
   * @see https://time.is/Paris
   */
  function drawArc(loc, city) {
    let today = new Date();
    let h0 = today.getUTCHours(); // STD time
    let m0 = today.getUTCMinutes(); // STD time
    let offset = 0;
    let moffset = 0;
    try {
      let { 3: h1, 4: m1 } = getLocaleDate(`${city.region}/${city.city}`);
      // this is the real city offset with or without DST (Daylight Saving Time)
      offset = +h1 - h0;
      // India
      moffset = Math.abs(+m1 - m0);
      if (moffset && m0 >= 30) offset -= 1;
    } catch (e) {
      // in case the city is not in javascript database, there is no way
      // but using the offset in our localtime.json
      if (city) offset = city.offset;
    }

    // your local timezone offset in minutes (e.g. -180).
    // NOT the timezone offset of the date object.
    let timezoneOffset = today.getTimezoneOffset() / 60;
    if (typeof city === "undefined") {
      offset = 0;
      cityOffset = -timezoneOffset;
    } else {
      cityOffset = offset;
      if (cityOffset > 12) cityOffset -= 24;
      else if (cityOffset < -12) cityOffset += 24;
      // diff between the city time and local time from the browser
      offset += timezoneOffset;
      if (moffset != 0) cityOffset += 0.5;
    }

    let times = SunCalc.getTimes(today, loc.latitude, loc.longitude);

    // format sunrise time from the Date object
    let m = times.sunrise.getMinutes();
    let h = times.sunrise.getHours();
    if (moffset != 0) {
      if (m >= 30) h += 1;
      m += moffset;
      m = m.mod(60);
    }
    let sunriseStr = (h + offset).mod(12) + ":" + m;

    // format sunset time from the Date object
    m = times.sunset.getMinutes();
    h = times.sunset.getHours();
    if (moffset != 0) {
      if (m >= 30) h += 1;
      m += moffset;
      m = m.mod(60);
    }
    let sunsetStr = (h + offset).mod(24) + ":" + m;

    context.strokeStyle = color.orange;

    arc(center, clockRadius - 8, sunriseStr, sunsetStr, false, invertedClock);

    return `Sunrise: ${sunriseStr} - Sunset: ${sunsetStr}`;
  }

  // Draw the tick numbers.
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Draw 12 inner numbers.
  context.font = setFont(clockRadius / 10);
  drawClock.romans.map((n, i) => {
    context.fillStyle = n.c;
    var coord = polar2Cartesian(0.85 * clockRadius, i * fiveMin);
    if (invertedClock) coord.x *= -1;
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
    if (invertedClock) coord.x *= -1;
    // translate to the center of the canvas
    coord = translate(coord, center);
    context.fillText(n.txt, coord.x, coord.y);
  });
}

/**
 * <p>Clock roman x color.</p>
 * Each roman number may have a different color, so it does not
 * interfere with the background color.
 * @memberof {drawClock}
 * @member {Array<{txt: String, c: hex-color}>} roman clock numbers.
 */
drawClock.romans = [
  { txt: "XII", c: color.white1 },
  { txt: "I", c: color.white1 },
  { txt: "II", c: color.white1 },
  { txt: "III", c: color.grena },
  { txt: "IV", c: color.white1 },
  { txt: "V", c: color.white1 },
  { txt: "VI", c: color.white1 },
  { txt: "VII", c: color.white1 },
  { txt: "  VIII  ", c: color.white1 },
  { txt: "IX", c: color.grena },
  { txt: "X", c: color.white1 },
  { txt: "XI", c: color.white1 },
];

/**
 * <p>Clock number x color.</p>
 * Each number may have a different color, so it does not
 * interfere with the background color.
 * @memberof {drawClock}
 * @member {Array<{txt: String, c: hex-color}>} decimal clock numbers.
 */
drawClock.decimals = Array.from(Array(24), (_, i) => {
  return { txt: String(i), c: color.white2 };
});
drawClock.decimals[0].txt = "24";
drawClock.decimals[6].c = color.white3;
drawClock.decimals[18].c = color.white3;

/**
 * Get the current place in local storage, increment or decrement it,
 * and redirects to the new location.
 * @param {String} key key "n" for next or "N" for previous.
 */
drawClock.storage = (key) => {
  let index = localStorage.getItem("placeIndex") || 0;
  if (!isNaN(key)) index = +key;
  else
    index = (+index + (key === "n" ? 1 : -1)).mod(drawClock.tz.cities.length);
  localStorage.setItem("placeIndex", String(index));
  let city = drawClock.tz.cities[index];
  // reload everything
  window.location.href =
    window.location.href.split("?")[0] +
    `?timeZone=${city.region}/${city.city}`;
};

/**
 * Increment/decrement the clock location.
 * @memberof {drawClock}
 * @global
 * @param {String} key "n" for next or "N" for previous.
 */
drawClock.location = (key) => {
  if (drawClock.tz == undefined) {
    readZones().then((tz) => {
      drawClock.tz = tz;
      drawClock.storage(key);
    });
  } else {
    drawClock.storage(key);
  }
};

/**
 * @var {HTMLElement} handles canvas holding the handles.
 * @listens mouseenter
 * @listens mouseleave
 */
const handles = document.querySelector("#handles");

/**
 * <p>Appends an event listener for events whose type attribute value is mouseenter.
 * The callback argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event mouseenter - executed only once when the cursor moves over the canvas.
 */
handles.addEventListener(
  "mouseenter",
  (event) => {
    document.documentElement.style.setProperty("--inverted-clock", "true");
    drawClock();
  },
  false,
);

/**
 * <p>Appends an event listener for events whose type attribute value is mouseenter.
 * The callback argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event mouseleave - executed only once when the cursor leaves the canvas.
 */
handles.addEventListener(
  "mouseleave",
  (event) => {
    document.documentElement.style.setProperty("--inverted-clock", "false");
    drawClock();
  },
  false,
);

/**
 * <p>Appends an event listener for events whose type attribute value is change.
 * The callback argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @event change - executed only once when the tzonesList selection is changed.
 */
tzonesList.addEventListener(
  "change",
  (event) => {
    drawClock.storage(tzonesList.value);
  },
  false,
);

/**
 * Select next location.
 */
function nextLocation() {
  drawClock.location("n");
}

/**
 * Select previous location.
 */
function previousLocation() {
  drawClock.location("N");
}

/**
 * Return the date and time in a given time zone.
 * <ul>
 *   <li> today = new Date() </li>
 *   <li> 2023-10-20T23:55:24.118Z  →  node </li>
 *   <li> today.toString() </li>
 *   <li> 'Fri Oct 20 2023 20:55:52 GMT-0300 (Brasilia Standard Time)'</li>
 *   <li> today.toLocaleString("en-GB", { timeZone: tz })</li>
 *   <li> "21/10/2023, 05:01:30"  →  (0-23) (0-59) (0-59)</li>
 *   <li> ["21", "10", "2023", " 05", "01", "30"] </li>
 * </ul>
 * @param {String} tz identifier, e.g., 'America/Sao_Paulo'.
 * @returns {Array<String>} [day, month, year, hours, minutes, seconds]
 */
function getLocaleDate(tz) {
  let today = new Date();
  let [day, month, year, hours, minutes, seconds] = today
    .toLocaleString("en-GB", { timeZone: tz })
    .slice()
    .split(/:|\/|,/);
  return [day, month, year, hours, minutes, seconds];
}

/**
 * Gets the local date and time.
 *
 * @returns {Array<Number>} the local date and time of the browser.
 */
function getLocalDateAndTime() {
  let today = new Date();

  let day = today.getDate();
  let month = today.getMonth() + 1;
  let year = today.getFullYear();
  let hours = today.getHours();
  let minutes = today.getMinutes();
  let seconds = today.getSeconds();
  return [day, month, year, hours, minutes, seconds];
}

/**
 * A closure to run the animation.
 *
 * @function
 * @return {drawHandles}
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
 * @see https://javascript.plainenglish.io/better-understanding-of-timers-in-javascript-settimeout-vs-requestanimationframe-bf7f99b9ff9b
 * @see https://attacomsian.com/blog/javascript-current-timezone
 * @see https://www.iana.org/time-zones
 */
var runAnimation = (() => {
  // clock handles width x length X color
  const clock_handles = [
    { width: 8, length: 0.5, c: color.orange },
    { width: 8, length: 0.8, c: color.orange },
    { width: 2, length: 0.9, c: color.orange },
    { width: 1, length: 0.95, c: color.white3 },
  ];
  const oneMin = pi / 30; // 6 degrees
  let timer = null;
  let delta = 0;

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let tz = urlParams.get("timeZone") || timezone;
  let city = tz.split("/")[1];
  let tz2 = tz;
  // add the padding from #clock and #handles
  let cpadd = +style.getPropertyValue("--cpadd").replace("px", "");
  legend.width += cpadd;
  legend.height += cpadd;

  findCity()
    .then((ct) => {
      if (ct) {
        tz = `${ct.region}/${ct.city}`;
        city = ct; // ct.city;
        // lets make a copy in case this is an invalid time zone,
        // so we can keep using the original string
        tz2 = tz;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      drawClock(city);
    });

  /**
   * <p>A callback to redraw the four handles and the legend of the clock.</p>
   * @callback drawHandles
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/measureText
   */
  return () => {
    while (true) {
      try {
        var [day, month, year, hours, minutes, seconds] = _USE_LOCAL_TIME_
          ? getLocalDateAndTime()
          : getLocaleDate(tz);
        break;
      } catch (e) {
        if (e instanceof RangeError) {
          // RangeError: invalid time zone
          // e.g.,Rio de Janeiro ...
          // I can use the local timezone
          //      tz = timezone;
          // or apply the offset to the hour of the 0° meridian
          tz = "UTC";
          delta = +city.offset;
        } else {
          console.log(e);
          throw new Error("By, bye. See you later, alligator.");
        }
      }
    }

    // 12 hours format: AM / PM
    let hours12 = (+hours + delta) % 12 || 12;

    // 24 hours format.
    let hours24 = (+hours + delta) % 24 || 24;

    clock_handles[0].time2Angle = fiveMin * (+hours12 + minutes / 60);
    clock_handles[1].time2Angle = oneMin * (+minutes + seconds / 60);
    clock_handles[2].time2Angle = oneMin * seconds;
    clock_handles[3].time2Angle = fiveMin * (+hours24 + minutes / 60) * 0.5;

    // Clear screen.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the handles.
    clock_handles.map((handle) => {
      ctx.strokeStyle = handle.c;
      ctx.beginPath();
      coord = polar2Cartesian(0.057 * clockRadius, handle.time2Angle);
      coord = translate(coord, center);
      ctx.moveTo(coord.x, coord.y);

      var coord = polar2Cartesian(
        handle.length * clockRadius,
        handle.time2Angle,
      );
      coord = translate(coord, center);
      ctx.lineTo(coord.x, coord.y);
      ctx.lineWidth = handle.width;
      ctx.stroke();
    });

    // Clear screen.
    lctx.clearRect(0, 0, legend.width, legend.height);

    let theight = legend.width / 45;
    lctx.font = setFont(theight);
    lctx.fillStyle = color.white1;

    // Draw the legend: UTC, Region, City, Date.
    let date = `${day} / ${month} / ${year}`;
    let utc = `UTC ${cityOffset} (${realOffset})`;
    let [region, lcity] = _USE_LOCAL_TIME_
      ? [localRegion.country, localRegion.city]
      : tz2.split("/");
    let [tcity, tregion, tlen, tutc] = [lcity, region, date, utc].map((p) =>
      lctx.measureText(p),
    );

    [
      [date, tlen],
      [lcity, tcity],
      [region, tregion],
      [utc, tutc],
    ].map((p, i) => {
      lctx.fillText(
        p[0],
        legend.width - p[1].width,
        legend.height - i * theight * 1.5,
      );
    });

    lctx.lineCap = "round";

    if (timer) cancelAnimationFrame(timer);
    timer = requestAnimationFrame(runAnimation);
  };
})();

/**
 * Triggers the {@link runAnimation animation}.
 *
 * @event load - run the animation.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
 */
window.addEventListener("load", (event) => runAnimation());

/**
 * Resize the canvases according to the size of the browser's window.
 */
function handleWindowResize() {
  let h = window.innerHeight;
  let w = window.innerWidth;
  if (h > w) {
    h = w / aspect; // aspect < 1
  } else {
    w = h * aspect; // aspect > 1
  }
  canvas.width = w;
  canvas.height = h;
  handles.width = w;
  handles.height = h;
  legend.width = w;
  legend.height = h;

  clockRadius = Math.min(canvas.width, canvas.height) / 3.1;
  center = [canvas.width / 2, canvas.height / 2];

  document.documentElement.style.setProperty("--width", `${w}px`);
  document.documentElement.style.setProperty("--height", `${h}px`);
  drawClock();
}

// mobile devices
if (screen.width <= 800) {
  /**
   * Triggers the {@link handleWindowResize resize event}.
   * <p>The resize event fires when the document view (window) has been resized.</p>
   *
   * @event resize - resize the application.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
   */
  window.addEventListener("resize", handleWindowResize, false);
  handleWindowResize();
}
