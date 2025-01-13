#!/usr/bin/env python3
# coding: UTF-8
#
## @package triGenerator
#
#   Right triangle generator.
#
#   Usage:
#   - \ref /cwdc/11-python/triGenerator.py?20+1
#
#   @author Paulo Roma
#   @since 17/12/2020
#   @see http://epydoc.sourceforge.net/stdlib/cgi.FieldStorage-class.html
#   @see https://developer.mozilla.org/en-US/docs/Learn/Forms/Your_first_form#And_a_%3Cbutton%3E_to_finish
#   @see <a href="/cwdc/11-python/triGenerator.py?20+4">link</a>
#
import sys
import os
import cgi

##  Print the right triangle with the length of two of its sides equal
#   to a given value @f$n@f$,
#   using the symbols + and =, in each of its four possible orientations.
#
#   For instance, if n=5, the output should be:
#   <pre>
# 		+====  +++++  ====+  +++++
# 		++===  ++++=  ===++  =++++
# 		+++==  +++==  ==+++  ==+++
# 		++++=  ++===  =++++  ===++
# 		+++++  +====  +++++  ====+
#   </pre>
#
#   @see https://en.wikipedia.org/wiki/Right_triangle
#
class triGenerator:

    ## Constructor.
    #
    #  @param n triangle height.
    #  @param lf line feed character.
    #
    def __init__(self, n=5, lf='\n'):
        ## triangle height.
        self.n = n
        ## line feed character.
        self.lf = lf

    ## Return a string representing the right triangle of height n
    #  in a given orientation.
    #
    #  @param orientation: 0 up, 1 down, 2 right, 3 left.
    #  @param color triangle color.
    #
    def rightTriangle(self, orientation=0, color=False):
        st = ""
        n = self.n
        ch1 = '+'
        ch2 = '='
        fmt1 = fmt2 = fmt3 = fmt4 = "{}"

        if color:
            fmt1 = "<span class='ch' style='background-color:red;'>{}</span>"
            fmt2 = "<span class='ch' style='background-color:green;'>{}</span>"
            fmt3 = "<span class='ch' style='background-color:#8B2439;'>{}</span>"
            fmt4 = "<span class='ch' style='background-color:#446127;'>{}</span>"

        if orientation == 0:
            for i in range(n):
                st += fmt1.format(ch1 * (i + 1)) + \
                    fmt2.format(ch2 * (n - i - 1)) + self.lf
        elif orientation == 1:
            for i in range(n - 1, -1, -1):
                st += fmt1.format(ch1 * (i + 1)) + \
                    fmt2.format(ch2 * (n - i - 1)) + self.lf
        elif orientation == 2:
            for i in range(n - 1, -1, -1):
                st += fmt4.format(ch2 * (i)) + \
                    fmt3.format(ch1 * (n - i)) + self.lf
        elif orientation == 3:
            for i in range(n):
                st += fmt4.format(ch2 * (i)) + \
                    fmt3.format(ch1 * (n - i)) + self.lf
        return st

    ## Generates and interleaves all four orientations for printing.
    #
    def __str__(self):
        symList = []
        for i in range(4):
            symList.append(self.rightTriangle(
                i, self.lf == "<br>").split(self.lf))

        # list(zip(symList[0], symList[1], symList[2], symList[3]))
        lstr = list(zip(*symList))
        # this is a list of tuples
        # [('+== ', '+++ ', '==+ ', '+++ '), ('++= ', '++= ', '=++ ', '=++ '), ('+++ ', '+== ', '+++ ', '==+ ')]

        st = ""
        for i in lstr:
            # print each tuple
            # print ("".join(i))
            st += "".join(i) + self.lf

        return st.rstrip(self.lf)

## Main program for testing.
#
#  @param argv command line arguments.
#  - argv[0]: script name.
#  - argv[1]: triangle height.
#  - argv[2]: orientation: up, down, right, left.
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    HTML = 'REQUEST_METHOD' in os.environ

    if HTML:
        newline = '<br>'

        ## The form object.
        #  Store a sequence of fields, reading multipart/form-data.
        form = cgi.FieldStorage()

        if "height" in form and "orientation" in form:
            height = form.getvalue("height")
            orientation = form.getvalue("orientation")
        else:
            height = argv[1]
            orientation = argv[2]

        try:
            n = int(height)
            o = int(orientation)
        except ValueError:
            print('Please enter a whole number' + newline)
            n = 10
            o = 4

        t = triGenerator(n, newline)

        print("""Content-type: text/html; charset=utf-8\r\n\r\n
            <html>
            <head>
                <title> Triangle </title>
                <style>
                    body {
                        background-color: #f0f0f2;
                        margin: 30px;
                        color: black;
                    }
                    .ch {
                        color:white;
                    }
                </style>
            </head>
            <body>
        """)

        print("""
            <div> {} </div>
        """.format(t.rightTriangle(o, HTML) if o < 4 else t))

        message = "How tall is the triangle?"

        print(
            """
            <h1>Right triangle Generator</h1>
            <p> {} </p>
        """.format(message))

        def selected(ori): return 'selected' if ori == o else ''

        # When the parameter action is not specified, the data is sent to the page that contains the form
        print(
            """
            <form method="get">
                <label for="height">Height</label>
                <input type="number" name="height" id="height" min=0 max=99 value = {} autofocus>

                <label for="orientation">Orientation</label>
                <select name="orientation" id="orientation">
                             <option value="0" {}>Up</option>
                             <option value="1" {}>Down</option>
                             <option value="2" {}>Right</option>
                             <option value="3" {}>Left</option>
                             <option value="4" {}>All</option>
                </select>

                <input type="submit" value="Generate!">
            </form>
        """.format(height, selected(0), selected(1), selected(2), selected(3), selected(4)))

        # Blocks the pop up asking for form resubmission on refresh once the form is submitted.
        # Just place this javascript code at the footer of your file and see the magic.
        print(
            """
            <script>
                if ( window.history.replaceState ) {
                   window.history.replaceState( null, null, window.location.href );
                }
            </script>

            </body>
            </html>
        """)

    else:
        if len(argv) > 2:
            n = int(argv[1])
            o = int(argv[2])
        else:
            n = int(input("Type n: "))
            o = 4

        newline = '\n'
        t = triGenerator(n, newline)
        print(t.rightTriangle(o, HTML) if o < 4 else t)


if __name__ == '__main__':
    sys.exit(main())
