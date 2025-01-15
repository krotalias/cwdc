<?php

/**
 * Conditional Statements.
 *
 * PHP if...else...elseif Statements.
 *
 * Conditional statements are used to perform
 * different actions based on different conditions.
 *
 * PHP version 5.3+
 *
 * @file 7.5.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/7.5.php?name=louie&age=33
 * @see       <a href="/cwdc/6-php/7.5.php?name=louie&age=33">link</a>
 * @see       https://www.w3schools.com/php/php_if_else.asp
 * @see       https://www.lennyfaceguru.com
 * @since     02/02/2021
 */

$newline = (php_sapi_name() == "cli") ? "\n" : "<br />";

/**
 * Converts an integer number to its roman numeral representation.
 *
 * This is a naive implementation, which uses four whiles and nine ifs.
 *
 * @param $num given number.
 *
 * @return a string with $num represented as a roman numeral.
 */
function int2roman($num)
{
    $romano = ""; // Empty string
    if ($num >= 4000 || $num < 1) {
        $romano = "N/A";
    } else {
        while ($num >= 1000) {
            $romano = $romano . "M";
            $num = $num - 1000;
        }

        if ($num >= 900) {
            $romano = $romano . "CM"; // Concatenate letters to the right side
            $num = $num - 900;
        }

        if ($num >= 500) {
            $romano = $romano . "D";
            $num = $num - 500;
        }

        if ($num >= 400) {
            $romano = $romano . "CD";
            $num = $num - 400;
        }

        while ($num >= 100) {
            $romano = $romano . "C";
            $num = $num - 100;
        }

        if ($num >= 90) {
            $romano = $romano . "XC";
            $num = $num - 90;
        }

        if ($num >= 50) {
            $romano = $romano . "L";
            $num = $num - 50;
        }

        if ($num >= 40) {
            $romano = $romano . "XL";
            $num = $num - 40;
        }

        while ($num >= 10) {
            $romano = $romano . "X";
            $num = $num - 10;
        }

        if ($num >= 9) {
            $romano = $romano . "IX";
            $num = $num - 9;
        }

        if ($num >= 5) {
            $romano = $romano . "V";
            $num = $num - 5;
        }

        if ($num >= 4) {
            $romano = $romano . "IV";
            $num = $num - 4;
        }

        while ($num >= 1) {
            $romano = $romano . "I";
            $num = $num - 1;
        }
    }

    return $romano;
}

/**
 * Generating output.
 *
 * @param $name user name.
 * @param $age user age.
 *
 * @return output string.
 */
function main($name, $age)
{
    global $newline;

    $user = "king";
    $answer = "";

    if ($user == $name) {
        $answer = sprintf("Hello %s ( ͡ᵔ ͜ʖ ͡ᵔ )", strtoupper($user));
    } else {
        $answer = sprintf("I don't know you, %s (▱˘︹˘▱)", strtolower($name));
    }

    $answer .= $newline;

    if ($age >= 18 || $user == $name) {
        $answer .= sprintf("You may proceed... your age is %s", int2roman($age));
    } else {
        $answer .= "You are too young, damn it! (⩺_⩹)$newline";
    }
    return $answer;
}

print (main(
    isset($_GET["name"]) ? $_GET["name"] : "louie",
    isset($_GET["age"]) ? intval($_GET["age"]) : 16
));
