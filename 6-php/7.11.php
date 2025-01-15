<?php

/**
 * Create a contact form to send an eMail via PHP.
 *
 * Target eMail, subject, message and headers.
 *
 * PHP version 5.3+
 *
 * @file 7.11.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/7.11.php
 * @see       <a href="/cwdc/6-php/7.11.php">link</a>
 * @see       https://www.php.net/manual/en/function.mail.php
 * @see       https://www.php.net/manual/en/reserved.variables.post.php
 * @since     29/01/2021
 */

require "blockIPs.php";

/// Error message.
$error = "";
/// Success message.
$successMessage = "";

/// @cond
/// Do server side validation as well, because javascript could be off.
if ($_POST) {
    if (!$_POST["email"]) {
        $error .= "An email address is required.<br>";
    }

    if (!$_POST["content"]) {
        $error .= "The content field is required.<br>";
    }

    if (!$_POST["subject"]) {
        $error .= "The subject is required.<br>";
    }

    if (
        $_POST["email"] &&
        filter_var($_POST["email"], FILTER_VALIDATE_EMAIL) === false
    ) {
        $error .= "The email address is invalid.<br>";
    }

    if ($error != "") {
        $error = "
            <div class=\"alert alert-danger\" role=\"alert\">
                <p>There were error(s) in your form (PHP):</p>
                $error
            </div>
        ";
    } else {
        $emailTo = "roma@lcg.ufrj.br";
        extract($_POST);
        $headers = "From: $email";

        if (mail($emailTo, $subject, $content, $headers)) {
            $successMessage = '
                <div class="alert alert-success" role="alert">
                    Your message was sent, we\'ll get back to you ASAP!
                </div>
            ';
        } else {
            $error = '
                <div class="alert alert-danger" role="alert">
                    <strong>
                        Your message couldn\'t be sent - please try again later
                    </strong>
                </div>
            ';
        }
    }
}

/// @endcond
?>

<!doctype html>
<html lang="en">

<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
        crossorigin="anonymous"
    >

    <title>email form</title>

    <style type="text/css">
        body {
            background: url("Lockheed P38 Lightning - SuperStock.jpg") no-repeat center center fixed;
            background-size: cover;
        }
        /* Small devices (landscape phones, 576px and up)*/
        @media (min-width: 768px) {
            .w-md-100 {
            width:100%!important;
            }
            .w-md-75 {
            width:75%!important;
            }
            .w-md-50 {
            width:50%!important;
            }
            .w-md-25 {
            width:25%!important;
            }
        }
    </style>
</head>

<body>
    <div class="container mt-4">
        <h1 class="text-center text-danger">Get in touch!</h1>

        <div id="error"><?php echo $error, $successMessage; ?></div>

        <form method="post">
            <fieldset class="mb-3 w-md-25">
                <label for="email" class="form-label text-light bg-dark">Email address</label>
                <input type="email" class="form-control" id="email" name="email" placeholder="Enter your email">
                <small class="text-info">We'll never share your email with anyone else.</small>
            </fieldset>
            <fieldset class="mb-3 w-md-50">
                <label for="subject" class="form-label text-white bg-dark">Subject</label>
                <input type="text" class="form-control" id="subject" name="subject">
            </fieldset>
            <fieldset class="mb-3 w-md-50">
                <label for="content" class="form-label text-white bg-dark">What would you like to ask us?</label>
                <textarea class="form-control" id="content" name="content" rows="3"></textarea>
            </fieldset>
            <button type="submit" id="submit" class="btn btn-primary mt-3">Submit</button>
        </form>
    </div>

    <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
        crossorigin="anonymous"
    ></script>

    <script type="text/javascript">
        $("form").submit(function(e) {
            var error = "";

            // client side validation.
            if ($("#email").val() == "") {
                error += "The email field is required.<br>"
            }

            if ($("#subject").val() == "") {
                error += "The subject field is required.<br>"
            }

            if ($("#content").val() == "") {
                error += "The content field is required.<br>"
            }

            let useReturn = true;
            if (error != "") {
                $("#error").html(`<div class="alert alert-danger" role="alert">
                                    <p><strong>There were error(s) in your form (JS):</strong></p>
                                    ${error}
                                  </div>`);
                if (!useReturn) {
                    // stops the submission for error checking.
                    e.preventDefault();
                } else {
                    // Javascript way of saying something has gone wrong, so do not submit the form.
                    return false;
                }
            } else {
                if (!useReturn) {
                    // we do not want to enter here again, so unbind and submit.
                    $(this).unbind("submit").submit();
                } else {
                    // Javascript way of saying go ahead and submit the form.
                    return true;
                }
            }
        })
    </script>
</body>

</html>