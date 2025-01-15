/**
 * @file
 *
 * Summary.
 * <p>
 * Extracts a short weather summary from a website, by using Python Beautiful Soup.
 * </p>
 *
 *  Description.
 *  <p>jQuery.ajax is used to run python on the server.</p>
 *
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm7 (or npm8)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d doc-scrape scrape.js
 *  </pre>
 *
 *  @see <a href="/cwdc/6-php/weather_python/7.14.php">link</a>
 *  @see <a href="/cwdc/6-php/weather_python/scrape.js">source</a>
 *  @author Paulo Roma Cavalcanti
 *  @since 04/10/2023
 */
"use strict";

/**
 * Since python runs on the server, and javascript on the browser,
 * we need Ajax to communicate with the server.
 */
function scrape() {
  let cita = $("#city").val();
  $.ajax({
    type: "GET",
    crossDomain: true,
    url: "/cwdc/11-python/web-scraper.py",
    data: cita.replace(/\s+/g, "-"),
  })
    .done(function (response) {
      response = JSON.parse(response);
      console.log(response);
      let err = response.includes("not be found");
      if (!err) {
        let city = cita.replace(/\s+/g, "-");
        let link = `<a href="https://www.weather-forecast.com/locations/${city}/forecasts/latest">Go there!</a>`;
        $("#weather").html(`${response}<br>${link}`);
        $("#error").html("");
        $("#weather").show();
        $("#error").hide();
      } else {
        $("#error").html(response);
        $("#weather").html("");
        $("#weather").hide();
        $("#error").show();
      }
      const scraper = {
        city: $("#city").val(),
        weather: !err ? response : "",
        error: err ? response : "",
      };
      localStorage.setItem("scraper", JSON.stringify(scraper));
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.log(
        `[jqResponse: ${JSON.stringify(
          jqXHR,
          null,
          4,
        )}], \n[status: ${textStatus}], \n[error: ${errorThrown}]`,
      );
      $("#error").html("could not load data");
      $("#weather").hide();
      $("#error").show();
      const scraper = {
        city: cita,
        weather: "",
        error: "could not load data",
      };
      localStorage.setItem("scraper", JSON.stringify(scraper));
    });
}

$(document).ready(function () {
  const { city, weather, error } =
    JSON.parse(localStorage.getItem("scraper")) || {};
  if (city) {
    $("#city").val(city);
  }
  if (weather) {
    $("#weather").html(weather);
    $("#weather").show();
  } else if (error) {
    $("#error").html(error);
    $("#error").show();
  } else {
    $("#weather").hide();
    $("#error").hide();
  }
});
