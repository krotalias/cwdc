<?php

/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */

/**
 * Extracts a short weather summary from a website.
 *
 * The format of the request is given below:
 * - http://www.weather-forecast.com/locations/Rio-de-Janeiro/forecasts/latest
 *
 * White spaces should be removed from the city name.
 *
 * This is the piece of the html string we are interested in:
 * <pre>
 *   (1\&ndash;3 days):
 *       \</div>
 *        \<p class="location-summary__text">
 *           \<span class="phrase">Mostly dry. Warm (max 34&deg;C on Thu
 *    morning, min 22&deg;C on Tue night). Wind will be generally light.\</span>
 * </pre>
 *
 * PHP version 5.3+
 *
 * @file parseWeather.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/weather/7.13.php
 * @see       <a href="/cwdc/6-php/weather/7.13.php">link</a>
 * @see       https://www.php.net/manual/en/function.get-headers.php
 * @since     30/09/2020
 */

/**
 * Access the site weather-forecast.com and extract the weather of a given city.
 *
 * We could have used
 * - global $error, $weather
 *
 * but I do not like global variables.
 *
 * @param $city  city name.
 * @param $error string passed by reference for getting error messages.
 *
 * @return string with a short weather summary.
 *
 * @see https://www.weather-forecast.com
 * @see https://www.php.net/manual/en/language.references.pass.php
 * @see https://www.php.net/manual/en/language.variables.scope.php
 * @see https://www.php.net/manual/en/function.explode.php
 * @see https://www.php.net/manual/en/function.list.php
 */
function parseWeather($city, &$error)
{
    define("NEW_FORMAT", true);

    // Local variables.
    $error = "";
    $weather = "";

    $site = "";
    $complement = "";
    $data = "";
    $dataEnd = "";

    // Use the new site format or the old format from 2016.
    if (NEW_FORMAT) {
        $site = "https://www.weather-forecast.com/locations/";
        $complement = "/forecasts/latest";
        $data = "(1&ndash;3 days):";
        $dataEnd = "</span>";
    } else {
        // Rob Percival <https://twitter.com/techedrob>
        $site = "http://completewebdevelopercourse.com/locations/";
        $data =
            '3 Day Weather Forecast Summary:</b><span class="read-more-small"><span class="read-more-content"> <span class="phrase">';
        $dataEnd = "</span></span></span>";
    }

    // The "@" will silence any php errors a function could raise.
    // The @ will temporarily set error_reporting to 0
    // but will not "suppress" the error.
    // All PHP expressions can be called with the "@" prefix,
    // which turns off error reporting for that particular expression.
    $file_headers = @get_headers($site . $city . $complement);

    // print_r($file_headers);
    // $file_headers[0] => HTTP/1.1 301 Moved Permanently
    if ($file_headers[9] == "HTTP/1.1 404 Not Found") {
        $error = "$city city could not be found.";
    } else {
        // https://www.php.net/manual/en/function.file-get-contents.php
        $forecastPage = @file_get_contents($site . $city . $complement);

        if ($forecastPage != false) {
            // echo $forecastPage;

            // list() is used to assign a list of variables in one operation.
            // explode() returns an array of strings, each of which is a substring
            // of string formed by splitting it on boundaries formed by
            // the string separator.
            list($before, $after) = explode($data, $forecastPage);

            // print_r($pageArray);
            // echo sizeof($pageArray);
            // The explode() function breaks (splits) a string into an array,
            // at the separator string.
            if ($after !== "") {
                list($before, $after) = explode($dataEnd, $after);

                if ($before !== "") {
                    // remove the garbage at the beginning
                    $weather = str_replace("</div>", "", $before);
                    $weather = str_replace(
                        '<span class="phrase">',
                        "",
                        $weather
                    );
                    $weather = str_replace(
                        '<p class="location-summary__text">',
                        "",
                        $weather
                    );
                } else {
                    $error = "$city city could not be found (2).";
                }
            } else {
                $error = "$city city could not be found (3).";
            }
        } else {
            $error = "$city city could not be found (4).";
        }
    }
    return $weather;
}

/**
 * Writes/reads the last query in/from the browser's local storage.
 *
 * Since localStorage is in the client, we have to send javascript code,
 * so it is run there, and not here, on the server.
 *
 * We use json to stringfy the scraper object:
 * - scraper {
 *            "city":"Chicago",
 *            "weather":"Mostly dry. Freeze-thaw conditions (max 2&deg;C on Fri afternoon,
 *                       min -1&deg;C on Wed night). Wind will be generally light.",
 *            "error":""
 *            }
 *
 * We could have used
 * - global $error, $weather
 *
 * but I do not like global variables.
 *
 * @param $weather weather forecast.
 * @param $error string with error messages.
 */
function handleLocalStorage($weather, $error)
{
    if (!empty($weather)) {
        echo "
            <script>
                let city = $('#city').val().replace(/\s+/g, '-');
                let link = `<a href=\"https://www.weather-forecast.com/locations/\${city}/forecasts/latest\">Go there!</a>`;
                $('#weather').html(`$weather<br>\${link}`);
                $('#weather').show();
                $('#error').hide();
                const scraper = {
                    city: $('#city').val(),
                    weather: '$weather',
                    error: ''
                }
                localStorage.setItem('scraper', JSON.stringify(scraper));
            </script>
        ";
    } elseif (!empty($error)) {
        echo "
            <script>
                $('#error').html('$error');
                $('#weather').hide();
                $('#error').show();
                const scraper = {
                    city: $('#city').val(),
                    weather: '',
                    error: '$error'
                }
                localStorage.setItem('scraper', JSON.stringify(scraper));
            </script>
        ";
    } else {
        // nothing has been submited - get data from localStorage
        echo "
            <script>
                const {city,weather,error} = JSON.parse(localStorage.getItem('scraper')) || {};
                if (city) {
                    $('#city').val(city);
                }
                if (weather) {
                    $('#weather').html(weather);
                    $('#weather').show();
                    $('#error').hide();
                } else if (error) {
                    $('#error').html(error);
                    $('#error').show();
                    $('#weather').hide();
                } else {
                    $('#weather').hide();
                    $('#error').hide();
                }
            </script>
        ";
    }
}

/// String holding the weather description.
$weather = "";
/// String holding the error messages.
$error = "";
if (isset($_GET["city"])) {
    $weather = parseWeather(preg_replace("/\s+/", "-", $_GET["city"]), $error);
}
