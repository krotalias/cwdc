#!/usr/bin/env python3
# coding: UTF-8
#
## @package romanConversion
#   Converting decimal numbers to roman numerals and vice-versa.
#
#   Roman numerals, the numeric system in ancient Rome, uses combinations of letters
#   from the Latin alphabet to signify values. The numbers 1 to 10, 50, 100, 500 e 1000
#   can be expressed in Roman numerals as follows:
#     - I, II, III, IV, V, VI, VII, VIII, IX, X, L, C, D, and M.
#
#   In the Middle Ages, a horizontal line was used above a particular numeral, or parentheses placed around it,
#   to represent one thousand times that numeral.
#     - @f$\bar I@f$ or (I) for one thousand.
#     - @f$\overline V@f$ or (V) for five thousand.
#
#   @author Paulo Roma
#   @since 17/02/2021
#   @see <a href="/cwdc/11-python/roman/romanConversion.py?1">link</a>
#   @see <a href="/cwdc/11-python/showCodePython.php?f=roman/romanConversion">source</a>
#   @see <a href="/python/labs/doc/html/__03a__roman2int__dict_8py.html">roman2int</a>
#   @see <a href="/python/labs/doc/html/__03c__int2roman_8py.html">int2roman</a>
#   @see <a href="/python/labs/doc/html/validateRoman_8py.html">validateRoman</a>
#   @see https://en.wikipedia.org/wiki/Roman_numerals
#   @see https://www.onlineuniversity.net/resources/roman-numeral-date-conversion-resource/
#   @see https://www.color-hex.com/color/faebd7
from __future__ import print_function
import sys
import os
import cgi

sys.path.insert(0, os.path.expanduser("~roma") + "/html/python/labs")
from validateRoman import validateRoman
from _03c_int2roman import int2roman
from _03a_roman2int_dict import roman2int
from romanHTML import createRomanHTML

# Fix Python 2.x.
try:
    input = raw_input
except NameError:
    pass

## Main program.
#  Creates an HTML form for inputting the data.
#
#  Using cgi.FieldStorage class to parse query:
#  - Takes care of decoding, handles GET and POST...
#  - The fields, accessed through form[key], are themselves instances of FieldStorage
#  (or MiniFieldStorage, depending on the form encoding).
#  - The value attribute of the instance yields the string value of the field.
#
#  E.g., print (form): with no input, roman_button clicked or decimal_button clicked, respectively.
#  - FieldStorage(None, None, [])
#  - FieldStorage(None, None, [MiniFieldStorage('decimal', '18'), MiniFieldStorage('roman', 'XVIII'), MiniFieldStorage('roman_button', 'Roman →')])
#  - FieldStorage(None, None, [MiniFieldStorage('decimal', '18'), MiniFieldStorage('roman', 'XVIII'), MiniFieldStorage('decimal_button', '← Decimal')])
#
#  @param argv command line arguments.
#  - argv[0]: /Library/WebServer/Documents/cwdc/11-python/roman/romanConversion.py (macOS)
#  - argv[1]: value to convert
#
#  @see https://docs.python.org/3/library/cgi.html
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    HTML = 'REQUEST_METHOD' in os.environ

    if HTML:
        # The form object
        form = cgi.FieldStorage()
        if 'roman_button' in form:
            # roman_button has been clicked
            decimal = form.getvalue("decimal")
            # form restrictions guarantee decimal is an int
            roman = int2roman(int(decimal))
        elif 'decimal_button' in form:
            # decimal_button has been clicked
            roman = form.getvalue("roman")
            s = validateRoman(roman)
            if s:
                roman = "Error:" + s[0]
            decimal = roman2int(roman) if len(s) == 0 else 0
        else:
            # when page is loaded for the first time, get values passed in the URL
            decimal = int(argv[1]) if (
                len(argv) > 1 and argv[1].isdigit()) else 1
            roman = int2roman(decimal)

        # send the page with the form to the browser
        createRomanHTML(decimal, roman,
                        '\\n'.join(['{}: {}'.format(k, v)
                                   for k, v in sorted(os.environ.items())]))
    else:
        if len(argv) > 1:
            a = argv[1]
            sys.argv = []
        else:
            try:
                a = input("Enter value: ")
            except (KeyboardInterrupt, EOFError):
                return

        if a.isdigit():
            n = int(a)
            roman = int2roman(n)
        else:
            roman = a
            s = validateRoman(roman)
            if s:
                roman = "Invalid roman - case " + s
            n = roman2int(roman) if len(s) == 0 else 0

        print("Decimal = {}".format(n))
        print("Roman = {}".format(roman))

        # keeping asking for values to convert
        main()


if __name__ == "__main__":
    sys.exit(main())
