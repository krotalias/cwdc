#!/usr/bin/env python3
# coding: UTF-8
#
## @package 12.3
#
#  Variables and lists.
#
#  @author Paulo Roma
#  @date 26/02/2021
#  @see https://www.py4u.net/discuss/19386
#  @see https://www.w3schools.com/python/python_dictionaries.asp
#

import math
from datetime import date

print("""Content-type: text/html; charset=utf-8\r\n\r\n
    <head>
        <link rel="stylesheet" type="text/css" href="../mainPage/LCG.css">
        <title>Variables</title>
    </head>
""")

newline = '<br>'

print("<h2>Strings are very nice!</h2>")

print("James Harold Doolittle (1896 - 1993)" + newline)

name = "Jimmy Doolittle"

age = abs(date(1993, 9, 27) - date(1896, 12, 14)).days / 365.0

print("Age is {:+.1f} years".format(age) + newline)

str = "My Name Is "

print("name = '%s'%s str = '%s'%s str[0] &rarr; '%s', str[0:5] &rarr; '%s', str[5] &rarr; '%s' %s" % (
    name, newline, str, newline, str[0], str[0:5], str[5], newline))

print("str + name &rarr; '%s'" % (str + name) + 2 * newline)

print("<h2>Float numbers!</h2>")

pi = math.pi

print("Pi = {}".format(pi) + newline)

print("Age / PI &rarr; {},".format(age / pi))

number = "5"

print("{} * Pi &rarr; {}".format(number, float(number) * pi) + 2 * newline)

print("<h2>Lists are mutable containers...</h2>")

myList = ["Ralph", "Paul", "James", "Charles", "Larry"]

print("L = %s%s L[1] &rarr; %s,  L[2:4] &rarr; %s%s" %
      (myList, newline, myList[1], myList[2:4], newline))

myList[2] = 5

print("L[2] = 5%s L &rarr; %s%s" % (newline, myList, 2 * newline))

print("<h2>...while tuples are immutable containers!</h2>")

myTuple = (1, 2, 3, 4)

print("T = %s, T[2] &rarr; %s%s" % (myTuple, myTuple[2], 2 * newline))

print("T[2] = 5 (<mark>TypeError exception</mark>)" + newline)

try:
    myTuple[2] = 5
except TypeError as e:
    print(e)
    print(2 * newline)

dict = {}
dict["tenor"] = myList[0]
dict["baritone"] = myList[1]
dict[1] = myList[2]
dict[2] = myList[3]
dict[3] = myList[4]

print("""
    <h2>
        <a href='https://www.w3schools.com/python/python_dictionaries.asp'>Dictionaries</a> 
            have no order, but with a very fast search!
    </h2>
""")

print("D = %s, D['tenor'] &rarr; %s%s" % (dict, dict["tenor"], newline))

print("D.keys() &rarr; %s%s D.values() &rarr; %s" %
      (dict.keys(), newline, dict.values()))
