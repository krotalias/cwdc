<?php

/**
 * Authenticate a user in the Object Oriented way.
 *
 * Authenticates a user for getting into the system and accessing the database.
 *
 * PHP version 5.3+
 *
 * @file authenticateOO.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/sql-scripts/authenticateOO.php
 * @see       <a href="/cwdc/7-mysql/sql-scripts/create_database-secretdiary.sql">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=authenticateOO">source</a>
 * @see       https://www.php.net/manual/en/function.header.php
 * @see       https://supunkavinda.blog/php/prepared-statements
 * @see       https://code.tutsplus.com/tutorials/how-to-use-sessions-and-session-variables-in-php--cms-31839
 * @since     22/02/2021
 */

/**
 * Similar to javascript's console.log
 *
 * @param $data object to be printed on the console.
 *
 * @return void
 */
function console_log($data)
{
    echo "<script>";
    echo "console.log(" . json_encode($data) . ")";
    echo "</script>";
}

/**
 * Validates the signup / login form.
 *
 * If no error is detected, the user is authenticated:
 * - his id is saved in a Session variable.
 * - if $stayLoggedIn == '1', a Cookie is also created for his id.
 * - $signUp == '1' means signUp, otherwise, login.
 *
 * @param $arr     array with $email, $password, $stayLoggedIn, $signUp,
 *                 $submit fields.
 * @param $logpage page to redirect when the authentication is successful.
 *
 * @return error message.
 *
 * @see https://www.php.net/manual/en/function.extract.php
 * @see https://www.php.net/manual/en/mysqli.insert-id.php
 * @see https://www.acunetix.com/blog/articles/prevent-sql-injection-vulnerabilities-in-php-applications/
 * @see https://stackoverflow.com/questions/60174/how-can-i-prevent-sql-injection-in-php
 */
function authenticateUserOO($arr, $logpage)
{
    $error = "";

    // array -> $email, $password, $stayLoggedIn, $signUp, $submit
    extract($arr);

    // number of seconds in one year.
    define("ONEYEAR", 60 * 60 * 24 * 365);

    if (isset($submit)) {
        include "connectionOO.php";

        if (!$email) {
            $error .= "An email address is required<br>";
        }

        if (!$password) {
            $error .= "A password is required<br>";
        }

        if ($error) {
            return "<p>There were error(s) in your form:</p>" . $error;
        }

        if ($signUp == "1") {
            $query =
                "SELECT `id` FROM `users`
                WHERE email = ? LIMIT 1";

            $stmt = $mysqli->prepare($query);
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $stmt->store_result();
            $nrows = $stmt->num_rows();
            $stmt->free_result();
            $stmt->close();

            if ($nrows > 0) {
                $error = "That email address is taken.";
            } else {
                $query = "INSERT INTO `users` (`email`, `password`) VALUES (?, ?)";

                $stmt = $mysqli->prepare($query);
                $stmt->bind_param('ss', $email, $password);

                if (!$stmt->execute()) {
                    $error =
                    "<p>Could not sign you up - please try again later.</p>";
                } else {
                    // Gets the auto generated id used in the latest query
                    $id = $stmt->insert_id;
                    $stmt->close();

                    $hpass = md5(md5($id) . $password);
                    $query = "UPDATE `users` SET password = ? WHERE id = ? LIMIT 1";

                    // update the password from clear text to a hashed and salted version
                    $stmt = $mysqli->prepare($query);
                    $stmt->bind_param('ss', $hpass, $id);
                    $stmt->execute();
                    $stmt->close();

                    $_SESSION["id"] = $id;

                    if ($stayLoggedIn == "1") {
                        setcookie("id", $id, time() + ONEYEAR);
                    }

                    header("Location: $logpage");
                }
            }
        } else {
            // login

            $query =
                "SELECT * FROM `users`
                WHERE email = ? LIMIT 1";

            $stmt = $mysqli->prepare($query);
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $stmt->close();

            if ($row) {
                $hashedPassword = md5(md5($row["id"]) . $password);

                if ($hashedPassword == $row["password"]) {
                    $_SESSION["id"] = $row["id"];

                    if (isset($stayLoggedIn) and $stayLoggedIn == "1") {
                        setcookie("id", $row["id"], time() + ONEYEAR);
                    }

                    header("Location: $logpage");
                } else {
                    $error =
                        "That email/password combination could not be found.";
                }
            } else {
                $error = "That email/password combination could not be found.";
            }
        }
    }
    return $error;
}

/**
 * An anonymous function for testing for a previous login.
 *
 * Either logout, if there is a request in the URL ($_GET),
 * or login, if there is a Session or a Cookie,
 * meaning the user has been already authenticated. <br>
 * In the latter, we redirect to the loggedinpage.php.
 *
 * Otherwise, just call the ::authenticateUser function.
 *
 * @param page loggedin page.
 *
 * @return error message at authentication.
 *
 * @see https://www.php.net/manual/en/functions.anonymous.php
 */
$login = function ($page) {
    if (array_key_exists("logout", $_GET)) {
        session_unset();
        setcookie("id", "", time() - 60 * 60);
        $_COOKIE["id"] = "";
    } elseif (
        // if the browser is closed the SESSION is gone but the COOKIE remains
        isset($_SESSION["id"]) or isset($_COOKIE["id"])
    ) {
        header("Location: $page");
    }

    return authenticateUserOO($_POST, $page);
};
