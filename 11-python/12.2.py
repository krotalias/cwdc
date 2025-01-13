#!/usr/bin/env python3
# coding: UTF-8
#
## @package 12.2
#
#  Hello world.
#
#  @author Paulo Roma
#  @date 26/02/2021
#  @see https://www.py4u.net/discuss/19386
#

import sys

print("""Content-type: text/html; charset=utf-8\r\n\r\n
    <head>
        <link rel="stylesheet" type="text/css" href="../mainPage/LCG.css">
        <title>Hello Web World</title>
    </head>
""")

print("""
    <h1>Hello Web World</h1>

    <ul>
        <li><a href="https://www.w3.org">W3C</a></li>
        <li><a href="https://tools.ietf.org/rfc/index">Internet Engineering Task Force (Request for Comments)</a>
        <li><a href="https://wpamelia.com/static-vs-dynamic-website/">Static vs Dynamic Website</a></li>
        <li><a href="https://pages.github.com">GitHub Pages</a></li>
        <li><a href="https://guides.github.com/features/pages/">Getting Started with GitHub Pages</a></li>
        <li><a href="https://www.pythonanywhere.com">pythonanywhere</a>
        <li><a href="https://www.djangoproject.com">Django</a></li>
        <li><a href="https://www.apachefriends.org">XAMPP Apache + MariaDB + PHP + Perl</a></li>
        <li><a href="https://flask.palletsprojects.com/en/2.0.x/">Flask</a></li>
        <li><a href="https://steelkiwi.com/blog/top-10-python-web-frameworks-to-learn/">Steel Kiwi</a></li>
        <li><a href="https://vercel.com">Vercel</a></li>
        <li><a href="https://aws.amazon.com/free/webapps/">AWS</a></li>
        <li><a href="https://clutch.co/br/web-developers">Top Web Developers in Brazil</a></li>
        <li><a href="https://www.youtube.com/watch?v=EW7m2WIvFgQ&t=1519s">Paradigmas de Desenvolvimento Web</a></li>
        <li><a href="https://codeburst.io/100-free-resources-to-learn-full-stack-web-development-5b40e0bdf5f2">100+ FREE Resources to Learn Full Stack Web Development</a></li>
        <li><a href="https://www.tutorialspoint.com/python3/python_cgi_programming.htm">CGI Python Programming</a></li>
        <li><a href="/cwdc/6-php/cederj/cederj.php">Aulas do Cederj</a></li>
    </ul>
    {}
""".format("Python {0[0]}.{0[1]}.{0[2]} - Encoding: {1}".format(sys.version_info[:3], sys.getdefaultencoding())))
