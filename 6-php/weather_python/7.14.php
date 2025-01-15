<?php

/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */

/**
 * Extracts a short weather summary from a website, by using Python Beautiful Soup.
 *
 * PHP version 5.3+
 *
 * @file 7.14.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/weather_python/7.14.php
 * @see       <a href="/cwdc/6-php/weather_python/7.14.php">link</a>
 * @see       <a href="/cwdc/6-php/weather_python/scrape.js">source</a>
 * @see       https://www.php.net/manual/en/function.get-headers.php
 * @see       https://beautiful-soup-4.readthedocs.io/en/latest/
 * @since     12/11/2021
 */

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <!-- Required meta tags -->
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- Bootstrap CSS -->
    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
        crossorigin="anonymous"
    >

    <title>Weather Scraper</title>

    <style type="text/css">
        body {
            background: url("Spitfire P7350.jpg") no-repeat center center fixed;
            background-size: cover;
        }

        .container {
            text-align: center;
            margin-top: 100px;
            width: 400px;
        }

        #weather,
        #error {
            display: none;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>
            What's The
            <a
                class="link-warning link-offset-2 link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
                href="https://www.weather-forecast.com/countries"
                >Weather</a
            >?
        </h1>

        <form>
            <fieldset class="form-group">
                <label for="city" class="text-white mb-2">Enter the name of a city.</label>
                <input
                    type="text"
                    class="form-control"
                    name="city"
                    id="city"
                    placeholder="Eg. London, Tokyo"
                    value="<?php if (isset($_GET["city"])) {
                                echo $_GET["city"];
                           } ?>"
                >
            </fieldset>

            <button class="btn btn-primary m-4" type="button" onclick="scrape()">
                Submit
            </button>
        </form>

        <div id="weather" class="alert alert-success" role="alert"></div>

        <div id="error" class="alert alert-danger" role="alert"></div>
    </div>

    <script
        src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"
        integrity="sha384-1H217gwSVyLSIfaLxHbE7dRb3v4mYCKbpQvzx0cegeju1MVsGrX5xXxAvs/HgeFs"
        crossorigin="anonymous"
    ></script>
    <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
        crossorigin="anonymous"
    ></script>

    <script type="text/javascript" src=scrape.js></script>
</body>
</html>