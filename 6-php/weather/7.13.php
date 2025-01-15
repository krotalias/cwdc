<?php
require "parseWeather.php";
?>

<!doctype html>
<html lang="en">

<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css"
        integrity="sha384-zCbKRCUGaJDkqS1kPbPd7TveP5iyJE0EjAuZQTgFLD2ylzuqKfdKlfG/eSrtxUkn"
        crossorigin="anonymous"
    >

    <title>Weather Scraper</title>

    <style type="text/css">
        /*
           http://unsplash.com
           https://css-tricks.com/perfect-full-page-background-image/
        */
        html {
            background: url(109E03.05-2.jpg) no-repeat center center fixed;
            -webkit-background-size: cover;
            -moz-background-size: cover;
            -o-background-size: cover;
            background-size: cover;
        }

        body {
            background: none;
        }

        .container {
            text-align: center;
            margin-top: 100px;
            width: 450px;
        }

        input {
            margin: 20px 0;
        }

        #weather {
            margin-top: 15px;
        }
    </style>
</head>

<body>
    <div class="container">

        <h1>
            What's The
            <a href="https://www.weather-forecast.com/countries">
                Weather?
            </a>
        </h1>

        <form method="get">
            <fieldset class="form-group">
                <label for="city">Enter the name of a city.</label>
                <input
                    type="text"
                    class="form-control"
                    name="city" id="city"
                    placeholder="Eg. London, Tokyo"
                    value="<?php if (array_key_exists("city", $_GET)) {
                                echo $_GET["city"];
                           } ?>"
                >
            </fieldset>

            <button type="submit" class="btn btn-primary">Submit</button>
        </form>

        <div id="weather">
            <?php
            if ($weather) {
                echo "
                    <div class=\"alert alert-success\" role=\"alert\">
                        $weather
                    </div>
                ";
            } elseif ($error) {
                echo "
                    <div class=\"alert alert-danger\" role=\"alert\">
                        $error
                    </div>
                ";
            }
            ?>
        </div>
    </div>

    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script
        src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"
        integrity="sha384-1H217gwSVyLSIfaLxHbE7dRb3v4mYCKbpQvzx0cegeju1MVsGrX5xXxAvs/HgeFs"
        crossorigin="anonymous"
    ></script>
    </script>
    <script
        src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"
        integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN"
        crossorigin="anonymous"
    ></script>
    <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.min.js"
        integrity="sha384-VHvPCCyXqtD5DqJeNxl2dtTyhF78xXNXdkwX1CZeRusQfRKp+tA7hAShOK/B/fQ2"
        crossorigin="anonymous"
    ></script>
</body>

</html>
