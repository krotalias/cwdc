<?php

/**
 * CNPJ validation in the terminal.
 *
 * PHP version 5.3+
 *
 * @file cnpj.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/cnpj.php
 * @see       <a href="/cwdc/6-php/cnpj.php">link</a>
 * @see       https://wiki.php.net/rfc/short_list_syntax
 * @see       http://www.geradorcnpj.com/
 * @since     17/11/2021
 */

require "cadastro_nacional.php";

/**
 * Validate a CNPJ typed in a terminal.
 *
 * A valid CNPJ: "14.358.805/0001-16"
 *
 * @return void
 *
 * @see https://www.php.net/manual/en/function.readline.php
 * @see https://www.php.net/manual/en/reserved.variables.argv.php
 */
function main()
{
    global $argv;

    $cnpj = randomCNPJ()[2];
    print "Random CNPJ: $cnpj\n";

    $value = isset($argv) && count($argv) == 2 ? $argv[1] : readline("CNPJ: ");

    if (empty($value)) {
        $value = $cnpj;
    }

    print checkCNPJ($value) . "\n\n";

    unset($GLOBALS['argv']);
    main();
}
main();
