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
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
        crossorigin="anonymous"
    >
    <script
        src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"
        integrity="sha384-1H217gwSVyLSIfaLxHbE7dRb3v4mYCKbpQvzx0cegeju1MVsGrX5xXxAvs/HgeFs"
        crossorigin="anonymous"
    ></script>

    <title>Weather Scraper</title>

    <style type="text/css">
        body {
            background: url(109E03.05-2.jpg) no-repeat center center fixed;
            background-size: cover;
        }

        .container {
            text-align: center;
            margin-top: 100px;
            width: 400px;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>
            What's The
            <a
                class="link-danger link-offset-2 link-offset-1-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
                href="https://www.weather-forecast.com/countries"
            >Weather</a
            >?
        </h1>

        <form method="get">
            <fieldset class="form-group">
                <label for="city" class="mb-2">Enter the name of a city.</label>
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

            <button type="submit" class="btn btn-primary m-4">
                Submit
            </button>
        </form>

        <div id="weather" class="alert alert-success" role="alert"></div>

        <div id="error" class="alert alert-danger" role="alert"></div>
    </div>

    <?php
    handleLocalStorage($weather, $error);
    ?>

    <script>
        // detect the back/forward buttons of the browser.
        window.addEventListener('beforeunload', () => {
            let city = document.querySelector("#city");
            city.value = "<?php if (isset($_GET["city"])) {
                            echo $_GET["city"];
                          } ?>"
            // console.log(`User clicked back button: ${city.value}`);
        });
    </script>

    <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
        crossorigin="anonymous"
    ></script>
</body>

</html>
