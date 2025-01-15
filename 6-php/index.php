<?php

/**
 * A set of simple PHP programs to develop basic programming skills.
 *
 * \mainpage CWDC PHP (Hypertext Preprocessor)
 *
 * <p>The set is made up of 13 small programs in increasing order of difficulty. </p>
 *
 * PHP code is usually processed on a web server by a PHP interpreter implemented:
 * - as a module,
 * - a daemon or
 * - as a Common Gateway Interface (CGI) executable.
 *
 * As a matter of fact, PHP is a preprocessor that runs on the server,
 * not on the browser, as Javascript.
 * - Therefore, a PHP script will always run FIRST, before anything else.
 * - Documentation either with <a href="/python/ADs/cederj/AD1_2020-1.pdf#page=5">Doxygen</a> or
 *   <a href="https://www.phpdoc.org">phpDocumentator</a>.
 * <br>
 *
 * PHP version 5.3+
 *
 * @section notes release.notes
 * - These programs run in any browser and the server must have
 *   either PHP 5.4, PHP 7.3 or PHP 8.1
 * - Watch <a href="https://www.youtube.com/watch?v=DFPvnxIgwKA">vscode</a> and
 *   <a href="https://www.youtube.com/watch?v=MDUAxMPYQPA">XDebug</a> configuration videos.
 * - It is necessary to have a live server, such as
 *   <a href="/python/ADs/cederj/AD1_2021-2.pdf#page=10">Apache</a>,
 *   <a href="https://www.apachefriends.org">XAMPP</a> or even
 *   <a href="https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer">vscode's</a>
 *   live server web extension, to run php scripts. <br>
 * <b>File open</b> in the browser will not work.
 *
 * @file index.php
 *
 * PHP.
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      https://www.lcg.ufrj.br/cwdc/6-php/
 * @see       https://en.wikipedia.org/wiki/PHP
 * @see       https://www.programming-books.io/essential/php/
 * @see       https://www.hackingwithphp.com
 * @see       https://www.onlineprogrammingbooks.com/php-notes-for-professionals/
 * @see       https://www.syncfusion.com/ebooks/php_succinctly
 * @see       https://ritwickdey.github.io/vscode-live-server/
 * @see       <a href="/python/ADs/cederj/AD1_2021-2.pdf#page=10">Installing Apache</a>
 * @see       https://www.php.net
 * @since     13/02/2021
 */

$title = "6 - php";
require "../mainPage/header.php";
require "../mainPage/navbar.php";
?>

<div class="lesson">
    <h3>
        <a href="https://www.php.net/manual/en/langref.php">PHP</a>
        <a href="doc/html">(doc)</a>
        <a href="https://www.w3definitions.com/?s=php">(books)</a>
    </h3>

    <ol type="1" start="1">
        <li>
            <a href="7.2.php">Hello World</a>
            <a href="showcode.php?f=7.2"> (source)</a>
        </li>
        <li>
            <a href="7.3.php">Variables</a>
            <a href="showcode.php?f=7.3"> (source)</a>
        </li>
        <li>
            <a href="7.4.php">Arrays</a>
            <a href="showcode.php?f=7.4"> (source)</a>
        </li>
        <li>
            <a href="7.5.php?name=paul&age=18">If Statements</a>
            <a href="showcode.php?f=7.5"> (source)</a>
        </li>
        <li>
            <a href="7.6.php">For and For Each Loops</a>
            <a href="showcode.php?f=7.6"> (source)</a>
        </li>
        <li>
            <a href="7.7.php?number=30">While Loops</a>
            <a href="showcode.php?f=7.7"> (source)</a>
        </li>
        <li>
            <a href="7.8.php">Prime Testing</a> ($_GET)
            <a href="showcode.php?f=7.8"> (source)</a>
        </li>
        <li>
            <a href="cadastro/7.9.php">CPF</a> ($_POST)
            <a href="showcode.php?f=cadastro/7.9"> (source)</a>
            <a href="showcode.php?f=cadastro/cadastro_nacional"> (source)</a>
            <a href="/python/provas/cederj/AP1_PI_22_2.pdf"> (doc)</a>
        </li>
        <li>
            <a href="cadastro/7.9.1.php">CNPJ</a> ($_POST)
            <a href="showcode.php?f=cadastro/7.9.1"> (source)</a>
            <a href="showcode.php?f=cadastro/cadastro_nacional"> (source)</a>
            <a href="/python/provas/cederj/AP3_PI_22_2.pdf"> (doc)</a>
        </li>
        <li>
            <a href="7.10.php">Sending an e-mail with PHP</a>
            <a href="showcode.php?f=7.10"> (source)</a>
        </li>
        <li>
            <a href="7.11.php">A Contact Form</a>
            <a href="showcode.php?f=7.11"> (source)</a>
        </li>
        <li>
            <a href="7.12.php">Getting Contents of Other Scripts</a>
            <a href="showcode.php?f=7.12"> (source)</a>
        </li>
        <li>
            <a href="weather/7.13.1.php">Weather Scraper</a>
            <a href="showcode.php?f=weather/parseWeather">(source)</a>
            <a href="showcode.php?f=weather/7.13.1">(html)</a>
            <a href="weather/forecast.png">
                <img height="40" style="border:0; text-align: center" src="weather/forecast.png" />
            </a>
        </li>
        <li>
            <a href="weather_python/7.14.php">Weather Scraper</a>
            <a href="../11-python/showCodePython.php?f=web-scraper"> (Python)</a>
            <a href="weather_python/scrape.js">(source)</a>
            <a href="showcode.php?f=weather_python/7.14">(html)</a>
            <a href="/python/provas/cederj/AP2X_PI_21_2.pdf">(Web-Scraper doc)</a>
        </li>
    </ol>
</div>
<hr>

<footer class="footer">
    <div class="container-fluid" style="text-align: center;">
        <a href="https://www.militaryfactory.com/aircraft/detail.asp?aircraft_id=89">
            <figure>
                <img
                    title="Grumman F4F-3 Wildcat"
                    alt="1940"
                    src="Grumman-F4F-Wildcat.jpg"
                    class="pimg"
                />
                <figcaption>
                    Grumman F4F-3 Wildcat (1940 - 534 kmh)
                </figcaption>
            </figure>
        </a>
    </div>
</footer>

<script src="../mainPage/main.js"></script>

<?php require "../mainPage/footer.php"; ?>

</body>

</html>