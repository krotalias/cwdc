<?php
/**
 *  @file showcode.php
 *
 *  Display the source code of a php file.
 *
 *  The file name (without extension) is passed via $_GET array.
 *
 *  Example usage:
 *  - \<a href="showcode.php?f=7.13"\>
 *
 *  @author     Paulo Roma
 *  @since      10/02/2021
 */
error_reporting(0);
if ($_GET["f"]) {
    show_source($_GET["f"] . ".php");
}
?>
