<?php

/**
 * Only get access from localhost, LCG and certain
 * <a href="https://en.wikipedia.org/wiki/List_of_internet_service_providers_in_Brazil">Internet Providers</a>.
 * Otherwise, redirect to google.com
 *
 * PHP version 7.4 +
 *
 * @file blockIPs.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/blockIPs.php
 * @see       <a href="/cwdc/6-php/blockIPs.php">link</a>
 * @see       https://www.php.net/manual/en/function.strncmp.php
 * @see       https://www.php.net/manual/en/reserved.variables.server.php
 * @see       https://www.php.net/manual/en/functions.arrow.php
 * @see       https://www.php.net/manual/en/function.array-map.php
 * @since     08/12/2022
 */

$valid_IP = ['127.', '192.', '177.', '179.', '146.164.'];

$n = array_map(fn($addr): bool => strncmp($addr, $_SERVER['REMOTE_ADDR'], strlen($addr)) !== 0, $valid_IP);
if (
    count(array_unique($n)) < 2
) {
    header("Location: https://google.com");
}
