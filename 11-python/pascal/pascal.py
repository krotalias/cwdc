#!/usr/bin/env python3
# coding: UTF-8
#
## @package pascal
#   A Pascal triangle generator using yield.
#
#   There is a lot of work in building an iterator in Python.
#   - We have to implement a class with __iter__() and __next__() method,
#   - keep track of internal states, and raise StopIteration when there are no values to be returned.
#
#   This is both lengthy and counterintuitive. Generator comes to the rescue in such situations.
#
#   Usage:
#   - \ref /cwdc/11-python/pascal/pascal.py?15
#
#   @author Paulo Roma
#   @since 21/05/2010
#   @see https://en.wikipedia.org/wiki/Generator_(computer_science)
#   @see <a href="/cwdc/11-python/pascal/pascal.py?15">link</a>
#   @see <a href="/cwdc/11-python/showCodePython.php?f=pascal/pascal">source</a>
#   @see <a href="/cwdc/11-python/pascal/pascal-ajax.js">pascal ajax</a>
#   @see <a href="/cwdc/11-python/doc/html/readFile_8py.html">readFile</a>
#   @see <a href="/python/labs/doc/html/__03d__pascal__zip_8py.html">pascal</a>

from __future__ import print_function

import sys
import os

sys.path.insert(0, os.environ.get("DOCUMENT_ROOT") +
                "/cwdc/downloads/python/labs")
from _03d_pascal_zip import pascal

## Main program for displaying the triangle.
#
#  @param argv command line arguments.
#  - argv[0]: /Library/WebServer/Documents/cwdc/11-python/romanConversion.py (macOS)
#  - argv[1]: triangle level
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    ## Last level of the triangle.
    level = int(argv[1]) if len(argv) > 1 else 10

    ## Length of the last row.
    mrow = ' '.join(map(str, list(pascal(level))[-1]))
    mlen = len(mrow)

    HTML = 'REQUEST_METHOD' in os.environ

    if HTML:
        newline = '<br>'
        print("""Content-type: text/html; charset=utf-8\r\n\r\n
            <html>
            <head>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
                <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
                <link
                    rel="stylesheet"
                    href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css"
                >
                <link rel="stylesheet" href="pascal.css">
                <title> Pascal </title>
            </head>
            <body>
                <div style="text-align: center;">
                    <h2><a href="/cwdc/downloads/python/laboratorios.html#pascal">Pascal Triangle</a></h2>
                    <h3>
                        <a href="https://jqueryui.com/draggable/">Draggables</a> and
                        <a href="https://www.learnpython.org/en/Generators">Generators</a>
                    </h3>
                </div>

                <pre>
                    <div id="code"></div>
                </pre>

                <figure id="fig">
                    <img src="PascalTriangleAnimated2.gif">
                </figure>

                <div class="clear-float"></div>

                <div id="tri">
                    <p>{}</p>
                </div>

                <div id="testCode"></div>

                <div id="testTri">
                    {}
                </div>

                <script type="text/javascript" src="pascal-ajax.js"> </script>
                <script src="/cwdc/mainPage/LCG.js"></script>
                <script>
                    dragAndSave("#fig");
                    dragAndSave("#tri");
                    dragAndSave("#code");
                </script>
            </body>
            </html>
        """.format(newline.join([(' '.join(map(str, x))).center(mlen) for x in pascal(level)]), mrow))
    else:
        newline = '\n'
        print(newline.join(["{:^{mlen}}".format(
            ' '.join(map(str, x)), mlen=mlen) for x in pascal(level)]))


if __name__ == '__main__':
    main()
