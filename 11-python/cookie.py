#!/usr/bin/env python3
# coding: UTF-8
#
## @package cookie
#
# To see this cookie you can either:
# - call document.cookie from the browser's console
# - or you can check the Storage tab in the developer tools.
#   Click on Cookies, and you should see the cookie there.
#
# @author Paulo Roma
# @since 21/05/2021

import os
import cgi
import cgitb
cgitb.enable()
import datetime
from http.cookies import SimpleCookie

sc = SimpleCookie(os.environ.get('HTTP_COOKIE', ''))
expires = (datetime.datetime.now() + datetime.timedelta(days=1)
           ).strftime("%a, %d-%b-%Y %H:%M:%S GMT")

# get cookie
c_name = sc['name'].value if 'name' in sc else 'nocookie'
f_name = cgi.FieldStorage().getfirst('form', c_name)

# set cookie
sc['name'] = f_name
sc['name']["expires"] = expires

# send to server in the request
print(sc.output())
print("Content-Type: text/html")
print("""
<html><body>
<ul>
    <li>get COOKIE value: {0}</li>
    <li>posted FORM: {1}</li>
    <li>set COOKIE: {2}</li>
</ul>
<form method="post">
    <input type='text' name='form' value='{1}'/>
    <input type='submit' value='submit' />
</form>
</body></html>""".format(c_name, f_name, sc.output()))
