<?php

/**
 * Variables in PHP.
 *
 * In PHP, a variable starts with the $ sign,
 * followed by the name of the variable.
 *
 * PHP version 5.3+
 *
 * @file 7.3.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/7.3.php
 * @see       <a href="/cwdc/6-php/7.3.php">link</a>
 * @see       https://www.w3schools.com/php/php_variables.asp
 * @see       https://www.php.net/manual/en/function.echo.php
 * @since     02/02/2021
 */

$newline = (php_sapi_name() == "cli") ? "\n" : "<br />";

$name = "Nobody";

echo "My name is $name$newline";

$string1 = "This is the first part";

$string2 = "of a sentence$newline";

echo "$string1 $string2";

$myNumber = 45;

$calculation = ($myNumber * 31) / 97 + 4;

echo "The result of the calculation is $calculation$newline";

$myBool = false;

printf("This statement is true? %d%s", $myBool, $newline);

$variableName = $name;

echo "$variableName$newline";
