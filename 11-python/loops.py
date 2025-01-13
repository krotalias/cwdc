#!/usr/bin/env python3
# coding: UTF-8
#
## @package loops
#
#  Loops in Python.
#
#  @author Paulo Roma
#  @since 21/03/2021
#  @see <a href="/cwdc/11-python/12.4.py?344+PAULO%20ROMA">link</a>
#  @see https://theasciicode.com.ar
#  @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
#  @see <a href="/python/_01%20-%20Programando%20em%20Python%20-%20Sistemas%20de%20Numeracao.pdf">Sistemas de Numeração</a>
#

from __future__ import print_function
import sys
import os
import cgi
import cgitb

## The form object.
#  Store a sequence of fields, reading multipart/form-data.
form = cgi.FieldStorage()
cgitb.enable()

## Arguments passed in the URL.
argv = sys.argv

# The form has been submitted.
formsubmitted = form.getvalue("dict")

## Output type.
HTML = formsubmitted or 'REQUEST_METHOD' in os.environ

## When sorting using the dictionary key.
useKey = (formsubmitted == "key") if formsubmitted is not None else len(argv) > 2

if HTML:
    print("""Content-type: text/html; charset=utf-8\r\n\r\n
        <head>
            <link rel="stylesheet" type="text/css" href="../mainPage/LCG.css">
            <title>Loops</title>
            <style>
                .ascii {
                    width: auto;
                    display: inline-block;
                    background-color: #C9CC3F;
                    padding: 30px;
                }
                <p> {
                    marging-left: 40px;
                }
            </style>
        </head>
    """)

    ## Line feed character.
    newline = '<br>'

    # Do not suppress white spaces and use text size "header 3"
    print("<pre><h3>")
else:
    newline = "\n"
    print("form = {}, argv={}".format(formsubmitted, argv))

## Number to be converted.
try:
    ## Number to be converted.
    n = int(argv[1])
    ## String to be converted to a numerical representation.
    st = argv[2]
except:
    n = 229
    st = "New York"

# ------------------------------------------ Strings ------------------------------------------------------

print("<h2>Strings are bytes (numbers), which are mapped to characters</h2>")

## Returns the numerical representation of a string.
# @param s string.
# @param f conversion function.
# @return new string: ' '.join([f(ord(c)) for c in s])
#
def str2num(s, f): return ' '.join(map(f, bytearray(s, 'utf8')))


# Print in binary, decimal and hexadecimal.
print("'{}' = {} {}{:>{width}}   = {} {} {:>{width}}  = {}".
      format(st, str2num(st, bin), newline, "", str2num(st, str), newline, "", str2num(st, hex), width=len(st)))

# ------------------------------------------- ASCII -------------------------------------------------------

print(newline)

## Padding length.
wl, wr = 3, 4
## Number of characters per line.
cpl = 8
## Table title.
title = "ASCII table".center((wl + 3 + wr) * cpl)
if HTML:
    title = title.replace(
        "ASCII", "<a href='https://www.ascii-code.com'>ASCII</a>")
    print("<div class='ascii'/>")
print(title + 2 * newline)
for i in range(32, 127, cpl):
    for c in range(i, i + cpl):
        # < (align left), > (align right) default, and padding 3 or 4
        #            _65 = A___
        ## No new line.
        print("{d:>{wl}} = {ch:<{wr}}".format(
            d=c, wl=wl, ch=chr(c), wr=wr), end="")
    print(newline)
if HTML:
    print("</div/>")

# ---------------------------------------- Number Systems --------------------------------------------------

print(newline)

## Functions are first class objects and can be assigned to variables.
# This is a list of tuples with pairs (function,string).
numberSystem = [(bin, "binary"), (oct, "octal"), (hex, "hexa")]

print('<h2>Computers use binary numbers, but people need a more friendly \
<a href="/python/_01 - Programando em Python - Sistemas de Numeracao.pdf">number system</a></h2>')

print("<ul>")

# The format uses positional arguments, in this example.
for f in numberSystem:
    print("<li>{} in {} = {}</li>".format(n,
          f[1].ljust(len("binary"), " "), f[0](n)))


print("</ul>")

# --------------------------------------- Dictionaries -------------------------------------------------------

## Dictionary - 4 names (key) and ages (value) of people.
# Loop which prints, eg. James is 72
ages = {}

ages["Ralph"] = 35
ages["Charles"] = 36
ages["Paul"] = 5
ages["Larry"] = 67

print("<h2>Dictionaries associate keys to values (any object):</h2>")

## Sorted dictionary by key or value.
pred = sorted(ages) if useKey else sorted(ages, key=ages.get)

## Longest key.
# newlist = [expression for item in iterable if condition == True]
size = max([len(k) for k in ages.keys()])  # this is a list comprehension

print("<ul>")
# The format uses keyword (named) arguments, not positional arguments, in this example.
for i, age in enumerate(pred):  # index, key
    print("<li>{index}: {key:<{width}} is {age}</li>".format(index=i,
          width=size, key=age, age=ages[age]))
print("</ul>")

if HTML:
    print("</h3></pre>")
    # Create a radio button for selecting the sort criterion.
    print("""
        <h2>Dictionaries can be sorted either by key or by value:</h2>
        <div style="margin-left: 40px;">
        <form id="formDict">
            <p>
                <label for="key">Sort by key?</label>
                <input
                    type = "radio"
                    id = "key"
                    name = "dict"
                    value = "key"
                    onchange = "document.getElementById('formDict').submit()"
                >
            </p>
            <p>
                <label for="value">Sort by value?</label>
                <input
                    type = "radio"
                    id = "value"
                    name = "dict"
                    value = "value"
                    onchange = "document.getElementById('formDict').submit()"
                >
            </p>
        </form>
        </div>
    """)

    # print argv.
    print("""
        <script>
            window.onkeydown = function (event) {
                if (event.key === "Escape") {
                    alert ("form = %s, argv = %s" )
                }
            }
        </script>
    """ % (formsubmitted, argv))
