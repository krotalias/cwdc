<?php

/**
 * Inserting and Updating Data.
 *
 * A very common operation is the insertion of a new piece
 * of information into a database.
 *
 * Here, we insert an id/email/password, into a table, to identify two new users.
 *
 * This is a typical task performed for signning up a new user to a system.
 *
 * PHP version 5.5+
 *
 * @file 8.4.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/8.4.php
 * @see       <a href="/cwdc/7-mysql/8.4.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=8.4">source</a>
 * @see       https://www.databasejournal.com/features/mysql/how-mysql-protects-your-password.html
 * @since     09/02/2021
 */

require "connection2.php";

$newline = (php_sapi_name() == "cli") ? "\n" : "<br />";

// generation of a hashed password
$password = 'I_root_for_Fluminense';
$hash = password_hash($password, PASSWORD_DEFAULT);
$email = 'tommy@gmail.com';
/// @cond MAIN
$query = sprintf(
    "INSERT INTO `users` (`id`, `email`, `password`)
        VALUES(3, '%s', '%s')
        ON DUPLICATE KEY UPDATE
        `email` = '%s',
        `password` = '%s'",
    $email,
    $hash,
    $email,
    $hash
);

mysqli_query($link, $query);

// clear text password - really bad!
$silly_password = 'uedjUFH7^%';
$query = sprintf(
    "UPDATE `users` SET password = '%s' WHERE `id` = 1 LIMIT 1",
    $silly_password
);

mysqli_query($link, $query);

$query = "SELECT * FROM `users`";

if ($result = mysqli_query($link, $query)) {
    while ($row = mysqli_fetch_array($result)) {
        echo sprintf(
            "Your id is %s, your email is %s and your password is %s%s",
            $row[0],
            $row[1],
            $row[2],
            $newline
        );
        if ($row[0] == 3) {
            echo sprintf(
                "Password verified for id %s: %s%s",
                $row[0],
                password_verify($password, $row[2]) ? "true" : "false",
                $newline,
            );
        }
    }
}
/// @endcond
