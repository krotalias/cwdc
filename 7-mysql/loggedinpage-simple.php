<?php

/**
 * Called when a user is already authenticated.
 *
 * Then, if $_SESSION["id"] is set, a paragraph is created with
 * a text "Logged In!" plus a link to script 8.9.php
 * with a link text "Log out!", <br>
 * passing an argument logout=1, which can be accessed in $_GET array.
 *
 * Otherwise, the header is redirected to script 8.9.php
 *
 * PHP version 5.3+
 *
 * @file loggedinpage-simple.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/8.9.php
 * @see       <a href="/cwdc/7-mysql/8.9.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=loggedinpage-simple">source</a>
 * @see       https://www.php.net/manual/en/function.header.php
 * @see       https://www.php.net/manual/en/function.isset.php
 * @since     10/02/2021
 */

session_start();
/// @cond
if (isset($_COOKIE["id"])) {
    $_SESSION["id"] = $_COOKIE["id"];
}

if (isset($_SESSION["id"])) {
    // sign up always adds the last ID.
    // passes logout option as an argument to 8.9.php page,
    // which can be accessed in $_GET array.
    echo "<p>Logged In! <a href='8.9.php?logout=1'>Log out</a></p>";
} else {
    header("Location: 8.9.php");
}
/// @endcond
