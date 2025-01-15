<?php

/**
 * PHP while command.
 *
 * The Fibonacci sequence starts with two 1s, and each term afterwards
 * is the sum of its two predecessors:
 * - 1, 1, 2, 3, 5, 8, 13, 21
 *
 * To run in the terminal:
 * - php -f 7.7.php
 *
 * To start an interective shell:
 * - php -a
 *
 * PHP version 7+
 *
 * @file 7.7.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/7.7.php?number=30
 * @see       <a href="/cwdc/6-php/7.7.php?number=30">link</a>
 * @see       https://en.wikipedia.org/wiki/Fibonacci_number
 * @see       https://wiki.php.net/rfc/short_list_syntax
 * @since     31/01/2021
 */

$newline = (php_sapi_name() == "cli") ? "\n" : "<br />";

/**
 * Print the elements of an array.
 *
 * @param $arr array to be printed.
 *
 * @return void
 */
function printArray($arr)
{
    global $newline;

    $f = 0;
    while ($f < sizeof($arr)) {
        echo "$arr[$f] $newline";
        $f++;
    }
}

/**
 * Print the first $n numbers from the Fibonacci sequence.
 *
 * @param $n amount of Fibonacci numbers to be printed.
 *
 * @return string with the fibonacci sequence up to $n.
 */
function fibo($n)
{
    $a = 0;
    $b = 1;
    $s = "";

    $i = 0;
    while ($i <= $n - 1) {
        // use Inline Variable Parsing to convert an integer to a string
        $s .= "$b  ";
        [$a, $b] = [$b, $a + $b];
        $i++;
    }
    return $s;
}
/// @cond MAIN
printArray(["Ralph", "Charles", "Paul", "Larry"]);
$n = isset($_GET["number"]) ? intval($_GET["number"]) : 20;
echo "Fibonacci ($n): ", fibo($n), $newline;
/// @endcond
