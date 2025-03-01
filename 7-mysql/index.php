<?php

/**
 * A set of simple PHP with MySQL programs to develop basic skills.
 *
 * \mainpage CWDC MySQL
 *
 * The set is made up of 10 small programs in increasing order of difficulty.
 * <br>
 *
 * PHP version 5.3+
 *
 * @section notes release.notes
 * - These programs run in any browser and the server must have either
 *   PHP 5.4, PHP 7.3 or <a href="https://www.php.net">PHP 8.2</a> and
 *   MySQL 5.7,
 *   <a href="https://www.mysql.com">MySQL 8.0</a>,
 *   MariaDB 5.5 or
 *   <a href="https://mariadb.org">MariaDB 10.11</a>
 * - Watch <a href="https://www.youtube.com/watch?v=DFPvnxIgwKA">vscode</a> and
 *   <a href="https://www.youtube.com/watch?v=MDUAxMPYQPA">XDebug</a> configuration videos.
 * - It is necessary to have a live server, such as
 *   <a href="https://www.apache.org">Apache</a>,
 *   <a href="https://www.apachefriends.org/pt_br/index.html">XAMPP</a> or even
 *   <a href="https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer">vscode's</a>
 *   live server web extension, to run php scripts. <br>
 *   <b>File open</b> in the browser will not work.
 *
 * @file index.php
 *
 * MySQL.
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql
 * @see       <a href="/cwdc/7-mysql/">7-mysql</a>
 * @see       <a href="/python/ADs/AD1_2021-2.pdf#page=10">Installing Apache</a>
 * @see       https://www.php.net
 * @see       https://mariadb.org
 * @see       https://www.mysql.com
 * @since     13/02/2021
 */

$title = "7 - mysql";
require "../mainPage/header.php";
require "../mainPage/navbar.php";
?>

<div class="lesson">
    <h3>
        <a href="https://www.mysql.com">MySQL</a>
        <a href="doc/html">(doc)</a>
        <a href="https://books.google.com?q=mysql">(books)</a>
    </h3>

    <ol type="1" start="1">
        <li>
            <a href="sql-scripts">Create a Database</a>
        </li>
        <li>
            <a href="https://www.phpmyadmin.net"> phpMyAdmin </a>
            <a href="/phpmyadmin/index.php">
            ⇴
            </a>
            <a href="phpMyAdmin.png">
                <img src="phpMyAdmin.png" width="100" title="phpMyAdmin">
            </a>
        </li>
        <li>
            <a href="8.2.php">Connecting to a Database</a>
            <a href="showcode.php?f=8.2">(source)</a>
            <a href="showcode.php?f=connection2">(connection2)</a>
        </li>
        <li>
            <a href="8.3.php">Retrieving Data From A Database</a>
            <a href="showcode.php?f=8.3"> (source)</a>
        </li>
        <li>
            <a href="8.4.php">Inserting And Updating Data</a>
            <a href="showcode.php?f=8.4"> (source)</a>
        </li>
        <li>
            <a href="8.5.php">Looping Through Data</a>
            <a href="showcode.php?f=8.5"> (source)</a>
        </li>
        <li>
            <a href="8.6.php">Session Variables</a>
            <a href="showcode.php?f=8.6"> (source)</a>
            <a href="showcode.php?f=session"> (source)</a>
        </li>
        <li>
            <a href="8.7.php">Cookies</a>
            <a href="showcode.php?f=8.7"> (source)</a>
        </li>
        <li>
            <a href="8.8.php">Storing Passwords Securely</a>
            <a href="showcode.php?f=8.8"> (source)</a>
            <a href="crackstation.png">
                <img src="crackstation.png" width="100" title="CrackStation">
            </a>
        </li>
        <li>
            <a href="8.8.1.php">Storing Passwords Securely - hash</a>
            <a href="showcode.php?f=8.8.1"> (source)</a>
        </li>
        <li>
            <a href="8.9.php">Secret Diary</a> -
            <a href="https://alexwebdevelop.com/php-sessions-explained/">sessions+cookies</a>
            <a href="source2.php"> (source)</a>
        </li>
        <li>
            <a href="8.10.1.php">Secret Diary</a> -
            <a href="https://www.mustbebuilt.co.uk/php/using-object-oriented-php-with-the-mysqli-extension/">OO</a>
            <a href="sourceOO.php"> (source)</a>
            <a href="cookie-hijacking.png">
                <img src="cookie-hijacking.png" width="100" title="Session Hijacking">
            </a>
        </li>
        <li>
            <a href="8.10.php">Secret Diary</a> -
            <a href="https://phpdelusions.net/pdo">PDO</a>
            <a href="sourcePDO.php"> (source)</a>
            <a href="mysql.png">
                <img src="mysql.png" width="100" title="phpMyAddmin">
            </a>
        </li>
        <li>
            <a href="urna/urna.html">Urna Eletrônica</a> -
            <a href="https://railway.app/project/87db567d-6969-4d4e-9c37-bc87f1fb5a26">
                Railway
            </a>
            <a href="showCodeHtml.php?f=urna">(html)</a>
            <a href="urna/doc/html/index.html">(doc)</a>
            <a href="urna/jsdoc/index.html">(jsdoc)</a>
            <a href="urna/etapas.json">(json)</a>
            <a href="urna/migration.sql">(sql)</a>
        </li>
        <li>
            <a href="https://urna-eletronica-henna.vercel.app">Urna Eletrônica</a> -
            <a href="https://vercel.com/krotalias/urna-eletronica">
                Vercel
            </a>
            <a href="showCodeHtml.php?f=urna-vercel/public/index">(html)</a>
            <a href="/nodejs/vercel/urna-vercel/doc/html/index.html">(doc)</a>
            <a href="/nodejs/vercel/urna-vercel/jsdoc/index.html">(jsdoc)</a>
            <a href="/nodejs/vercel/urna-vercel/etapas.json">(json)</a>
            <a href="/nodejs/vercel/urna-vercel/migration.sql">(sql)</a>
        </li>
        <li>
            <a href="/turmas/api/professor.php">Turmas</a> -
            <a href="/turmas/api/inscricao.php?turma=ICP062">Inscrição</a> -
            <a href="/turmas/api/aluno.php?turma=ICP062">Aluno</a> -
            <a href="/turmas/doc/html">(doc)</a>
        </li>
    </ol>
</div>
<hr>

<footer class="footer">
    <div class="container-fluid" style="text-align: center;">
        <a href="https://www.militaryfactory.com/aircraft/detail.asp?aircraft_id=1433">
            <figure>
                <img
                    title="Curtiss P-40 Warhawk"
                    alt="1941"
                    src="Curtiss P-40 Warhawk.jpg"
                    class="pimg"
                />
                <figcaption>
                    Curtiss P-40E Kittyhawk (1941 - 582 kmh)
                </figcaption>
            </figure>
        </a>
    </div>
</footer>

<script src="../mainPage/main.js"></script>

<?php require "../mainPage/footer.php"; ?>

</body>

</html>
