<?php

/**
 * Secret diary - OO version.
 *
 * The rationale here is saving the user id of the mysql secretdiary database.
 * The user id is a unique primary key and auto-incremented.
 *
 * Therefore, if it is saved in a session on the server,
 * it can be used to retrieve the information about the logged user.
 *
 * The only problem is that sessions have a limited life time.
 * Fortunately, we can store a cookie on the client with the same user id,
 * and pass this id to a new session in the next login.
 *
 * Cookies can live up to an year (safari deletes them after one week), for instance.
 *
 * @image html ComputerServer.png "HTTP: Request - Response cycle" width=350
 *
 * Since the http protocol is memoryless, that is, the connection is closed after
 * a request - response cycle, <br> the authentication process would have to be carried out
 * every time, obliging the user to type his/her password again and again.
 *
 * The main difference to script 8.9.php
 * is that, here, there is a navbar to display a logout button, <br>
 * and there is also a script updatedatabase.php to
 * retrieve/update a Text field "diary" in the mysql "user" table.
 *
 * The variable $diaryContents is then displayed into an HTML textarea tag. <br>
 * Each time the diary is changed, its contents is sent to the server via \link footer.php Ajax. \endlink
 *
 * The cookie is handled in script loggedinpage.php,
 * and authentication in script authenticate.php.
 *
 * PHP version 5.3+
 *
 * @file 8.10.1.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      cwdc/7-mysql/8.10.1.php
 * @see       <a href="/cwdc/7-mysql/8.10.1.php">link</a>
 * @see       <a href="/cwdc/7-mysql/showcode.php?f=8.10.1">source</a>
 * @see       <a href="/cwdc/7-mysql/sql-scripts/create_database-secretdiary.sql">Database</a>
 * @see       https://www.php.net/manual/en/function.header.php
 * @see       https://code.tutsplus.com/tutorials/how-to-use-sessions-and-session-variables-in-php\--cms-31839
 * @see       https://www.the-art-of-web.com/php/form-handler/
 * @see       https://en.wikipedia.org/wiki/Session_hijacking
 * @see       https://securityintelligence.com/articles/guide-to-cookie-hijacking/
 * @see       http://www.righto.com/2010/10/firesheep-how-it-steals-your-identity.html
 * @see       https://www.youtube.com/watch?v=oI7dX6DWyTo
 * @see       https://www.imperva.com/learn/application-security/csrf-cross-site-request-forgery/
 * @since     10/02/2021
 */

session_start();

require "../6-php/blockIPs.php";

require "authenticateOO.php";

/// Any error message generated during authentication.
$error = $login("loggedinpage.php");
?>

<?php require "header.php"; ?>

<div class="container" id="homePageContainer">

    <h1>Secret Diary</h1>

    <p><strong>Store your thoughts permanently and securely.</strong></p>
    <!-- /// @cond HTML -->
    <div id="error">
        <?php if ($error) {
            echo "
                <div class=\"alert alert-danger\" role=\"alert\">
                    $error
                </div>
            ";
        } ?>
    </div>
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