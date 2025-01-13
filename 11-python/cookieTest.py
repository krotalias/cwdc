#!/usr/bin/env python
# coding: UTF-8
#
# @see http://cgi.tutorial.codepoint.net/retrieve-the-cookie
#
from __future__ import print_function
import os
import time
from http.cookies import SimpleCookie

cookie = SimpleCookie()
cookie['lastvisit'] = str(time.time())

print(cookie)
print('Content-Type: text/html\n')

print('<html><body>')
print('<p>Server time is', time.asctime(time.localtime()), '</p>')

# The returned cookie is available in the os.environ dictionary
cookie_string = os.environ.get('HTTP_COOKIE')

# The first time the page is run there will be no cookies
if not cookie_string:
    print('<p>First visit or cookies disabled</p>')

else:  # Run the page twice to retrieve the cookie
    print('<p>The returned cookie string was "' + cookie_string + '"</p>')

    # load() parses the cookie string
    cookie.load(cookie_string)
    # Use the value attribute of the cookie to get it
    lastvisit = float(cookie['lastvisit'].value)

    print('<p>Your last visit was at ', end="")
    print(time.asctime(time.localtime(lastvisit)), '</p>')

print('</body></html>')
