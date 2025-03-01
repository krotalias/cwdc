<?php

/**
 * Loads javascript codes used by the pages.
 * - bootstrap javascript dependencies: jQuery, Popper.js, and Bootstrap JS.
 * - define toggle actions when clicking .toggleforms.
 * - define the function called when the contents of textarea 'diary' has changed.
 *
 * Note that jquery slim.min.js breaks ajax. Use jquery min.js instead.
 * - TypeError: undefined is not a function near $.ajax
 *
 * PHP version 5.3+
 *
 * @file footer.php
 *
 * @category  Application
 * @package   CWDC
 * @author    Paulo Roma <roma@lcg.ufrj.br>
 * @copyright 2019-2022 Paulo Roma
 * @license   https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html GPLv2
 * @version   SVN: $Id$
 * @link      /cwdc/7-mysql/footer.php
 * @see       <a href="/cwdc/7-mysql/footer.php">link</a>
 * @see       https://api.jquery.com/toggle/
 * @see       https://api.jquery.com/bind/
 * @see       https://stackoverflow.com/questions/42657303/ajax-request-isnt-submitting-to-the-database-after-jquery-keyup-function
 */

?>

<!-- jquery slim build excludes the ajax and effects modules -->
<script
    src="https://code.jquery.com/jquery-3.5.1.min.js"
    integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
    crossorigin="anonymous"
></script>
<script
    src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"
    integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN"
    crossorigin="anonymous"
></script>
<script
    src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js"
    integrity="sha384-+YQ4JLhjyBLPDQt//I+STsc9iw4uQqACwlvpslubQzn4u2UU2UFM80nGisd026JF"
    crossorigin="anonymous"
></script>

<script type="text/javascript">
    $(".toggleForms").click(function() {
        $("#signUpForm").toggle();
        $("#logInForm").toggle();
    });

    $('#diary').bind('input propertychange', function() {
        $.ajax({
                method: "POST",
                url: "updatedatabase.php",
                data: {
                    content: $("#diary").val()
                }
            })
            .done(function(msg) {
                // alert( "Data saved: " + msg );
            });
    });
</script>

</body>

</html>