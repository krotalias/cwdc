<?php

/**
 * CNPJ validation.
 *
 * Some valid cnpjs:
 *
 *     1.  14.358.805/0001-16
 *     2.  72.181.240/0001-40
 *     3.  91.655.845/0001-70
 *     4.  72.060.999/0001-75
 *
 * To run in the terminal:
 * - php -f cnpj.php
 *
 * PHP version 5.3+
 *
 * @file 7.9.1.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/cadastro/7.9.1.php
 * @see       <a href="/cwdc/6-php/cadastro/7.9.1.php">link</a>
 * @see       https://www.geradorcnpj.com/
 * @see       https://www.php.net/manual/en/function.empty.php
 * @see       https://www.php.net/manual/en/reserved.variables.post.php
 * @see       https://www.php.net/manual/en/function.header.php
 * @see       https://en.wikipedia.org/wiki/Post/Redirect/Get
 * @see       https://www.php.net/manual/en/reserved.variables.server.php
 * @see       https://en.wikipedia.org/wiki/HTTP_referer
 * @see       https://www.php.net/manual/en/language.types.string.php
 * @since     01/02/2021
 */

require "cadastro_nacional.php";
/// @cond
$cnpj = randomCNPJ()[2];

$check = "";
if (!empty($_POST['back-btn'])) {
    // redirects to the initial page
    header('Location: /cwdc/6-php');
    // redirects to the page where the button was clicked
    // header("Location: {$_SERVER['HTTP_REFERER']}");
} else {
    if (!empty($_POST["cnpj"])) {
        $check = "<h3>" . checkCNPJ($_POST["cnpj"]) . "</h3>";
    }
}

// print "Random CNPJ: $cnpj";
/// @endcond
?>

<!doctype html>
<html>
    <head>
        <title>CNPJ</title>
        <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/cwdc/mainPage/LCG.css" />
        <style>
            .cnpj-container {
                margin: 50px 5px;
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
            label, a{
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
            .cnpj {
                font-size: large;
                padding-top: 5px;
            }
        </style>
    </head>
<body>
    <div class="cnpj-container">
        <fieldset
            id="cnpj-fieldset"
            class="draggable ui-widget-content"
            style="
                border: 1px black solid;
                background-color: #cac3ba;
                width: 320px;
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
                <strong>CNPJ Validator</strong>
            </legend>
            <form method="post">
                <div class="box">
                    <label for="cnpj">Enter</label>
                    <a href="https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp">
                        CNPJ
                    </a>
                    <br />
                    <input
                        type = "text"
                        id = "cnpj"
                        name = "cnpj"
                        placeholder = "Enter CNPJ"
                        value = <?php echo $cnpj ?>
                        size = "18"
                        maxlength="18"
                        autofocus
                    >
                </div>
                <div class="btn">
                    <input
                        type = "submit"
                        name = "cnpj-btn"
                        value = "Validate"
                    >
                    <input
                        type = "submit"
                        name = "back-btn"
                        value = "Back"
                    >
                </div>
            </form>
            <div class="cnpj"><?php echo $check ?></div>
            <div class="cnpj">Random CNPJ: <?php echo $cnpj ?></div>
        </fieldset>
    </div>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js"></script>
    <script src="/cwdc/mainPage/LCG.js"></script>
    <script type="text/javascript">
        dragAndSave(".cnpj-container"); // $("#cnpj-fieldset").draggable()
    </script>
</body>
</html>
