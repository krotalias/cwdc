<?php

/**
 * Returns a json encoded array with all image file names in a given folder.
 *
 * PHP version 5.3+
 *
 * @file readFiles.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/6-php/readFiles.php
 * @see       <a href="/cwdc/6-php/readFiles.php?dir=/WebGL/cubemaps/park">link</a>
 * @see       https://www.php.net/manual/en/function.pathinfo.php
 * @see       https://www.php.net/manual/en/function.glob.php
 * @see       https://www.droptica.com/blog/combining-string-literals-and-variables-php/
 * @since     27/10/2022
 */

$dir = isset($_GET["dir"]) ? "{$_SERVER['DOCUMENT_ROOT']}/{$_GET['dir']}" : './';
$out = array();
/// @cond
foreach (
    glob("{$dir}/*.{jpg,png,gif,JPG,PNG,GIF,json}", GLOB_BRACE) as $filename
) {
    $p = pathinfo($filename);
    $out[] = sprintf('%s.%s', $p['filename'], $p['extension']);
}
echo json_encode($out);
/// @endcond
