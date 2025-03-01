<?php

/**
 * Cookies and Sessions.
 *
 * A cookie is often used to identify a user. A cookie is a small file
 * that the server embeds on the user's computer.
 *
 * Without cookies, websites and their servers have no memory.
 * A cookie, like a key, enables swift passage from one place to the next. <br>
 * Without a cookie every time you open a new web page the server where that
 * page is stored will treat you like a completely new visitor.
 *
 * Cookies are a client side storage and sessions are a server-side storage. <br>
 * PHP happens to allow (and encourage) the use of cookies in order to transmit
 * the session ID that tells the server-side storage who you are.
 *
 * When a session is started, a cookie is sent to the browser,
 * with a single value, which corresponds to the session opened in the web server.
 * - PHPSESSID=nfl12odpockbcj5ujs1nt90fa7; path=/
 *
 * <pre>
 *       roma: ~$ curl -I orion.lcg.ufrj.br/cwdc/7-mysql/session.php
 *       HTTP/1.1 302 Found
 *       Date: Fri, 19 Feb 2021 20:37:51 GMT
 *       Server: Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/5.4.16
 *       X-Powered-By: PHP/5.4.16
 *       Set-Cookie: PHPSESSID=nfl12odpockbcj5ujs1nt90fa7; path=/
 *       Expires: Thu, 19 Nov 1981 08:52:00 GMT
 *       Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0
 *       Pragma: no-cache
 *       Location: 8.6.php
 *       Access-Control-Allow-Origin: *
 *       Content-Type: text/html; charset=utf-8
 * </pre>
 *
 * macOS location:
 * - Safari: ~/Library/Cookies/
 *
 * - Chrome: ~/Library/Application\ Support/Google/Chrome/Profile\ 1/Cookies
 *   - uses an SQLite file to save cookies.
 *
 * - Firefox: ~/Library/Application\ Support/Firefox/Profiles/xxxxxxxx.default/cookies.sqlite
 *   - uses an SQLite file to save cookies (not encrypted).
 *
 * Each time the same computer requests a page with a browser,
 * it will send the cookie too. <br>
 * With PHP, you can both create and retrieve cookie values.
 *
 * Cookies are sent in response headers to the browser and
 * the browser must then send them back with the next request.
 * - This is why they are only available on the second page load.
 *
 * Session cookies are removed when the client shuts down:
 * - Session ends when the browser is closed.
 *   - Unfortunately, this does not work on Chrome,
 *     if it is set to "Continue where you left off".
 *   - Or Firefox, if it is set to "Restore previous session".
 *   - Or Opera, if it is set to "Retain tabs from previous session".
 * - Session lifetime from phpinfo()
 *   - session.gc_maxlifetime 1440 = 24 min.
 *
 * Cookies are session cookies if they don't specify
 * the Expires or Max-Age attributes.
 *
 * PHP version 5.3+
 *
 * @file 8.7.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/8.7.php
 * @see       <a href="/cwdc/7-mysql/8.7.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=8.7">source</a>
 * @see       https://www.allaboutcookies.org/cookies/session-cookies-used-for.html
 * @see       https://klauslaube.com.br/2012/04/05/entendendo-os-cookies-e-sessoes.html
 * @see       https://flaviocopes.com/cookies/#access-the-cookies-values
 * @see       https://www.w3schools.com/php/php_cookies.asp
 * @see       https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
 * @see       https://www.osec.doc.gov/webresources/p3p_user_admin_files/textmostly/slide11.html
 * @see       https://www.privacypolicies.com/blog/browser-cookies-guide/
 * @see       https://html.com/resources/cookies-ultimate-guide/
 * @see       https://www.php.net/manual/en/function.isset.php
 * @see       https://maxchadwick.xyz/blog/exporting-your-browser-cookies-on-a-mac
 * @see       https://www.imperva.com/learn/application-security/csrf-cross-site-request-forgery/
 * @since     06/02/2021
 */

/**
 * A better output for print_r.
 *
 * @param $val object to be printed.
 *
 * @return void
 */
function print_r2($val)
{
    echo "<pre>";
    print_r($val);
    echo "<br></pre>";
}

/**
 * Display global arrays: $_COOKIE, $_SESSION and $_POST.
 *
 * @return void
 */
function print_globals()
{
    echo nl2br("-----------------------------------------------------\n");
    echo "\$_COOKIE";
    print_r2($_COOKIE);
    echo "\$_SESSION";
    print_r2($_SESSION);
    echo "\$_POST";
    print_r2($_POST);
    echo nl2br("-----------------------------------------------------\n");
}

session_start();

echo "REQUEST_METHOD = " . $_SERVER["REQUEST_METHOD"] . "<br><br>";
echo "PHP_SELF = " . $_SERVER["PHP_SELF"] . "<br><br>";

echo '<script type="text/javascript">',
"console.log(document.cookie);",
"</script>";

// when a cookie is created, the page has to be reloaded for it appear here
print_globals();

/// @cond MAIN
// Determine if a variable is considered set, that is,
// if a variable is declared and is not null.
if (!isset($_SESSION["cookie"])) {
    // Only executes if the page is loaded for the first time (e.g. after browser is closed).
    $_SESSION["cookie"] = "Cookie value";
    unset($_POST["addCookie"]);

    echo nl2br("Page loaded for the fist time\n");
    print_globals();
}

if (isset($_POST["addCookie"]) and !empty($_POST["addCookie"])) {
    // There is not a cookie or the page is being loaded for the first time
    if (
        !isset($_COOKIE["customerId"]) ||
        $_SESSION["cookie"] == "Cookie value"
    ) {
        $cookie = $_POST["addCookie"];
        $_SESSION["cookie"] = $cookie; // save the last cookie value for the place holder
        $exp_date = time() + 3600 * 24;

        // Set the value and the duration of the cookie.
        setcookie("customerId", $cookie, $exp_date);

        // To avoid waiting a second page load, just set $_COOKIE when setcookie() is called.
        $_COOKIE["customerId"] = $cookie;

        echo "Cookie created: " . $_COOKIE["customerId"];
        print_r2($_COOKIE);
    } elseif ($_POST["button_name"] == "Erase cookie") {
        echo "Cookie removed: " . $_COOKIE["customerId"];

        // use a time in the past to remove the cookie.
        // the value is not updated.
        unset($_COOKIE["customerId"]);
        setcookie("customerId", "", time() - 3600);

        print_r2($_COOKIE);
    } else {
        echo nl2br("Page reloaded\n");
        print_globals();
    }
} else {
    echo "Please enter a cookie value";
}
?>

<form method="post">
    <input type="text" name="addCookie" placeholder="<?php if ($_SESSION["cookie"]) {
                                                            echo $_SESSION["cookie"];
                                                     } ?>" value="<?php if (isset($_COOKIE["customerId"])) {
                                                                         echo $_COOKIE["customerId"];
                                                     } ?>">

    <input type=submit name="button_name" value="<?php if (isset($_COOKIE["customerId"])) {
                                                        echo "Erase cookie";
                                                 } else {
                                                     echo "Set cookie";
                                                 } ?>">
</form>
<!-- /// @endcond -->