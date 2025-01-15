<?php

declare(strict_types=1);

/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */

/**
 * Primality testing.
 *
 * Divides the given number $n by all positive odd integers
 * until the limit int(sqrt($n)).
 *
 * GET X POST digression:
 * - Use GET for safe and idempotent requests.
 * - Use POST for neither safe nor idempotent requests.
 *
 * In details, there is a proper place for each.
 * Even if you don't follow RESTful principles, a lot can be gained
 * from learning about REST and how a resource oriented approach works.
 *
 * A RESTful application will use GETs for operations,
 * which are both safe and idempotent:
 * - A safe operation is an operation that does not change the data requested.
 * - An idempotent operation is one in which the result will be the same no matter
 *   how many times you request it.
 * - In computing, an idempotent operation is one that has no additional effect
 *   if it is called more than once with the same input parameters.
 * - For example, removing an item from a set can be considered
 *   an idempotent operation on the set.
 * - In mathematics, an idempotent operation is one where f(f(x)) = f(x).
 * - For example, the abs() function is idempotent because
 *   abs(abs(x)) = abs(x) for all x.
 *
 * It stands to reason that, as GETs are used for safe operations,
 * they are automatically also idempotent.
 * - Typically a GET is used for retrieving a resource or collection of resources.
 *
 * A POST would be used for any operation which is neither safe or idempotent.
 * - Typically, a POST would be used to create a new resource, for example,
 *   creating a NEW StackOVerflow question (though in some designs,
 *   a PUT would be used for this also).
 *
 * If you run the POST twice, you would end up creating TWO new questions.
 *
 * PHP version 7.1+
 *
 * @file 7.8.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/7.8.php/?number=13
 * @see       <a href="/cwdc/6-php/7.8.php/?number=13">link</a>
 * @see       https://en.wikipedia.org/wiki/Primality_test
 * @see       https://www.php.net/manual/en/reserved.variables.get.php
 * @see       https://stackoverflow.com/questions/46585/when-do-you-use-post-and-when-do-you-use-get
 * @see       https://en.wikipedia.org/wiki/Representational_state_transfer
 * @see       https://codewords.recurse.com/issues/five/what-restful-actually-means
 * @see       https://en.wikipedia.org/wiki/Idempotence
 * @see       https://stackoverflow.com/questions/1077412/what-is-an-idempotent-operation
 * @since     29/01/2021
 */

/**
 * Tests whether an integer is prime.
 *
 * @param $n given integer.
 *
 * @return 0 if $n is prime, or one of its factors, otherwise.
 *
 * @see http://www.lcg.ufrj.br/python/laboratorios.html#prime
 */
function isPrime(int $n): int
{
    if ($n == 1) {
        // 1 is not prime
        return 1;
    } elseif ($n < 4) {
        // 2 and 3 are primes
        return 0;
    } elseif ($n % 2 == 0) {
        // composite
        return 2;
    } else {
        // only odd numbers
        for ($i = 3; $i <= intval(sqrt($n)); $i += 2) {
            if ($n % $i == 0) {
                // $n is not prime!
                return $i;
            }
        }
        // prime
        return 0;
    }
}

/**
 * Create an html page with a form redirecting to this script.
 *
 * @return string to create the page.
 *
 * @see https://www.geeksforgeeks.org/php-strings/
 * @see https://www.phptutorial.net/php-tutorial/php-heredoc/
 */
function createPage(): string
{
    return <<<HTML
        <!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Prime Testing</title>
            </head>

            <body>
                <p>
                    <a href="https://www.w3schools.com/php/php_superglobals_get.asp">
                        Please enter a whole number.
                    </a>
                </p>

                <form action="7.8.php">
                    <input name="number" type="text">
                    <input type="submit" value="Go!">
                </form>
            </body>

        </html>
HTML;
}

/**
 * Save the created page on a file.
 *
 * @param $fname page file name.
 *
 * @return void
 *
 * @see https://www.php.net/manual/en/language.exceptions.php
 * @see https://www.php.net/manual/en/dir.constants.php
 */
function savePage(string $fname): void
{
    try {
        $f = fopen(__DIR__ . DIRECTORY_SEPARATOR . $fname, "w");
        fwrite($f, createPage());
        fclose($f);
    } catch (Exception $e) {
        echo 'Caught exception: ',  $e->getMessage(), "\n";
    }
}

/**
 * Main function.
 *
 * @return void
 *
 * @see https://ecommerce-platforms.com/articles/automated-web-page-creation-php
 */
function main(): void
{
    global $argc, $argv;

    // nothing has been submitted
    $k = -1;

    if (php_sapi_name() == 'cli') {
        // running from CLI (shell terminal)
        $k = $argc > 1 ? $argv[1] : readline("Type a whole number: ");
        $LF = "\n";
        $page = "7.8.1.html";
        if (!file_exists($page)) {
            savePage($page);
        }
    } else {
        echo createPage();
        $LF = "<br \>";

        if (isset($_GET["number"])) {
            $k = $_GET["number"];
        }
    }

    // All $_GET and $argv parameters have a string datatype,
    // therefore, is_int will always return false.
    if (is_numeric($k) && $k > 0 && $k == round((int)$k, 0)) {
        $f = isPrime(intval($k));
        if (!$f) {
            print "$k is a prime number!";
        } else {
            print "$k is not prime. It is divisible by $f";
        }
    } else {
        // User has submitted something which is not a whole number
        print "Please enter a whole number.";
    }
    print($LF);
}

main();
