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
 * <p>Here, it has been used three canvases: one for the clock's background,
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
 * - jsdoc -d docjs clock/clock.js clock/suncalc.js clock/date.js
 * </pre>
 *
 * @author Paulo Roma Cavalcanti
 * @since 14/11/2020
 *
 * @see <a href="/cwdc/10-html5css3/clock/11.5.html">Local Time</a>
 * @see <a href="/cwdc/10-html5css3/clock/11.5-then.html">Local Time (then)</a>
 * @see <a href="/cwdc/10-html5css3/clock/11.5.eng.html?timeZone=America/Edmonton">Edmonton</a>
 * @see <a href="/cwdc/10-html5css3/clock/11.5.eng.html?timeZone=America/New_York">New York</a>
 * @see <a href="/cwdc/10-html5css3/clock/clock.js">source</a>
 * @see <a href="/cwdc/10-html5css3/clock/clock-then.js">source (then)</a>
 * @see {@link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones List of tz database time zones}
 * @see {@link https://github.com/mourner/suncalc SunCalc}
 * @see <img src="../clock/clock.png" width="256"> <img src="../clock/reversed-clock.png" width="256">
 * @see <img src="../clock/clock2.png" width="512">
 */

"use strict";

/**
 * @var {HTMLElement} canvas HTML Canvas.
 */
const canvas = document.getElementById("clock");

/**
 * @var {Boolean} _USE_LOCAL_TIME_ sets the use of local time.
 */
let _USE_LOCAL_TIME_ = true;

/**
 * @var {Object<{city: String, country: String}>} localRegion holds local city and country.
 */
const localRegion = {
  city: "unknown",
  country: "unknown",
};

/**
 * @var {HTMLElement} legend HTML Canvas.
 */
const legend = document.getElementById("legend");

/**
 * @var {Number} aspect canvas apsct ratio.
 */
const aspect = canvas.width / canvas.height;

/**
 * @var {HTMLElement} tzonesList HTML &lt;select&gt; element.
 */
const tzonesList = document.getElementById("tzones");

/**
 * @var {CanvasRenderingContext2D} context Clock canvas context.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D CanvasRenderingContext2D}
 */
const context = canvas.getContext("2d");

/**
 * @var {CanvasRenderingContext2D} ctx Handle canvas context.
 */
const ctx = document.getElementById("handles").getContext("2d");

/**
 * @var {CanvasRenderingContext2D} lctx Legend canvas context.
 */
const lctx = document.getElementById("legend").getContext("2d");

/** π */
const pi = Math.PI;

/** Each 5 min is 30 degrees. */
const fiveMin = pi / 6;

/** Document's head. */
const style = getComputedStyle(document.head);

/**
 * @var {Number} cpadd padding added to the clock.
 */
const cpadd = +style.getPropertyValue("--cpadd").replace("px", "");

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
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color &lt;hex-color&gt;}
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
let clockRadius = Math.min(canvas.width, canvas.height) / 3.1;

/**
 * Canvas center.
 * @type {point}
 */
let center = [canvas.width / 2, canvas.height / 2];

/**
 * Clock location UTC offset.
 */
let cityOffset = null;

/**
 * Get the image scale.
 *
 * @param {Number} w image width.
 * @param {Number} w image height.
 * @param {Number} r clock radius.
 * @return {Number[]} scale to fit the image in the clock without distortion.
 */
