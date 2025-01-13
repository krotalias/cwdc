#!/usr/bin/env python3
# coding: UTF-8
#
## @package romanHTML
#
#  Create the roman html code for performing roman conversion.
#
#  @author Paulo Roma
#  @date 28/05/2021
#
from __future__ import print_function

## Send the html code for creating the Web page for roman conversion.
#
#  @param decimal string for the decimal value field in the form.
#  @param roman string for the roman value field in the form.
#  @param message string to be displayed when Esc key is pressed.
#
def createRomanHTML(decimal, roman, message=""):
    print("""Content-type:text/html; charset=utf-8\r\n\r\n
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
            <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
            <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">
            <title> Roman </title>
            <style>
                body {
                    background-color: #f0f0f2;
                    margin: 30px;
                    display: none;
                }
                .box {
                    text-align: center;
                    background-color: #fbefdf;
                    border: 1px solid black;
                    box-shadow: 8px 8px 6px grey;
                    padding: 20px;
                }
                #message{
                    text-align: center;
                    font-size: 10px;
                }
                input[type="text"], input[type="number"], textarea {
                    background-color : #d1d1d1;
                    font-size: 10px;
                }
                .button {
                    font-size: 13px;
                    color:red;
                    background-color: #f8fad7;
                }
                .button:hover {
                    background-color: #fadad7;
                }
                #draggable {
                    cursor: n-resize;
                }
                #romanfieldset {
                    cursor: move;
                }
            </style>
        </head>
        <body>
    """)

    # When the parameter action is not specified, the data is sent to the page that contains the form
    # Multi-line strings using triple quotes. End of lines are included by default.
    print("""
        <fieldset id="romanfieldset" class="draggable ui-widget-content" style="border: 1px black solid; background-color:#cac3ba; width:350px">
            <legend style="border: 5px lightblue solid;margin-left: 1em; background-color:#FF6347; padding: 0.2em 0.8em"><strong>Roman</strong></legend>

            <form id="romanform" method="get">
                <div class="box">
                    <input type="number" size="7" id="decimal" name="decimal" min="1" max="3999999" title="Decimal" value = {} autofocus autocomplete="off" required>
                    =
                    <input type="text" size="28" id="roman" name="roman" pattern="[\(\)CDILMVXcdilmvx]*" title="Roman" value = {} autocomplete="off">
                    <br>
                    <input type="submit" id="roman_button" name="roman_button" class="button" value="Roman &rarr;">
                    <img src="Roman_Soldier.png" width="50">
                    <input type="submit" id="decimal_button" name="decimal_button" class="button" value="&larr; Decimal">
                </div>
            </form>
            <div id="message">Note: characters in ( ) are multiplied by 1000 and values &isin; [1, 3.999.999]</div>
        </fieldset>
    """.format(decimal, roman))

    # Blocks the pop up asking for form resubmission on refresh once the form is submitted.
    # Just place this javascript code at the footer of your file and see the magic.
    print("""
        <script src="/cwdc/mainPage/LCG.js"></script>
        <script type="text/javascript">
            // Shorthand for $( document ).ready()
            $(function() {
                // create hidden and show later onDomReady. Flicker-free!
                $('body').css('display','block');
                dragAndSave("#romanfieldset")
                window.onkeydown = function (event) {
                    if (event.key == 'Escape') {
                        alert (`%s`);
                    } else if (event.key == 'b') {
                        window.location.href = "../11-python";
                    }
                }
            });
        </script>

        <script>
            if ( window.history.replaceState ) {
                window.history.replaceState( null, null, window.location.href )
            }
        </script>

        </body>
        </html>
    """ % (message))
