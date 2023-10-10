#!/usr/bin/env python
# coding: UTF-8
#
## \mainpage Python lab set - A set of simple python programs to develop basic programming skills.
#
#  The set is made up of 54 small programs in increasing order of difficulty.
#  <br>
#  Each program should take no more than an hour to write, but beginners may have
#  some trouble and the remainder should be finished at home.
#
# @section notes release.notes
# These programs run either in python 2.7 or python 3.6
# -# <A HREF="../../LEIAME">README</A>
#
# To run any program:
# - python prog_name.py or
# - python3 prog_name.py
#
# where the prog_name is the name of a file,
# with a python 2 or 3 source code, such as:
# - python _03d_pascal.py
#
## @package _01a_fibo
#   Fibonacci sequence.
#
#   An explanation about range x xrange.
#   1. for x in range(10000):
#   will generate a list of ten thousand elements,
#   and will then loop through each of them in turn.
#   2. for x in xrange(10000):
#   will generate ten thousand integers one by one,
#   passing each to the variable x in turn.
#   xrange(10000) returns (what is essentially)
#   an iterator sequence, and consumes the same amount
#   of memory, regardless of the size of the requested list.
#   3. xrange is the one to use if you're looking to
#   generate a huge list of numbers to pass through in
#   something like a for loop, but range is much more flexible
#   as it truly generates an anonymous list.
#   4. xrange is deprecated in python 3.
#
#   @author Paulo Roma
#   @see http://en.wikipedia.org/wiki/Fibonacci_number

import sys

##
#   Prints the first n Fibonacci numbers.
#
#   @param n amount of Fibonacci numbers to be printed.
#
def Fibo(n):
    a, b = 0, 1
    s = ""
    for i in range(0, n):
        s += str(b) + " "

        # The next statement is equivalent of doing:
        #   d=b
        #   b=a+b
        #   a=d
        a, b = b, a + b

    print(s + "\n")

def main():
    c = int(input("Type a natural number: "))
    Fibo(c)


if __name__ == "__main__":
    main()
