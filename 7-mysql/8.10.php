<?php

/**
 * Secret diary - PDO version.
 *
 * The main difference to script 8.9.php
 * is that, here, there is a navbar to display a logout button, <br>
 * and there is also a script updatedatabase.php to
 * retrieve/update a Text field "diary" in the mysql "user" table.
 *
 * The variable $diaryContents is then displayed into an HTML textarea tag. <br>
 * Each time the diary is changed, its contents is sent to the server via \link footer.php Ajax. \endlink
 *
 * The cookie is handled in script loggedinpage.php.
 *
 * Differently from script 8.10.1.php, the use of
 * <a href="https://www.php.net/manual/en/ref.pdo-mysql.php">PDO</a>
 * avoids mysql <a href="https://www.php.net/manual/en/security.database.sql-injection.php">code injection</a>.
 *
 * The right way to prevent SQL injection is by using parameterized queries.<br>
 * This means defining the SQL code that is to be executed with placeholders for parameter values,<br>
 * programmatically adding the parameter values, then executing the query.
 *
 * PHP version 5.3+
 *
 * @file 8.10.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/8.10.php
 * @see       <a href="/cwdc/7-mysql/8.10.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=8.10">source</a>
 * @see       https://www.acunetix.com/blog/articles/prevent-sql-injection-vulnerabilities-in-php-applications/
 * @see       https://stackoverflow.com/questions/60174/how-can-i-prevent-sql-injection-in-php
 * @see       https://www.php.net/manual/en/function.header.php
 * @see       https://www.php.net/manual/en/pdostatement.fetch.php
 * @see       https://www.php.net/manual/en/pdostatement.bindparam.php
 * @since     10/02/2021
 */

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
    // file name of this script
    $fname = basename(__FILE__);

    if (array_key_exists("logout", $_GET)) {
        session_unset();
        setcookie("id", "", time() - 60 * 60);
        $_COOKIE["id"] = "";
    } elseif (
        isset($_SESSION["id"]) or isset($_COOKIE["id"])
    ) {
        header("Location: {$page}?loc=$fname");
    }
    return authenticateUserPDO($_POST, "{$page}?loc=$fname");
};

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
 * @see https://www.php.net/manual/en/pdo.lastinsertid.php
 * @see https://www.acunetix.com/blog/articles/prevent-sql-injection-vulnerabilities-in-php-applications/
 * @see https://stackoverflow.com/questions/60174/how-can-i-prevent-sql-injection-in-php
 * @see https://phpdelusions.net/pdo
 */
function authenticateUserPDO($arr, $logpage)
{
    // global error string.
    $error = "";

    // array -> $email, $password, $stayLoggedIn, $signUp, $submit
    extract($arr);

    /// number of seconds in one year.
    define("ONEYEAR", 60 * 60 * 24 * 365);

    if (isset($submit)) {
        include "connectionPDO.php";

        if (!$email) {
            $error .= "An email address is required<br>";
        }

        if (!$password) {
            $error .= "A password is required<br>";
        }

        if ($error) {
            return  "<p>There were error(s) in your form:</p>" . $error;
        }
        if ($signUp == "1") {
            $query = "SELECT `id` FROM `users`
                WHERE `email` = :email LIMIT 1";

            // Prepare the SQL query string.
            $sth = $dbh->prepare($query);
            // Bind parameters to statement variables.
            $sth->bindParam(':email', $email);
            // Execute statement.
            $sth->execute();
            // Set fetch mode to FETCH_ASSOC to return an array indexed by column name.
            $sth->setFetchMode(PDO::FETCH_ASSOC);
            // Fetch result.
            $row = $sth->fetch();

            if ($row) {
                $error = "That email address is taken.";
            } else {
                $query = "INSERT INTO `users` (`email`, `password`)
                    VALUES (:email, :password)";

                // Prepare the SQL query string.
                $sth = $dbh->prepare($query);
                // Bind parameters to statement variables.
                $sth->bindParam(':email', $email);
                $sth->bindParam(':password', $password);
                // Execute statement.
                try {
                    $sth->execute();
                } catch (Exception $e) {
                    return "<p>Could not sign you up ($e) - please try again later.</p>";
                }

                // Gets the auto generated id used in the latest query
                $id = $dbh->lastInsertId();

                $query = "UPDATE `users` SET password = :hpass
                        WHERE `id` = :id LIMIT 1";

                // update the password from clear text to a hashed and salted version
                $sth = $dbh->prepare($query);
                $sth->bindParam(':id', $id);
                $hpass = md5(md5($id) . $password);
                $sth->bindParam(':hpass', $hpass);
                $sth->execute();

                $_SESSION["id"] = $id;

                if ($stayLoggedIn == "1") {
                    setcookie("id", $id, time() + ONEYEAR);
                }
                header("Location: $logpage");
            }
        } else {
            // login

            $query = "SELECT * FROM `users`
                    WHERE `email` = :email LIMIT 1";

            // Prepare the SQL query string.
            $sth = $dbh->prepare($query);
            // Bind parameters to statement variables.
            $sth->bindParam(':email', $email);
            // Execute statement.
            $sth->execute();
            // Set fetch mode to FETCH_ASSOC to return an array indexed by column name.
            $sth->setFetchMode(PDO::FETCH_ASSOC);
            // Fetch result.
            $row = $sth->fetch();

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

session_start();

require "../6-php/blockIPs.php";

/// Any error message generated during authentication.
$error = $login("loggedinpage.php");
?>

<?php require "header.php"; ?>

<div class="container" id="homePageContainer">

    <h1>Secret Diary PDO</h1>

    <p><strong>Store your thoughts permanently and securely.</strong></p>

<!-- /// @cond HTML -->
    <?php if ($error) {
        echo "
    <div class='alert alert-danger' role='alert'>
        $error
    </div>
    ";
    } ?>
<!-- /// @endcond -->

    <form method="post" id="signUpForm">

        <p>Interested? Sign up now.</p>

        <fieldset class="form-group">
            <input class="form-control" type="email" name="email" placeholder="Your Email">
        </fieldset>

        <fieldset class="form-group">
            <input class="form-control" type="password" name="password" placeholder="Password">
        </fieldset>

        <div class="checkbox">
            <label>
                <input type="checkbox" name="stayLoggedIn" value=1> Stay logged in
            </label>
        </div>

        <fieldset class="form-group">
            <input type="hidden" name="signUp" value="1">
            <input class="btn btn-success" type="submit" name="submit" value="Sign Up!">
        </fieldset>

        <p><a class="toggleForms">Log in</a></p>

    </form>

    <form method="post" id="logInForm">

        <p>Log in using your username and password.</p>

        <fieldset class="form-group">
            <input class="form-control" type="email" name="email" placeholder="Your Email">
        </fieldset>

        <fieldset class="form-group">
            <input class="form-control" type="password" name="password" placeholder="Password">
        </fieldset>

        <div class="checkbox">
            <label>
                <input type="checkbox" name="stayLoggedIn" value=1> Stay logged in
            </label>
        </div>

        <fieldset class="form-group">
            <input type="hidden" name="signUp" value="0">
            <input class="btn btn-success" type="submit" name="submit" value="Log In!">
        </fieldset>

        <p><a class="toggleForms">Sign up</a></p>

    </form>

</div>

<?php require "footer.php"; ?>
