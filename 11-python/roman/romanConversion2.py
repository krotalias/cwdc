#!/usr/bin/env python3
# coding: UTF-8
#
## @package romanConversion2
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
#   This version uses cookies for keeping the previous converted values.
#   - The Set-cookie response header from the server directs the client to set a cookie on that particular domain.
#   - The implementation to actually create and store the cookie lies in the browser.
#   - For subsequent requests to the same domain, the browser automatically sets the Cookie request header for each request,
#   thereby letting the server have some state to an otherwise stateless HTTP protocol.
#   - The Domain and Path cookie attributes are used by the browser to determine which cookies are to be sent to a server.
#   - The server only receives name=value pairs, and nothing more.
#
#   @author Paulo Roma
#   @since 17/02/2021
#   @see <a href="/cwdc/11-python/roman/romanConversion2.py">link</a>
#   @see <a href="/cwdc/11-python/showCodePython.php?f=roman/romanConversion2">source</a>
#   @see <a href="/python/labs/doc/html/__03a__roman2int__dict_8py.html">roman2int</a>
#   @see <a href="/python/labs/doc/html/__03c__int2roman_8py.html">int2roman</a>
#   @see <a href="/python/labs/doc/html/validateRoman_8py.html">validateRoman</a>
#   @see https://en.wikipedia.org/wiki/Roman_numerals
#   @see https://www.onlineuniversity.net/resources/roman-numeral-date-conversion-resource/
#   @see https://www.color-hex.com/color/faebd7
#   @see https://flaviocopes.com/cookies/

import sys
import os
import cgi
import html
import datetime
from http.cookies import SimpleCookie, CookieError

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

## Cokie expiration to save the app state
expires = (datetime.datetime.now() + datetime.timedelta(days=1)
           ).strftime("%a, %d-%b-%Y %H:%M:%S GMT")

## Create a pair of cookies for remembering values from last execution.
#
#  The Set-Cookie HTTP response header is used to send a cookie from the server to the user agent,
#  so the user agent can send it back to the server later.
#
#  @param decimal value of the decimal cookie.
#  @param roman value of the roman cookie.
#  @param maxage number of seconds until the cookie expires.
#
#  @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
#  @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
#
def setCookie(decimal, roman, maxage=60 * 60 * 24):
    c = getCookie()
    c['decimal'] = decimal
    c['decimal']['max-age'] = maxage
    c['roman'] = roman
    c['roman']['max-age'] = maxage
    print(c.output())

## The returned cookie is available in the server os.environ dictionary.
#
#  @return a SimpleCookie object.
#
def getCookie():
    if 'HTTP_COOKIE' in os.environ:
        # Run the page twice to retrieve the cookie
        cookiestring = os.environ['HTTP_COOKIE']
    else:
        # The first time the page is run there will be no cookies
        cookiestring = ''
    return SimpleCookie(cookiestring)

## Display all cookies.
#  @return a string with all cookies, one per line.
def dispCookie():
    cookie = getCookie()
    res = "Found the following {} cookies:\\n".format(len(cookie))
    for key in cookie.keys():
        morsel = cookie[key]
        res += "• {}: {}\\n".format(html.escape(key),
                                    html.escape(morsel.value))
    return res

## Main program.
#  Creates an HTML form for inputting the data and handle cookies.
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
#  Recall the typical server-initiated cookie model:
#  - browser requests a page
#  - server sends back a response with cookie(s) attached
#  - browser sends those cookies back to the server on subsequent requests
#  - Cookies can also be initiated on the client side in JavaScript code.
#
#  @param argv command line arguments.
#  - argv[0]: /Library/WebServer/Documents/cwdc/11-python/roman/romanConversion2.py (macOS)
#  - argv[1]: value to convert
#
#  @see https://docs.python.org/3/library/cgi.html
#  @see https://courses.cs.washington.edu/courses/cse154/12au/lectures/slides/lecture21-client-storage.shtml#slide1
#  @see http://www.webstepbook.com
#  @see https://www.webstepbook.com/supplements.shtml
#  @image html cookie_exchange.png width=660cm height=361cm
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    HTML = 'REQUEST_METHOD' in os.environ

    if HTML:
        ## The form object
        form = cgi.FieldStorage()
        if 'roman_button' in form:
            # roman_button has been clicked
            decimal = form.getvalue("decimal")
            # 'form restrictions guarantee decimal is an int
            roman = int2roman(int(decimal))
        elif 'decimal_button' in form:
            # decimal_button has been clicked
            roman = form.getvalue("roman")
            s = validateRoman(roman)
            if s:
                roman = "Error:" + s[0]
            decimal = roman2int(roman) if len(s) == 0 else 0
        else:
            # when page is loaded for the first time, server gets values passed as cookies or in the URL
            c = getCookie()
            decimal = c["decimal"].value if "decimal" in c else 1
            roman = int2roman(int(decimal))

        # send the cookie to (be saved on) the browser
        setCookie(decimal, roman)  # should precede the http response header
        # send the page with the form to the browser
        createRomanHTML(decimal, roman, dispCookie())
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
        # keep asking for values to convert
        main()


if __name__ == "__main__":
    sys.exit(main())
