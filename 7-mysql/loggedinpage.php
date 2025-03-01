<?php

/**
 * Called when a user is already authenticated.
 *
 * Then, if $_SESSION["id"] is set, the string
 * $diaryContent receives the diary of the user and
 * a navbar is displayed with the logout button on the right.
 *
 * Otherwise, the header is redirected to script 8.10.1.php
 *
 * PHP version 5.3+
 *
 * @file loggedinpage.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/8.10.php
 * @see       <a href="/cwdc/7-mysql/8.10.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=loggedinpage">source</a>
 * @see       https://www.php.net/manual/en/function.header.php
 * @see       https://www.php.net/manual/en/function.isset.php
 * @since     10/02/2021
 */

session_start();

$location = isset($_GET["loc"]) ? $_GET["loc"] : "8.10.1.php";

/// @cond
if (isset($_COOKIE["id"])) {
    $_SESSION["id"] = $_COOKIE["id"];
}

if (isset($_SESSION["id"])) {
    include "connection.php";

    $query = sprintf(
        "SELECT `diary` FROM `users`
        WHERE id = '%s' LIMIT 1",
        $_SESSION["id"]
    );

    $row = mysqli_fetch_array(mysqli_query($link, $query));

    $diaryContent = $row["diary"];
} else {
    header("Location: $location");
}

require "header.php";

/// @endcond
?>

<nav class="navbar fixed-top navbar-light bg-light">

    <a class="navbar-brand" href="./">Secret Diary</a>
    <div class="float-md-right">
        <a href=<?php echo("{$location}?logout=1") ?>>
            <button class="btn btn-outline" type="submit">Logout</button></a>
    </div>

</nav>

<div class="container-fluid" id="containerLoggedInPage">
    <textarea id="diary" class="form-control"><?php echo $diaryContent; ?></textarea>
</div>

<?php require "footer.php"; ?>