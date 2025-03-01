<?php

/**
 * Sessions.
 *
 * Start a session and redirects to a new page,
 * if a user is successfully signed up.
 *
 * A session is a way to store information (in variables)
 * to be used across multiple pages.
 *
 * Unlike a cookie, the information is not stored on the user's computer.
 *
 * When a session is started, a cookie is sent to the browser,
 * with a single value: the identifier of the session opened on the server.
 * - Set-Cookie: PHPSESSID=4h91dkp7pcp8184nil8rt9ok13; path=/
 *
 * The cookie stores a key-value pair: PHPSESSID and
 * the session identifier, 4h91dkp7pcp8184nil8rt9ok13.
 *
 * Here, the array $_SESSION['email'] holds the email
 * of the user.
 *
 * The session is handled in script session.php.
 *
 * PHP version 5.3+
 *
 * @file 8.6.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      cwdc/7-mysql/8.6.php
 * @see       <a href="/cwdc/7-mysql/8.6.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=8.6">source</a>
 * @see       https://www.w3schools.com/php/php_sessions.asp
 * @see       https://www.php.net/manual/en/function.header.php
 * @see       https://klauslaube.com.br/2012/04/05/entendendo-os-cookies-e-sessoes.html
 * @see       https://thinkbolt.com/articles/php/sessions-in-php
 * @since     10/02/2021
 */

require "../6-php/blockIPs.php";

// first thing, access session variables
session_start();

if (array_key_exists("email", $_POST) or array_key_exists("password", $_POST)) {
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
                // add the email address as a session variable
                $_SESSION["email"] = $email;

                // redirect to a second page,
                // which will show some information about the new account
                header("Location: session.php");
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