<?php

/**
 * Called when a successful signup is made.
 *
 * Then, if $_SESSION["email"] is set, a message "You are logged in!"
 * is displayed.
 *
 * Otherwise, the header is redirected to script 8.6.php
 *
 * PHP version 5.3+
 *
 * @file session.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/8.6.php
 * @see       <a href="/cwdc/7-mysql/8.6.php">link</a>
 * @see       https://www.php.net/manual/en/function.header.php
 * @since     10/02/2021
 */

session_start();
/// @cond
if ($_SESSION["email"]) {
    echo "You are logged in!";
} else {
    /* Redirect browser */
    header("Location: 8.6.php");
}
/// @endcond
