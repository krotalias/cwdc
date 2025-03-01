<?php

/**
 * Storing passwords.
 *
 * Message Digest is used to ensure the integrity of a message transmitted
 * over an insecure channel (where the content of the message can be changed).<br>
 * The message is passed through a Cryptographic hash function.
 * This function creates a compressed image of the message called Digest.
 *
 * Lets assume, Alice sent a message and digest pair to Bob.
 * To check the integrity of the message Bob runs the cryptographic hash function
 * on the received message and gets a new digest.<br>
 * Now, Bob will compare the new digest and the digest sent by Alice.
 * If both are same, then Bob is sure that the original message is not changed.
 *
 * The hash algorithm <a href="https://en.wikipedia.org/wiki/MD5">MD5</a>
 * is widely used to check the integrity of messages.
 * MD5 divides the message into blocks of 512 bits and creates a 128 bit digest
 * (typically, 32 Hexadecimal digits).
 *
 * It is no longer considered reliable for use, as researchers have demonstrated
 * techniques capable of easily generating MD5 collisions on commercial computers.<br>
 * The weaknesses of MD5 have been exploited by the Flame malware in 2012.
 *
 * In response to the insecurities of MD5 hash algorithms,
 * the Secure Hash Algorithm (SHA) was invented.
 *
 * In PHP 5.5, a new function called
 * <a href="https://www.php.net/manual/en/function.password-hash.php">password_hash</a> was introduced,
 * which works in the same way as the md5 function, but is more secure.
 *
 * It also doesn't require a hash. It's pretty similar to md5 in how it works,
 * and you can use it like this:
 * - $hash = password_hash('mypassword', PASSWORD_DEFAULT);
 *
 * To verify it:
 * - password_verify('mypassword', $hash);
 *
 * For php < 5.5, one should install
 * <a href="https://packagist.org/packages/ircmaxell/password-compat">password_compat</a>,
 * via composer:
 * - composer require ircmaxell/password-compat
 *
 * PHP version 5.5.0+
 *
 * @file 8.8.1.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/8.8.1.php
 * @see       <a href="/cwdc/7-mysql/8.8.1.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=8.8.1">source</a>
 * @see       https://www.php.net/manual/en/function.password-verify.php
 * @see       https://medium.com/@dan.ngandu/how-to-use-password-hash-password-verify-php-part-1-fa78a89985c7
 * @see       https://dev.to/techschoolguru/how-to-securely-store-passwords-3cg7
 * @see       https://blog.pythian.com/hashing-algorithm-in-mysql-password-2/
 * @see       https://www.php.net/manual/en/function.phpversion.php
 * @since     09/02/2021
 */

require_once('vendor/autoload.php');

///@cond
$newline = (php_sapi_name() == "cli") ? "\n" : "<br />";

$password = 'Expelliarmus';

/// Generate a hash of the password $password.
if (function_exists('password_hash')) {
    $hash1 = password_hash($password, PASSWORD_DEFAULT);
} else {
    exit("password_hash is unavailable in PHP " . phpversion());
}

// Echoing it out, so we can see it:
echo "{$newline}password_hash('$password', PASSWORD_DEFAULT) → $hash1 $newline";

$hash2 = password_hash($password, PASSWORD_BCRYPT);
echo "{$newline}password_hash('$password', PASSWORD_BCRYPT) → $hash2 $newline";

$hash3 = password_hash($password, PASSWORD_ARGON2I);
echo "{$newline}password_hash('$password', PASSWORD_ARGON2I) → $hash3 $newline";

// Some line breaks for a cleaner output:
echo $newline;

// Using password_verify() to check if $password matches the hash.
// Try changing $password below to something else and then refresh the page.
foreach ([$hash1, $hash2, $hash3] as $key => $hash) {
    ++$key;
    if (password_verify($password, $hash)) {
        echo "password_verify('$password', \$hash$key) → Password is valid!";
    } else {
        echo "Invalid password.";
    }
    echo $newline;
}
/// @endcond
