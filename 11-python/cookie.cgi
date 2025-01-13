#!/usr/bin/env python3
# coding: UTF-8
#
## @package cookie
#
# CGI cookie example - Chapter 18 - cookie.cgi
#
# @author John Goerzen
# @since 19/05/2021
# @see http://187.52.54.51/emmonks/redesii/Python_Sockets/18/cookie.cgi
# @see https://www.amazon.com/Foundations-Python-Network-Programming-Brandon/dp/1430258543
# @see https://github.com/apress/foundations-of-python-network-programming-14
#
import cgitb
cgitb.enable()

import cgi
import os
import sys
import html
from http.cookies import SimpleCookie

def getCookie():
    if 'HTTP_COOKIE' in os.environ:
        cookiestring = os.environ['HTTP_COOKIE']
    else:
        cookiestring = ''
    return SimpleCookie(cookiestring)

def dispCookie():
    cookie = getCookie()
    print("\t\tFound the following cookies:\n\t\t<ul>")
    foundcookies = 0
    for key in cookie.keys():
        morsel = cookie[key]
        print("\t\t\t<li>%s: %s</li>" %
              (html.escape(key), html.escape(morsel.value)))
        foundcookies += 1
    print("\t\t</ul>")
    if foundcookies:
        print("""
            <p><a href="%s?action=delCookie">Click here</a>
            to delete the testcookie.</p>
        """ % os.environ['SCRIPT_NAME'])

def setCookie(value, maxage):
    cookie = getCookie()
    cookie['testcookie'] = value
    cookie['testcookie']['max-age'] = maxage
    print(cookie.output())

def main():
    print("Content-type: text/html")
    form = cgi.FieldStorage()
    action = form.getfirst('action')
    if action == 'setCookie':
        setCookie(form.getfirst('cookieval'), 60 * 60 * 24 * 365)
        print("")                              # Signal end of the headers
        print("""
            <html>
                <head><title>Cookie Set</title></head>
            <body>
                The cookie has been set.
                Click <a href="%s">here</a> to return to the main page.
            </body>
            </html>
        """ % os.environ['SCRIPT_NAME'])
    elif action == 'delCookie':
        setCookie('fake', 0)
        print("")                              # Signal end of the headers
        print("""
            <html>
                <head><title>Cookie deleted</title>
            </head>
            <body>
                The cookie has been deleted.
                Click <a href="%s">here</a> to return to the main page.
            </body>
            </html>
        """ % os.environ['SCRIPT_NAME'])
    else:
        print("")
        print("""
            <html>
            <head>
                <title>CGI Cookie Example</title>
            </head>
            <body>
        """)

        dispCookie()

        print("""
            <form method="get" action="%s">
        """ % os.environ['SCRIPT_NAME'])

        for value in ['Red', 'Green', 'Blue', 'White', 'Black']:
            print("""
                <input
                    type = "radio"
                    name = "cookieval"
                    value = "%s"
                > %s <br>
            """ % (value, value))

        print("""
            <input
                type = "submit"
                name = "action"
                value = "setCookie"
            >
            </form>
            </body>
            </html>
        """)


if __name__ == "__main__":
    sys.exit(main())
