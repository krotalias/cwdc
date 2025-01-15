<?php

/**
 * Include and file_get_contents.
 *
 * The include expression includes and evaluates the specified file.
 *
 * file_get_contents() returns the file in a string,
 * starting at the specified offset up to maxlen bytes.
 *
 * On failure, file_get_contents() will return false.
 *
 * PHP version 5.3+
 *
 * @file 7.12.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/7.12.php
 * @see       <a href="/cwdc/6-php/7.12.php">link</a>
 * @see       https://www.php.net/manual/en/function.file-get-contents.php
 * @see       https://www.php.net/manual/en/function.include.php
 * @since     02/02/2021
 */

require "includedfile.php";

// Get the html contents and display it.
echo file_get_contents("https://www.ecowebhosting.co.uk");
