#!/usr/bin/env python3
# coding: UTF-8
#
## @package flag
#
#   Flag generator.
#
#   Usage:
#   - <a href="/cwdc/11-python/flag.py?20+0+1">link</a>
#
#   @author Paulo Roma
#   @since 19/12/2021
#   @see https://epydoc.sourceforge.net/stdlib/cgi.FieldStorage-class.html
#   @see https://developer.mozilla.org/en-US/docs/Learn/Forms/Your_first_form#And_a_%3Cbutton%3E_to_finish
#   @see <a href="/cwdc/11-python/flag.py?20+0+1">link</a>
#   @see <a href="https://www.youtube.com/watch?v=AyXMJD21NsI">Pingando Óleo</a>
#   @see <a href="https://www.youtube.com/watch?v=7F67p-NpDNY">Dodge Charger 1969</a>
#   @see <img src="Lee.jpg" width="256">
#
from __future__ import unicode_literals
import sys
import os
import cgi

##  Print the flag with height equal
#   to a given value @f$n@f$, using the symbol *.
#
#   For n = 2 (5 lines):
#   @code
#       *   *
#        * *
#         *
#        * *
#       *   *
#   @endcode
#
#   @see https://pt.wikipedia.org/wiki/Sautor
#   @see https://en.wikipedia.org/wiki/Flags_of_the_Confederate_States_of_America
#   @see https://www.imdb.com/title/tt0078607/
#   @see https://www.theguardian.com/tv-and-radio/2020/jul/27/from-dukes-of-hazzard-to-kanye-west-the-curse-of-the-confederate-flag
#   @see https://www.crwflags.com/fotw/flags/us_afrcs.html
#
class flag:

    ## Constructor.
    #
    #  @param n triangle height.
    #  @param lf line feed character.
    #
    def __init__(self, n=5, lf='\n'):
        ## flag height.
        self.n = n
        ## line feed character.
        self.lf = lf

    ##
    #   Prints an X using asterisks.
    #   The X is parameterized by n,
    #   which indicates the number of lines: lines = 2n+1 <br>
    #   For n = 2 (5 lines):
    #   @code
    #       *   *
    #        * *
    #         *
    #        * *
    #       *   *
    #   @endcode
    #   @param orientation portrait, landscape.
    #   @param color whether to use html class for displaying colors.
    #   @return string for printing the X.
    #
    def xis(self, orientation=0, color=False):
        s = "" if orientation == 0 else "<div class='rotate'>"
        n = self.n
        ch = '★'  # black star
        w = " "
        fmt1 = fmt2 = "{}"

        if color:
            fmt1 = "<span class='space'>{}</span>"
            fmt2 = "<span class='star'>{}</span>"

        # if ch has lateral borders, w has to have also (that is why they should not be grouped)
        # top
        for i in range(n, 0, -1):
            s += fmt1.format(w) * (n - i) + fmt2.format(ch) + fmt1.format(w) * (2 * i - 1) \
                + fmt2.format(ch) + fmt1.format(w) * (n - i) + self.lf

        # center
        s += fmt1.format(w) * n + fmt2.format(ch) + \
            fmt1.format(w) * n + self.lf

        # bottom
        for i in range(1, n + 1):
            s += fmt1.format(w) * (n - i) + fmt2.format(ch) + fmt1.format(
                w) * (2 * i - 1) + fmt2.format(ch) + fmt1.format(w) * (n - i) + self.lf

        if orientation == 1:
            s += "</div>"

        return s

    ## Generates the two orientations for printing.
    #
    def __str__(self):
        return self.xis(self.n)

