<?php

/**
 * Includes the head section of the pages.
 * - includes bootstrap css.
 * - defines the style section of the pages.
 *
 * PHP version 5.3+
 *
 * @file header.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/header.php
 * @see       <a href="/cwdc/7-mysql/header.php">link</a>
 * @see       https://www.php.net/manual/en/function.include.php
 * @see       https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/The_head_metadata_in_HTML
 * @since     16/02/2021
 */

?>

<!doctype html>
<html lang="en">

<head>
    <!-- Required meta tags always come first -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap CSS -->
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css"
        integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l"
        crossorigin="anonymous"
    />

    <title>Secret Diary</title>

    <style type="text/css">
        .btn-outline {
            border-color: green;
            color: green;
        }

        .btn-outline:hover {
            border-color: white;
            background-color: lightseagreen;
            color: white;
        }

        .container {
            text-align: center;
            width: 400px;
        }

        #homePageContainer {
            margin-top: 150px;
        }

        #containerLoggedInPage {
            margin-top: 60px;
        }

        html {
            background: url(background.jpg) no-repeat center center fixed;
            -webkit-background-size: cover;
            -moz-background-size: cover;
            -o-background-size: cover;
            background-size: cover;
        }

        body {
            background: none;
            color: #FFF;
        }

        #logInForm {
            display: block;
        }

        #signUpForm {
            display: none;
        }

        .toggleForms {
            font-weight: bold;
        }

        #diary {
            width: 100%;
            height: 100%;
        }
    </style>
</head>

<body>