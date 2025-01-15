<?php

/**
 * Send an eMail via PHP.
 *
 * Target eMail, subject, message and headers.
 *
 * PHP version 5.3+
 *
 * @file 7.10.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/7.10.php
 * @see       <a href="/cwdc/6-php/7.10.php">link</a>
 * @see       https://www.php.net/manual/en/function.mail.php
 * @see       http://www.php.net/manual/en/reserved.variables.post.php
 * @since     29/01/2021
 */

require "blockIPs.php";

if ($_POST) {
    if ($_POST["to_email"] and $_POST["from_email"]) {
        $emailTo = $_POST["to_email"];
        $emailFrom = $_POST["from_email"];

        $subject = "PHP Email test!";

        $body = "$emailFrom thinks UFRJ is great!";

        $headers = "From: $emailFrom\r\nCC: roma@lcg.ufrj.br";

        if (mail($emailTo, $subject, $body, $headers)) {
            echo "The email was sent successfully";
        } else {
            echo "The email could not be sent.";
        }
    } else {
        echo "Invalid email.";
    }
} ?>

<!doctype html>
<html lang="en">

<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>email</title>
    <style>
        label{
            display: inline-block;
            padding: 10px;
        }
        button {
            margin: 20px 55px;
            padding: 10px;
        }
    </style>
</head>

<body>
    <form method="post">
        <label for="to_email">To: &nbsp;&nbsp;&nbsp;&nbsp; Email address</label>
        <input type="email" id="to_email" name="to_email" placeholder="Enter email" autofocus>
        <br />
        <label for="from_email">From: Email address</label>
        <input type="email" id="from_email" name="from_email" placeholder="Enter email">
        <br />
        <button type="submit" id="submit">Send</button>
    </form>
</body>

</html>