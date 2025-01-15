<?php

/**
 * Returns a json encoded array with all directory names in a given folder.
 *
 * PHP version 5.3+
 *
 * @file readDirectories.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/readDirectories.php
 * @see       <a href="/cwdc/6-php/readDirectories.php?dir=/WebGL/cubemaps">link</a>
 * @see       https://www.php.net/manual/en/function.pathinfo.php
 * @see       https://www.php.net/manual/en/function.glob.php
 * @see       https://www.droptica.com/blog/combining-string-literals-and-variables-php/
 * @since     27/10/2022
 */

/// @cond
$dir = isset($_GET["dir"]) ? "{$_SERVER['DOCUMENT_ROOT']}/{$_GET['dir']}" : './';
$out = array();

$scan = scandir($dir);
foreach ($scan as $filename) {
    if (is_dir("$dir/$filename")) {
        if ($filename !== "." && $filename !== "..") {
            $p = pathinfo($filename);
            $out[] = sprintf('%s', $p['filename']);
        }
    }
}
echo json_encode($out);
/// @endcond