function imgSize(w, h, r) {
  const d = 2 * r * 0.8;
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
 * @see {@link https://en.wikipedia.org/wiki/Geographic_coordinate_system Geographic coordinate system}
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
 * @see {@link https://riptutorial.com/html5-canvas/example/11126/beginpath--a-path-command- beginPath (a path command)}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke CanvasRenderingContext2D: stroke() method}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/closePath CanvasRenderingContext2D: closePath() method}
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
 * @see {@link https://riptutorial.com/html5-canvas/example/11126/beginpath--a-path-command- beginPath (a path command)}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke CanvasRenderingContext2D: stroke() method}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/closePath CanvasRenderingContext2D: closePath() method}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc CanvasRenderingContext2D: arc() method}
 */
function arc(center, radius, t1, t2, fill = true, reflect = false) {
  let [arcInit, arcEnd] = [t1, t2].map((t) => {
    const [hour, minutes] = t.split(":").map((q) => Number(q));
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
 * @async
 * @returns {Promise<Array<tz>>} array of time zones.
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
 * Get the address using
 * {@link https://wiki.openstreetmap.org/wiki/Main_Page OpenStreetMap}
 * given a geodetic location.
 *
 *
 * @param {Number} lat latitude.
 * @param {Number} long longitude.
 * @async
 * @returns {Promise<Array<String>>} <a href="../clock/Fluminense-reverse.json">address array</a>: [house_number, road, city, suburb, country].
 * @see {@link https://operations.osmfoundation.org/policies/nominatim/ Nominatim Usage Policy }
 * @see https://nominatim.openstreetmap.org/reverse?format=json&lat=-22.9369&lon=-43.1857&zoom=18&addressdetails=1
 * @see <iframe width="512" height="350"
 * src="https://www.openstreetmap.org/export/embed.html?bbox=-43.1879934668541%2C-22.93755445951262%2C-43.18112701177598%2C-22.934424772219046&amp;layer=mapnik" style="border: 1px solid black"></iframe>
 * <br/><small>
 * <a href="https://www.openstreetmap.org/#map=19/-22.93599/-43.18456">View Larger Map</a>
 * </small>
 */
async function reverseGeoCoding(lat, long) {
  const requestURL =
    "https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
    lat +
    "&lon=" +
    long +
    "&zoom=18&addressdetails=1";
  const request = new Request(requestURL);

  const response = await fetch(request);
  const positionText = await response.text();
  const position = JSON.parse(positionText);

  // console.log(position);
  // Object Destructuring
  const { house_number, road, city, suburb, country } = position.address;
  return [house_number, road, city, suburb, country];
}

/**
 * Get the latitude and longitude using
 * {@link https://wiki.openstreetmap.org/wiki/Main_Page OpenStreetMap}
 * given an address, e.g. "sao_paulo,brazil" or "london,england".
 *
 * @param {String} address location.
 * @async
 * @returns {Promise<Array<Number>>} <a href="../clock/Fluminense.json">geodetic array</a>: [latitude, longitude].
 * @see {@link https://operations.osmfoundation.org/policies/nominatim/ Nominatim Usage Policy}
 * @see https://nominatim.openstreetmap.org/search?format=json&q="Fluminense Football Club"
 * @see {@link https://leafletjs.com Leaflet}
 * @see <a href="../clock/Flusao.png"><img src="../clock/Flusao-512.png"></a>
 * @see <a href="../clock/Fluminense.html">Laranjeiras</a>
 */
async function geoCoding(address) {
  const requestURL = `https://nominatim.openstreetmap.org/search?format=json&q=${address}`;
  const request = new Request(requestURL);

  const response = await fetch(request);
  const geoCodingText = await response.text();
  const geoCoding = JSON.parse(geoCodingText);

  // console.log(geoCoding);
  // Object Destructuring
  const { lat, lon } = geoCoding[0];
  return [lat, lon];
}

/**
 * <p>Returns a time zone geographic descriptor given a location name.</p>
 * The {@link readZones json file} is read and searched for.
 *
 * @async
 * @param {String} name TZ identifier.
 * @returns {Promise<tz>} promise for getting a time zone descriptor.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function async function}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter Array.prototype.filter()}
 */
async function findCity(name) {
  if (typeof name !== "string" && typeof name !== "undefined") {
    return name;
  }
  if (drawClock.tz === undefined) {
    drawClock.tz = await readZones();
  }
  let city;
  if (name === undefined) {
    const index = localStorage.getItem("placeIndex");
    if (index !== null) {
      tzonesList.value = index;
      city = drawClock.tz.cities[index];
    }
  } else {
    city = drawClock.tz.cities.filter(function (c) {
      return c.city == name;
    })[0];
  }
  return city;
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
 * @async
 * @param {Number} latitude a coordinate that specifies the north–south position of a point on the surface.
 * @param {Number} longitude measures distance east or west of the prime meridian.
 * @param {String} dayLight sunrise - sunset string.
 * @param {String} city name of a city.
 * @param {String} region Africa | America | Asia | Atlantic | Australia | Europe | Indian | Pacific
 */
async function displayLocation(latitude, longitude, dayLight, city, region) {
  const tag = document.querySelector("#address");
  const geopos = (pos, lat, lng) => {
    const [h, m, s] = longitude2UTC(longitude);
    return `${pos.filter((str) => str !== undefined).join(", ")}<br>
      Latitude: ${Number(lat).toFixed(5)},
      Longitude: ${Number(lng).toFixed(5)}<br>
      UTC offset: ${h}h, ${m}m and ${Number(s).toFixed(3)}s <br>
      ${dayLight}`;
  };

  const pos = await reverseGeoCoding(latitude, longitude);
  localRegion.city = pos[2];
  localRegion.country = pos[4];

  if (city !== undefined && region !== undefined) {
    try {
      const geocode = await geoCoding(`${city},${region}`);
      tag.innerHTML = geopos(pos, geocode[0], geocode[1]);
    } catch (e) {
      console.error(e);
      console.error(`${city},${region}: not found`);
      tag.innerHTML = geopos(pos, latitude, longitude);
    }
  } else {
    tag.innerHTML = geopos(pos, latitude, longitude);
  }
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
 * @see {@link http://cs4fn.org/mobile/owntimezone.php CS$FN}
 * @see {@link https://en.wikipedia.org/wiki/Time_in_France Time in France}
 * @see {@link https://www.excelbanter.com/excel-programming/378044-decimalising-ra-dec-values.html decimalising}
 * @see {@link https://astro.unl.edu/naap/motion1/tc_units.html Interactive Time Zone Map}
 * @see {@link https://dayspedia.com/time-zone-map/ Interactive Time Zone Map}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc Math.trunc()}
 */
function longitude2UTC(lng) {
  let sec = lng * 240;
  const hr = Math.trunc(sec / 3600);
  const remainder = sec % 3600;
  const min = Math.trunc(remainder / 60);
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
 * @see {@link https://www.freecodecamp.org/portuguese/news/tudo-o-que-voce-precisa-saber-sobre-promise-all/ Tudo o que você precisa saber sobre Promise.all}
 * @see {@link https://dev.to/alejandroakbal/how-to-preload-images-for-canvas-in-javascript-251c How to preload images for canvas in JavaScript}
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
 * @namespace
 * @param {String} place a location name.
 * @property {function} drawClock
 * @property {function} drawClock.location Increment/decrement the clock location.
 * @property {function} drawClock.storage update local storage with the clock location.
 * @property {Array<tz>} drawClock.tz time zone array.
 * @property {Array<{txt: String, c: hex-color}>} drawClock.romans Clock roman x color.
 * @property {Array<{txt: String, c: hex-color}>} drawClock.decimals Clock number x color.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage CanvasRenderingContext2D: drawImage() method}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images Using images}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode HTMLImageElement: decode() method}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API Using the Geolocation API}
 * @see {@link https://en.wikipedia.org/wiki/Solar_time Solar time}
 */
function drawClock(place) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  const urls = ["./rolex_bezel.png", "./fluminense.png"];

  preloadImages(urls)
    .then((image) => {
      const bezel = image[0];
      // Translate the center of the bezel
      // to the center of the canvas.
      let size = imgSize(bezel.width, bezel.height, 1.8 * clockRadius);
      let coord = translate(scale(size, [-1 / 2, -1 / 2]), center);
      context.rotate = pi;
      context.drawImage(bezel, coord.x, coord.y, size[0], size[1]);
      context.setTransform(1, 0, 0, 1, 0, 0);

      const flu = image[1];
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
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const srss = drawArc({
        latitude: lat,
        longitude: lng,
      });
      displayLocation(lat, lng, srss);
      _USE_LOCAL_TIME_ = true;
    },
    async () => {
      // safari blocks geolocation unless using a secure connection
      const city = await findCity(drawClock.place);
      _USE_LOCAL_TIME_ = false;
      if (city) {
        const lat = city.coordinates.latitude;
        const lng = city.coordinates.longitude;
        const srss = drawArc({ latitude: lat, longitude: lng }, city);
        displayLocation(lat, lng, srss, city.city, city.region);
      } else {
        console.error(`${drawClock.place} not in localtime.json`);
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    },
  );

  /**
   * <p>Numbers are most commonly expressed in literal forms like 255 or 3.14159.</p>
   * Values represent floating-point numbers like 37 or -9.25.
   * @class Number
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number Number}
   */

  /**
   * <p>A modulo function added to Number's
   * {@link https://www.freecodecamp.org/news/a-beginners-guide-to-javascripts-prototype/ prototype}
   * that works for negative numbers.</p>
   * The modulo is calculated from remainder using the modular property:<br/>
   * • (a + b) mod c = (a mod c + b mod c) mod c.
   *
   * @param {Number} b divisor.
   * @returns {Number} this modulo b.
   * @memberof Number
   * @see {@link https://en.wikipedia.org/wiki/Modulo_operation Modulo}
   * @see {@link https://www.geeksforgeeks.org/how-to-get-negative-result-using-modulo-operator-in-javascript/ How to get negative result using modulo operator in JavaScript ?}
   */
  Number.prototype.mod = function (b) {
    return ((this % b) + b) % b;
  };

  /**
   * Whether the clock should run counter-clockwise.
   * @type {Boolean}
   * @global
   */
  const invertedClock = style.getPropertyValue("--inverted-clock") == "true";

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
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset Date.prototype.getTimezoneOffset()}
   * @see {@link https://wtfjs.com/wtfs/2010-02-15-undefined-is-mutable 2010 02 15 undefined is mutable}
   * @see {@link https://www.timeanddate.com/sun/canada/edmonton Edmonton, Alberta, Canada — Sunrise, Sunset, and Daylength}
   * @see {@link https://time.is/Paris Time zone info for Paris}
   */
  function drawArc(loc, city) {
    const today = new Date();
    const h0 = today.getUTCHours(); // STD time
    const m0 = today.getUTCMinutes(); // STD time
    let offset = 0;
    let moffset = 0;
    try {
      let { 3: h1, 4: m1 } = getLocaleDate(`${city.region}/${city.city}`);
      // this is the real city offset with or without Daylight Saving Time (DST)
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
    const timezoneOffset = today.getTimezoneOffset() / 60;
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

    const times = SunCalc.getTimes(today, loc.latitude, loc.longitude);

    // format sunrise time from the Date object
    let m = times.sunrise.getMinutes();
    let h = times.sunrise.getHours();
    if (moffset != 0) {
      if (m >= 30) h += 1;
      m += moffset;
      m = m.mod(60);
    }
    const sunriseStr = (h + offset).mod(12) + ":" + m;

    // format sunset time from the Date object
    m = times.sunset.getMinutes();
    h = times.sunset.getHours();
    if (moffset != 0) {
      if (m >= 30) h += 1;
      m += moffset;
      m = m.mod(60);
    }
    const sunsetStr = (h + offset).mod(24) + ":" + m;

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
    let coord = polar2Cartesian(0.85 * clockRadius, i * fiveMin);
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
    let coord = polar2Cartesian(1.01 * clockRadius, i * fiveMin * 0.5);
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
 * @memberof drawClock
 * @member {Array<{txt: String, c: hex-color}>}
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
 * @memberof drawClock
 * @member {Array<{txt: String, c: hex-color}>}
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
 * @memberof drawClock
 * @param {String} key key "n" for next or "N" for previous.
 */
drawClock.storage = (key) => {
  let index = localStorage.getItem("placeIndex") || 0;
  if (!isNaN(key)) index = +key;
  else
    index = (+index + (key === "n" ? 1 : -1)).mod(drawClock.tz.cities.length);
  localStorage.setItem("placeIndex", String(index));
  const city = drawClock.tz.cities[index];
  tzonesList.value = index;
  // reload everything
  if (false) {
    window.location.href =
      window.location.href.split("?")[0] +
      `?timeZone=${city.region}/${city.city}`;
  } else {
    runAnimation.setLocation(`${city.region}/${city.city}`);
  }
};

/**
 * Increment/decrement the clock location.
 * @async
 * @memberof drawClock
 * @param {String} key "n" for next or "N" for previous.
 */
drawClock.location = async (key) => {
  if (drawClock.tz == undefined) {
    drawClock.tz = await readZones();
  }
  drawClock.storage(key);
};

/**
 * @var {HTMLElement} handles canvas holding the handles.
 * @listens mouseenter
 * @listens mouseleave
 */
const handles = document.querySelector("#handles");

/**
 * <p>Appends an event listener for events whose type attribute value is mouseenter.</p>
 * <p>The callback argument sets the {@link  drawClock callback} that will be invoked when
 * the event is dispatched.</p>
 * @summary Executed only once when the cursor moves over the canvas.
 *
 * @event mouseenter
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseenter_event Element: mouseenter event}
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
 * <p>Appends an event listener for events whose type attribute value is mouseleave.</p>
 * <p>The callback argument sets the {@link drawClock callback} that will be invoked when
 * the event is dispatched.</p>
 * @summary Executed only once when the cursor leaves the canvas.
 *
 * @event mouseleave
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseleave_event Element: mouseleave event}
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
 * <p>Appends an event listener for events whose type attribute value is change.</p>
 * <p>>he callback argument sets the callback that will be invoked when
 * the event is dispatched.</p>
 *
 * @summary Executed only once when the tzonesList selection is changed.
 *
 * @event changeTzones
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
 *   <li> 2023-10-20T23:55:24.118Z →  node </li>
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
  const today = new Date();
  const [day, month, year, hours, minutes, seconds] = today
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
  const today = new Date();

  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const hours = today.getHours();
  const minutes = today.getMinutes();
  const seconds = today.getSeconds();
  return [day, month, year, hours, minutes, seconds];
}

/**
 * Adds options to the &lt;select&gt; element with id #tzones, for all of the cities.
 *
 * @param {String} city city to be selected.
 * @async
 */
async function createSelect(city) {
  const sel = document.querySelector("#tzones");

  if (sel.options.length === 0) {
    if (drawClock.tz === undefined) {
      drawClock.tz = await readZones();
    }
    const options = drawClock.tz.cities.map((c, i) => {
      return `<option value="${i}" ${
        city == c ? "selected" : ""
      }>${c.city.replaceAll("_", " ")}</option>`;
    });

    sel.innerHTML = options;
  }
}

/**
 * A closure to run the animation.
 *
 * @function
 * @return {drawHandles}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date Date}
 * @see {@link https://javascript.plainenglish.io/better-understanding-of-timers-in-javascript-settimeout-vs-requestanimationframe-bf7f99b9ff9b SetTimeout vs RequestAnimationFrame}
 * @see {@link https://attacomsian.com/blog/javascript-current-timezone How to get current time zone in JavaScript}
 */
const runAnimation = (() => {
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

  // add the padding from #clock and #handles
  legend.width += cpadd;
  legend.height += cpadd;

  let city = "";
  let tz2 = null;
  function reset(tz_) {
    city = tz.split("/")[1];
    tz = tz_;
    tz2 = tz;
    delta = 0;

    (async () => {
      try {
        const ct = await findCity();
        if (ct !== undefined) {
          tz = `${ct.region}/${ct.city}`;
          // lets make a copy in case this is an invalid time zone,
          // so we can keep using the original string
          tz2 = tz;
          city = ct; // ct.city;
        }
      } catch (e) {
        console.error(e);
      } finally {
        drawClock(city);
        await createSelect(city);
      }
    })();
  }

  reset(tz);

  /**
   * <p>A callback to redraw the four handles and the legend of the clock.</p>
   * @callback drawHandles
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString Date.prototype.toLocaleString()}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/measureText CanvasRenderingContext2D: measureText() method}
   * @see {@link https://www.iana.org/time-zones Time Zone Database}
   */
  return () => {
    /**
     * Function for changing the closure state.
     * @param {String} tz
     * @global
     */
    runAnimation.setLocation = function (tz) {
      reset(tz || timezone);
    };
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
    const hours12 = (+hours + delta) % 12 || 12;

    // 24 hours format: AM / PM
    const hours24 = (+hours + delta) % 24 || 24;

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
      let coord = polar2Cartesian(0.057 * clockRadius, handle.time2Angle);
      coord = translate(coord, center);
      ctx.moveTo(coord.x, coord.y);

      coord = polar2Cartesian(handle.length * clockRadius, handle.time2Angle);
      coord = translate(coord, center);
      ctx.lineTo(coord.x, coord.y);
      ctx.lineWidth = handle.width;
      ctx.stroke();
    });

    // Clear screen.
    lctx.clearRect(0, 0, legend.width, legend.height);

    const theight = legend.width / 45;
    lctx.font = setFont(theight);
    lctx.fillStyle = color.white1;

    // Draw the legend: UTC, Region, City, Date.
    const date = `${day} / ${month} / ${year}`;
    const utc = `UTC ${cityOffset}`;
    let [region, lcity] = _USE_LOCAL_TIME_
      ? [localRegion.country, localRegion.city]
      : tz2.split("/");
    lcity = lcity.replaceAll("_", " ");
    const [tcity, tregion, tlen, tutc] = [lcity, region, date, utc].map((p) =>
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
 * <p>Callback for key pressed.</p>
 * Valid keys:
 * <ul>
 *  <li>n, +: next city.</li>
 *  <li>N, -: previous city.</li>
 *  <li>b: back to cwdc</li>
 *  <li>B: back to 10-html5css3</li>
 *  <li>⌘-esc or ⌘-e: clear local storage</li>
 * </ul>
 * @param {KeyboardEvent} event keydown event.
 */
const handleKeyPress = (event) => {
  let key = event.key;
  switch (key) {
    case "+":
      key = "n";
    case "n":
      drawClock.location(key);
      break;
    case "-":
      key = "N";
    case "N":
      drawClock.location(key);
      break;
    case "Escape":
    case "e":
      if (event.metaKey || event.ctrlKey) {
        localStorage.clear();
        alert("Local storage has been cleared");
      }
      break;
    case "b":
      window.location.href = "/cwdc";
      break;
    case "B":
      const path = window.location.pathname;
      window.location.href = path.split("/", 3).join("/");
      break;
  }
};

/**
 * Returns a new keyboard event.
 * @param {String} key char code.
 * @returns {KeyboardEvent} a keyboard event.
 * @function
 */
const createEvent = (key) => {
  const code = key.charCodeAt();
  return new KeyboardEvent("keydown", {
    key: key,
    which: code,
    charCode: code,
    keyCode: code,
  });
};

/**
 * <p>Choose next/previous location when a button is clicked.</p>
 *
 * <p>The click event is fired when a point-device button is pressed, a touch gesture is performed or
 * a user interaction that is equivalent to a click is performed by pressing a key (Enter or Space).</p>
 *
 * <p>The callback argument sets the {@link handleKeyPress callback}
 * that will be invoked when the event is dispatched.</p>
 *
 * @event click
 * @param {PointerEvent} event a mouse or touch event.
 * @param {callback} function function to run when the event occurs.
 * @see {@link hhttps://developer.mozilla.org/en-US/docs/Web/API/Element/click_event Element: click event}
 */
if (document.querySelector("button")) {
  document.querySelectorAll(".btnz").forEach((elem) => {
    elem.addEventListener("click", function (event) {
      handleKeyPress(createEvent(elem.textContent));
    });
  });
}

/**
 * <p>Choose next/previous location when a key is pressed.</p>
 *
 * <p>The keydown event is fired when a key is pressed.</p>
 *
 * <p>The callback argument sets the {@link handleKeyPress callback}
 * that will be invoked when the event is dispatched.</p>
 *
 * @event keydown
 * @param {KeyboardEvent} event keyboard event.
 * @param {callback} function function to run when the event occurs.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event Element: keydown event}
 */
window.addEventListener("keydown", (event) => handleKeyPress(event));

/**
 * <p>Triggers the {@link runAnimation animation}.</p>
 *
 * @event load
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event Window: load event}
 */
window.addEventListener("load", (event) => runAnimation());

/**
 * Resize the canvases according to the size of the browser's window.
 */
function handleWindowResize() {
  let h = window.innerHeight - 2 * cpadd - 16;
  let w = window.innerWidth - 2 * cpadd - 16;
  if (h > w) {
    h = w / aspect; // aspect < 1
  } else {
    w = h * aspect; // aspect > 1
  }

  canvas.width = w;
  canvas.height = h;
  handles.width = w;
  handles.height = h;
  legend.width = w + cpadd;
  legend.height = h + cpadd;

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
   * @event resize
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event Window: resize event}
   */
  window.addEventListener("resize", handleWindowResize, false);
  handleWindowResize();
}
