<?php

/**
 *  @file showCode.php
 *
 *  Display the source code of an html file.
 *
 *  The file name (without extension) is passed via $_GET array.
 *
 *  Example usage:
 *  - \<a href="showCode.php?f=3.6"\>
 *
 *  @see https://www.php.net/manual/en/function.htmlentities.php
 *  @see https://www.php.net/manual/en/function.nl2br.php
 */

$fn = function ($data) {
    return $data;
};

if (isset($_GET['f'])) {
    echo  <<<HEREDOC
<pre>
{$fn(htmlentities(file_get_contents($_GET['f'].'.html')))}
</pre>
HEREDOC;
}