## Main program for testing.
#
#  @param argv command line arguments.
#  - argv[0]: script name.
#  - argv[1]: flag height.
#  - argv[2]: orientation: portrait, landscape.
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    HTML = 'REQUEST_METHOD' in os.environ

    if HTML:
        newline = '<br>'
        color_scheme = 0

        ## The form object.
        #  Store a sequence of fields, reading multipart/form-data.
        form = cgi.FieldStorage()

        if "height" in form and "orientation" in form:
            height = form.getvalue("height")
            orientation = form.getvalue("orientation")
            color_scheme = form.getvalue("symbol")
        else:
            height = argv[1] if len(argv) > 1 else 10
            orientation = argv[2] if len(argv) > 2 else 0
            color_scheme = argv[3] if len(argv) > 3 else 1

        try:
            n = int(height)
            o = int(orientation)
            c = int(color_scheme)
        except ValueError:
            print('Please enter a whole number' + newline)
            n = 10
            o = 0
            c = 1

        pattern = [{'star_color': 'green',
                    'star_backg': 'black',
                    'background': 'red'},
                   {'star_color': 'red',
                    'star_backg': 'yellow',
                    'background': 'green'},
                   {'star_color': 'white',
                    'star_backg': 'blue',
                    'background': 'red'},
                   {'star_color': 'red',
                    'star_backg': 'green',
                    'background': 'black'},
                   {'star_color': 'black',
                    'star_backg': 'red',
                    'background': 'green'},
                   {'star_color': 'yellow',
                    'star_backg': 'red',
                    'background': 'green'}]

        t = flag(n, newline)

        print("""Content-type: text/html; charset=utf-8\r\n\r\n
            <html>
            <head>
                <title> Flag </title>
                <style>
                    :root {
                        --star_color: white;
                        --star_backg: blue;
                        --background: red;
                    }
                    body {
                        background-color: #f0f0f2;
                        margin: 30px;
                        color: black;
                        line-height: 1.0;
                    }
                    .flag {
                        white-space: pre;
                        font-size: 2rem;
                        font-family: monospace;
                    }
                    .star {
                        color: var(--star_color);
                        background-color: var(--star_backg);
                        border-style: solid;
                        border-width: 0 3px;
                    }
                    .space {
                        color: var(--background);
                        background-color:var(--background);
                        border-style: solid;
                        border-width: 0 3px;
                    }
                    .rotate {
                       display: absolute;
                       transform: translate(-50%,50%) rotate(-90deg) translate(50%, 50%);
                    }
                </style>
            </head>
            <body>
        """)

        xis = t.xis(o, HTML)
        if not isinstance(xis, str):
            # Python 2
            print("""
                <div class="flag">{}</div>
            """.format(xis).encode('utf8'))
        else:
            print("""
                <div class="flag">{}</div>
            """.format(xis))

        message = "How tall is the flag?"

        print(
            """
            <h1><a href="https://pt.wikipedia.org/wiki/Sautor">Sautor</a>
            <a href="https://www.crwflags.com/fotw/flags/us_afrcs.html">Generator</a></h1>
            <p> {} </p>
        """.format(message))

        ## Return the selected item.
        def s(a, b): return 'selected' if a == b else ''

        ## Return the color scheme.
        def p(i): return "{}/{}/{}".format(*pattern[i].values())

        # When the parameter action is not specified, the data is sent to the page that contains the form
        print(
            """
            <form method="get">
                <label for="height">Height</label>
                <input type="number" name="height" id="height" min=1 max=99 value = {} autofocus>

                <label for="orientation">Orientation</label>
                <select name="orientation" id="orientation">
                             <option value="0" {}>Portrait</option>
                             <option value="1" {}>Landscape</option>
                </select>

                <label for="symbol">Pattern</label>
                <select name="symbol" id="symbol">
                             <option value="0" {}>{}</option>
                             <option value="1" {}>{}</option>
                             <option value="2" {}>{}</option>
                             <option value="3" {}>{}</option>
                             <option value="4" {}>{}</option>
                             <option value="5" {}>{}</option>
                </select>

                <input type="submit" value="Generate!">
            </form>
        """.format(height,
                   s(o, 0),
                   s(o, 1),
                   s(c, 0), p(0),
                   s(c, 1), p(1),
                   s(c, 2), p(2),
                   s(c, 3), p(3),
                   s(c, 4), p(4),
                   s(c, 5), p(5)))

        # Blocks the pop up asking for form resubmission on refresh once the form is submitted.
        # Just place this javascript code at the footer of your file and see the magic.
        print(
            """
            <script>
                window.onkeydown = function (event) {{
                    if (event.key == "b") {{
                        window.location.href = "/cwdc";
                    }} else if (event.key == "B") {{
                        let path = window.location.pathname;
                        window.location.href = path.split("/", 3).join("/");
                    }}
                }};
                if ( window.history.replaceState ) {{
                   window.history.replaceState(
                       null, null, window.location.href );
                }}

                // Get the root element.
                // Doubling up curly braces escapes them.
                var r = document.querySelector(':root');
                r.style.setProperty('--star_color', '{}');
                r.style.setProperty('--star_backg', '{}');
                r.style.setProperty('--background', '{}');
            </script>

            </body>
            </html>
        """.format(*pattern[c].values()))

    else:
        if len(argv) > 2:
            n = int(argv[1])
            o = int(argv[2])
        else:
            n = int(input("Type n: "))
            o = 0

        newline = '\n'
        t = flag(n, newline)
        xis = t.xis(o, HTML)
        print(xis)
        print(type(xis))


if __name__ == '__main__':
    sys.exit(main())
