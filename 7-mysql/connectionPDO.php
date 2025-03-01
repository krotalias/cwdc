<?php

/**
 * Opens a PDO connection to the MySQL Server, via dotenv, installed through composer:
 * - curl -sS https://getcomposer.org/installer | php
 * - sudo mv composer.phar /usr/local/bin/composer
 * - sudo chmod +x /usr/local/bin/composer
 * - sudo chown root /usr/local/bin/composer
 * - composer require vlucas/phpdotenv
 *
 * PHP version 5.3+
 *
 * @file connectionPDO.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/connectionPDO.php
 * @see       <a href="/cwdc/7-mysql/connectionPDO.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=connectionOO">source</a>
 * @see       https://www.acunetix.com/blog/articles/prevent-sql-injection-vulnerabilities-in-php-applications/
 * @see       https://www.php.net/manual/en/pdo.construct.php
 * @see       https://www.php.net/manual/en/pdo.setattribute.php
 * @since     15/12/2022
 */

require_once('vendor/autoload.php');

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

/**
 * Setup the connection to the database.
 * This is usually called a database handle (dbh).
 */
$dbh = new PDO(
    "mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['MYSQLDATABASE']}",
    $_ENV['MYSQLUSER'],
    $_ENV['MYSQLPASSWORD']
) or die("Database Connection Error");

/**
 * Use PDO::ERRMODE_EXCEPTION, to capture errors and write them to
 * a log file for later inspection instead of printing them to the screen.
 */
$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
