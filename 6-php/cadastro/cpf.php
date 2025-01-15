<?php

/**
 * CPF validation in the terminal.
 *
 * PHP version 5.3+
 *
 * @file cpf.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/cpf.php
 * @see       <a href="/cwdc/6-php/cpf.php">link</a>
 * @see       https://wiki.php.net/rfc/short_list_syntax
 * @see       https://www.geradorcpf.com/
 * @since     17/11/2021
 */

require "cadastro_nacional.php";

/**
 * Validate a CPF typed in a terminal.
 *
 * A valid CPF: "757.331.783-29"
 *
 * @return void
 *
 * @see https://www.php.net/manual/en/function.readline.php
 * @see https://www.php.net/manual/en/reserved.variables.argv.php
 */
function main()
{
    global $argv;

    $cpf = randomCPF()[2];
    print "Random CPF: $cpf\n";

    $value = isset($argv) && count($argv) == 2 ? $argv[1] : readline("CPF: ");

    if (empty($value)) {
        $value = $cpf;
    }

    print checkCPF($value) . "\n\n";

    unset($GLOBALS['argv']);
    main();
}

main();
