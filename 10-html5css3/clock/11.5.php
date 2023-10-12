<!DOCTYPE html>
<html>
    <head>
        <title>Flu's Clock</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width" />
        <link rel="stylesheet" href="/cwdc/mainPage/LCG.css" />
        <link rel="stylesheet" href="style-eng.css" />
    </head>

    <body>
        <p id="flu">
            <a href="http://www.fluminense.com.br/site/">Fluminense Football Club</a>
            <sub style="font-size: small">
                <a href="/cwdc/downloads/PDFs/04_LCG_Window-Viewport.pdf">[1]</a>
                <a href="/cwdc/downloads/python/laboratorios2.html#8c">[2]</a>
                <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones">[3]</a>
            </sub>
        </p>

        <div id="container">
            <canvas id="clock" width="503" height="352">
                Please upgrade your browser.
            </canvas>
            <canvas id="handles" width="503" height="352">
                Please upgrade your browser.
            </canvas>
            <canvas id="legend" width="503" height="352">
                Please upgrade your browser.
            </canvas>
        </div>

        <br />
        <div id="address"></div>
        <br />
        <div class="sideBySide">
            <audio id="player"  title="Hino do Fluminense" controls loop>
                <source src="hino-fluminense-fc.mp3" type="audio/mpeg">
                    Please upgrade your browser!
            </audio>

            <button onclick="nextLocation()">+</button>
            <label><b>Location</b></label>
            <button onclick="previousLocation()">-</button>
        </div>

        <small>
            <p>
                Fluminense FC Anthem by
                <a href="https://vejario.abril.com.br/cidade/curiosidades-hinos-times-cariocas/">
                    Lamartine Babo.
                </a>
            </p>
        </small>

        <p>
            <video title="O elástico de Rivelino" width="320" height="240" controls autoplay loop muted>
                <source src="Fluminense 1 x 0 Vasco da Gama - O elastico de Rivelino.mp4" type="video/mp4">
                    Please upgrade your browser!
            </video>
            <br />
            <small id="Rivelino">
                Rivelino's rubberband
                <a href="https://www.youtube.com/watch?v=jt7ebGO6ILg">10/06/1975</a>
                <?php
                $date = date_create("1975-06-10");
                include "date.php";
                print $year;
                ?>
            </small>
            <br />
            <small id="Renato">
                Renato's belly goal
                <a href="https://www.youtube.com/watch?v=CrIFGVYuq6c">25/06/1995</a>
                <?php
                $date = date_create("1995-06-25");
                include "date.php";
                print $year;
                ?>
            </small><br />
            <small id="Cano">
                Cano's half field goal
                <a href="https://www.youtube.com/watch?v=UA-HwS766Hw">12/02/2023</a>
                <?php
                $date = date_create("2023-02-12");
                include "date.php";
                print $year;
                ?>
            </small>
        </p>
        <script src="suncalc.js"></script>
        <script src="clock.js"> </script>
    </body>
</html>
