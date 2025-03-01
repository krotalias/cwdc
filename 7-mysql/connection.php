<?php

/**
 * Opens a connection to the MySQL Server, via dotenv, installed through composer:
 * - curl -sS https://getcomposer.org/installer | php
 * - sudo mv composer.phar /usr/local/bin/composer
 * - sudo chmod +x /usr/local/bin/composer
 * - sudo chown root /usr/local/bin/composer
 * - composer require vlucas/phpdotenv
 *
 * PHP version 5.3+
 *
 * @file connection.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/connection.php
 * @see       <a href="/cwdc/7-mysql/connection.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=connection">source</a>
 * @see       https://www.php.net/manual/en/function.mysqli-connect.php
 * @see       https://www.php.net/manual/en/mysqli.construct.php
 * @see       https://www.php.net/manual/en/mysqli.connect-error.php
 * @since     16/02/2021
 */

require_once('vendor/autoload.php');

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

/// An object which represents the connection to a MySQL Server, or false on failure.
$link = mysqli_connect(
    $_ENV['DB_HOST'],
    $_ENV['MYSQLUSER'],
    $_ENV['MYSQLPASSWORD'],
    $_ENV['MYSQLDATABASE']
);
if (mysqli_connect_error()) {
    die("Database Connection Error");
}
