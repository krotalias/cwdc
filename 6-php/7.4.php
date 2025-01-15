<?php

/**
 * Three ways of specifying an array.
 *
 * An array in PHP is actually an ordered map.
 * A map is a type that associates values to keys.
 *
 * In essence PHP’s arrays are ordered dictionaries, i.e.
 * they represent an ordered list of key/value pairs,
 * where the key/value mapping is implemented using a hashtable.
 *
 * Typically hashtables are not explicitly ordered:
 * The order in which elements are stored in the underlying array
 * depends on the hashing function and will be fairly random.
 *
 * But this behavior is not consistent with the semantics of PHP arrays:
 * If you iterate over a PHP array you will get back the elements
 * in the exact order in which they were inserted.
 *
 * This means that PHP’s hashtable implementation has to support an
 * additional mechanism for remembering the order of array elements.
 *
 * PHP version 5.3+
 *
 * @file 7.4.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/7.4.php
 * @see       <a href="/cwdc/6-php/7.4.php">link</a>
 * @see       https://www.php.net/manual/en/language.types.array.php
 * @see       https://www.php.net/manual/en/function.ksort.php
 * @see       https://www.php.net/manual/en/language.operators.comparison.php
 * @see       https://nikic.github.io/2014/12/22/PHPs-new-hashtable-implementation.html
 * @since     31/01/2021
 */

$newline = (php_sapi_name() == "cli") ? "\n" : "<br />";

/**
 * Print to the browser console.
 *
 * @param $data what to be shown.
 *
 * @return void
 */
function console_log($data)
{
    global $newline;
    $data = json_encode($data);

    echo (php_sapi_name() == "cli") ? "$data$newline" : "<script> console.log($data); </script>";
}

/**
 * A better output for print_r.
 *
 * @param $val varable to be printed.
 *
 * @return void
 */
function print_r2($val)
{
    global $newline;
    $val = print_r($val, true);

    echo (php_sapi_name() == "cli") ? "$newline$val$newline" : "<pre>$val</pre>";
}

/**
 * Spaceship Operator (<=>) in PHP 5.
 *
 * @param $a first value.
 * @param $b second value.
 *
 * @return 0 if $a == $b
 *         -1 if $a < $b
 *          1 if $a > $b
 */
function spaceship($a, $b)
{
    if ($a == $b) {
        return 0;
    } elseif ($a > $b) {
        return 1;
    } else {
        return -1;
    }
}

// only values.
$floatersArray = ["Ralph", "Charles", "Paul", "Larry"];

$floatersArray[] = "Kate Middleton";

echo "\$floatersArray$newline";
print_r2($floatersArray);

console_log($floatersArray);

echo "\$floatersArray[3]: $floatersArray[3]";

echo "$newline$newline";

// integer - value pairs.
$zodiacArray[0] = "Aquarius";

$zodiacArray[1] = "Libra";

$zodiacArray[5] = "Virgo";

$zodiacArray["Paul"] = "Leo";
$zodiacArray["Charles"] = "Cancer";

echo "\$zodiacArray$newline";
print_r2($zodiacArray);

$k = array_keys($zodiacArray);
echo "\$zodiacArray keys$newline";
print_r2($k);
//echo 2 <=> 1; // 1
printf("spaceship($k[4],$k[1]): %d%s%s", spaceship($k[4], $k[1]), $newline, $newline);

ksort($zodiacArray);
echo "\$zodiacArray sorted by key$newline";
print_r2($zodiacArray);

// key - value pairs.
$languageArray = [
    "France" => "French",
    "USA" => "English",
    "England" => "English",
    "Germany" => "German",
];

unset($languageArray["France"]);

echo "\$languageArray$newline";
print_r2($languageArray);

ksort($languageArray);
echo "\$languageArray sorted by key$newline";
print_r2($languageArray);

printf('Size of $languageArray: %d%s', sizeof($languageArray), $newline);
