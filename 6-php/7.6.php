<?php

/**
 * Two ways of traversing an array by using for and foreach.
 *
 * An array in PHP is actually an ordered map.
 * A map is a type that associates values to keys.
 *
 * PHP version 5.3+
 *
 * @file 7.6.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/7.6.php
 * @see       <a href="/cwdc/6-php/7.6.php">link</a>
 * @see       https://www.php.net/manual/en/language.types.array.php
 * @since     31/01/2021
 */

$newline = (php_sapi_name() == "cli") ? "\n" : "<br />";

$family = ["James", "Ralph", "Paul", "Larry", "Charles"];

foreach ($family as $key => $value) {
    $family[$key] = "$value  Mitchell";

    echo "Array item $key is $value $newline";
}

for ($i = 0; $i < sizeof($family); $i++) {
    echo "$family[$i] $newline";
}

// regressive countdown.
for ($i = 10; $i >= 0; $i--) {
    echo "$i $newline";
}
