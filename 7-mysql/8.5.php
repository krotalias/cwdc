<?php

/**
 * Search: looping through data.
 *
 * A very common operation is the search for a specific piece
 * of information into a database.
 * Here, we insert an email/password, into a table, to identify a user,
 * if he is not already in the database. <br>
 * This is a typical task performed for signning up a new user to a system.
 *
 * Be aware that every time a variable is into a mysql string,
 * it should be escaped to avoid any nasty character that might
 * cause problems in our code, suuch as mysql injection code.
 *
 * PHP version 5.3+
 *
 * @file 8.5.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/8.5.php
 * @see       <a href="/cwdc/7-mysql/8.5.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=8.5">source</a>
 * @see       https://www.php.net/manual/en/mysqli.real-escape-string.php
 * @see       https://www.w3schools.com/php/func_mysqli_real_escape_string.asp
 * @since     09/02/2021
 */

require "../6-php/blockIPs.php";

if (isset($_POST["email"]) or isset($_POST["password"])) {
    include "connection2.php";

    if ($_POST["email"] == "") {
        echo "<p>Email address is required.</p>";
    } elseif ($_POST["password"] == "") {
        echo "<p>Password is required.</p>";
    } else {
        // filter data from forms to avoid mysql code injection
        $email = mysqli_real_escape_string($link, $_POST["email"]);
        $password = mysqli_real_escape_string($link, $_POST["password"]);

        $query = sprintf(
            "SELECT `id` FROM `users`
            WHERE email = '%s'",
            $email
        );

        $result = mysqli_query($link, $query);

        // more efficient than using fetch.
        if (mysqli_num_rows($result) > 0) {
            echo "<p>That email address has already been taken.</p>";
        } else {
            $query = sprintf(
                "INSERT INTO `users` (`email`, `password`)
                VALUES ('%s', '%s')",
                $email,
                $password
            );

            if (mysqli_query($link, $query)) {
                echo "<p>You have been signed up!";
            } else {
                echo "<p>There was a problem signing you up - please try again later.</p>";
            }
        }
    }
}
?>

<form method="post">
    <input name="email" type="email" placeholder="Email address">
    <input name="password" type="password" placeholder="Password">
    <input type="submit" value="Sign up">
</form>