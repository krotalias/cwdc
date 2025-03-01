<?php

/**
 * Updates the diary contents in the users table.
 *
 * PHP version 5.3+
 *
 * @file updatedatabase.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/updatedatabase.php
 * @see       <a href="/cwdc/7-mysql/updatedatabase.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=updatedatabase">source</a>
 * @see       https://www.php.net/manual/en/mysqli.real-escape-string.php
 * @since     16/02/2021
 */

session_start();
if (array_key_exists("content", $_POST)) {
    include "connection.php";

    $query = sprintf(
        "UPDATE `users` SET `diary` = '%s'
        WHERE id = '%s' LIMIT 1",
        mysqli_real_escape_string($link, $_POST["content"]),
        mysqli_real_escape_string($link, $_SESSION["id"])
    );
    mysqli_query($link, $query);
}
