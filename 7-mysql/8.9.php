<?php

/**
 * Remember-me cookies.
 *
 * This small script uses a cookie with the id number of a user (mysql row['id'])
 * to remember that a user has already logged in.
 *
 * When a user is authenticated, a session is created to save the user id on the server.
 * Since the session lifespan is at most until the browser is closed, <br>
 * the cookie purpose is just to remember a previous login and reset the session,
 * thus avoiding the authentication process again.
 *
 * \image html http.png "HTTP: Request - Response cycle" width=512
 *
 * Since the http protocol is memoryless, that is, the connection is closed after
 * a request - response cycle, <br> the authentication process would have to be carried out
 * every time, obliging the user to type his/her password again and again.
 *
 * A hidden tag 'signUp' indicates whether the user is signing up
 * (value == 1) up or just logging in (value == 0).
 * - when a user successfully signs up, and checks "Stay logged in",
 * the last ID created is saved via cookie.
 * - when a user successfully logs in, and checks "Stay logged in",
 * the ID of the user is saved via cookie.
 *
 * In either case, we are redirected to a script loggedinpage-simple.php:
 * - when the cookie is set, it creates a paragraph,
 *   with a message "Logged In!", and a link
 * "Log out" to page 8.9.php?logout=1, <br> with a parameter logout sent via GET.
 * - otherwise, we are just redirected to script 8.9.php again,
 *   and a new log in or sign up can be made.
 *
 * PHP version 5.3+
 *
 * @file 8.9.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/8.9.php
 * @see       <a href="/cwdc/7-mysql/8.9.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=8.9">source</a>
 * @see       https://www.php.net/manual/en/function.header.php
 * @see       https://en.wikipedia.org/wiki/HTTP_cookie
 * @see       https://chartio.com/learn/sql-tips/single-double-quote-and-backticks-in-mysql-queries/
 * @see       https://www.youtube.com/watch?v=3ksS753GyyE
 * @since     10/02/2021
 */

session_start();

require "../6-php/blockIPs.php";

require "authenticate.php";

/// Any error message generated during authentication.
$error = $login("loggedinpage-simple.php");
?>

<script>
    /**  Implements a radio button set, but with checkboxes,
     *   by unchecking all checkboxes, <br> and then setting the state
     *   of the checkbox passed as argument.
     *
     *   @param obj the checkbox that has been checked or unchecked.
     */
    function change(obj) {
        var instate = (obj.checked);
        var checkboxes = document.getElementsByName('stayLoggedIn');
        // uncheck all checkboxes
        checkboxes.forEach(cb => cb.checked = false);
        obj.checked = instate;
    }
</script>

<div id="error"><?php echo $error; ?></div>

<form method="post">
    <input type="email" name="email" placeholder="Your Email">
    <input type="password" name="password" placeholder="Password">
    <label>
        <!-- return '1' if checked -->
        <input type="checkbox" id="cb1" name="stayLoggedIn" value=1 onclick="change(this)"> Stay logged in
    </label>

    <!--
         The hidden field is not shown to the user,
         but the data is sent when the form is submitted.
    -->
    <input type="hidden" name="signUp" value="1"> <!-- indicates sign up -->
    <input type="submit" name="submit" value="Sign Up!">
</form>

<br>

<form method="post">
    <input type="email" name="email" placeholder="Your Email">
    <input type="password" name="password" placeholder="Password">
    <label>
        <input type="checkbox" id="cb2" name="stayLoggedIn" value=1 onclick="change(this)"> Stay logged in
    </label>
    <input type="hidden" name="signUp" value="0"> <!-- indicates log in -->
    <input type="submit" name="submit" value="Log In!">
</form>