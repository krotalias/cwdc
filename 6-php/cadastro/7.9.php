<?php

/**
 * CPF validation.
 *
 * Some valid CPFs:
 *     1. 757.331.783-29
 *     2. 841.315.629-79
 *     3. 635.111.771-20
 *     4. 348.536.715-01
 *
 * To run in the terminal:
 * - php -f cpf.php
 *
 * PHP version 5.3+
 *
 * @file 7.9.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/cadastro/7.9.php
 * @see       <a href="/cwdc/6-php/cadastro/7.9.php">link</a>
 * @see       https://www.geradorcnpj.com/
 * @see       https://www.php.net/manual/en/function.empty.php
 * @see       https://www.php.net/manual/en/reserved.variables.post.php
 * @see       https://www.php.net/manual/en/function.header.php
 * @see       https://en.wikipedia.org/wiki/Post/Redirect/Get
 * @see       https://www.php.net/manual/en/reserved.variables.server.php
 * @see       https://en.wikipedia.org/wiki/HTTP_referer
 * @since     01/02/2021
 */

require "cadastro_nacional.php";
/// @cond
$check = "";
if (!empty($_POST["back-btn"])) {
    // redirects to the initial page
    header('Location: /cwdc/6-php');
} else {
    if (!empty($_POST["cpf"])) {
        $check =  "<h4>" . checkCPF($_POST["cpf"]) . "</h4>";
    }
}

$cpf = randomCPF()[2];
// print "$check"
// print "Random CPF: $cpf";
/// @endcond
?>

<!doctype html>
<html>
    <head>
        <title>CPF</title>
        <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/cwdc/mainPage/LCG.css" />
        <style>
            .cpf-container {
                margin: 50px 10px;
                font-size: 200%;
                cursor: move;
            }
            .box {
                background-color: antiquewhite;
                box-shadow: 8px 8px 6px grey;
                width: 250px;
                border-style: solid;
                border-width: 3px;
                border-color: lightblue;
                padding-left: 10px;
                padding-right: 10px;
                padding-bottom: 10px;
                margin-left: 2px;
                cursor: default;
            }
            label, a {
                font-size: 80%;
            }
            #draggable {
                cursor: n-resize;
            }
            .btn {
                display: inline-block;
                padding: 20px 0px 10px 80px;
            }
            input[type=button], input[type=submit], input[type=reset] {
                background-color: #0096FF;
                color: white;
                border: 2px solid white;
                padding: 5px 10px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                margin: 4px 2px;
                cursor: pointer;
                border-radius: 16px;
            }
            .cpf {
                font-size: large;
                padding-top: 2px;
            }
        </style>
    </head>
<body>
    <div class="cpf-container">
        <fieldset
            id="cpf-fieldset"
            class="draggable ui-widget-content"
            style="
                border: 1px black solid;
                background-color: #cac3ba;
                width: 300px;
            "
        >
            <legend
                style="
                    border: 5px lightblue solid;
                    margin-left: 1em;
                    background-color: #ff6347;
                    padding: 0.2em 0.8em;
                    font-size: large;
                "
            >
                <strong>CPF Validator</strong>
            </legend>
            <form method="post">
                <div class="box">
                    <label for="cpf">Enter</label>
                    <a href="https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp">
                        CPF
                    </a>
                    <br />
                    <input
                        type = "text"
                        name = "cpf"
                        id = "cpf"
                        placeholder = "Enter CPF"
                        value = <?php echo $cpf ?>
                        size = "14"
                        maxlength="14"
                        autofocus
                    />
                </div>
                <div class="btn">
                    <input
                        type = "submit"
                        name = "cpf-btn"
                        value = "Validate"
                    />
                    <input
                        type = "submit"
                        name = "back-btn"
                        value = "Back"
                    />
                </div>
            </form>
            <div class="cpf"><?php echo $check ?></div>
            <div class="cpf">Random CPF: <?php echo $cpf ?></div>
        </filedset>
    </div>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js"></script>
    <script src="/cwdc/mainPage/LCG.js"></script>
    <script type="text/javascript">
        dragAndSave(".cpf-container"); // $("#cpf-fieldset").draggable()
    </script>
</body>
</html>