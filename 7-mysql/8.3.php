<?php

/**
 * Retrieving Data From a Database.
 *
 * A very common operation is the retrieving of a piece
 * of information from a database.
 *
 * Here, we traverse a whole database table, line by line.
 *
 * This is a typical task performed when listing all users of a system.
 *
 * PHP version 5.3+
 *
 * @file 8.3.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/8.3.php
 * @see       <a href="/cwdc/7-mysql/8.3.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=8.3">source</a>
 * @see       https://www.databasejournal.com/features/mysql/how-mysql-protects-your-password.html
 * @see       https://www.w3schools.com/php/func_string_printf.asp
 * @since     09/02/2021
 */

require "connection2.php";

$query = "SELECT * FROM users";

$format = "Your email is %s and your password is %s\n";
if ($result = mysqli_query($link, $query)) {
    while ($row = mysqli_fetch_array($result)) {
        printf(
            PHP_SAPI === 'cli' ? $format : nl2br($format),
            $row[1],
            $row[2]
        );
    }
}
