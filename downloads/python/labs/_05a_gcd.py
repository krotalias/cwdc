#!/usr/bin/env python
# coding: UTF-8
#
## @namespace _05a_gcd
#
#  Euclid' (300 BC) GCD algorithm.
#
#  @author Paulo Roma
#  @since 10/12/2006
#  @see http://en.wikipedia.org/wiki/Euclidean_algorithm
#

import sys
import getopt
from functools import reduce

##
#   @brief GCD (Greatest Common Divisor) of two integers.
#
#   This is a recursive algorithm (tail recursion).
#
#   @param a first positive integer.
#   @param b second positive integer.
#   @return GCD of a and b.
#
def gcdr(a, b):
    if a > b:
        (a, b) = (b, a)
    if a <= 0:  # Error
        return None
    if a == 1 or b - a == 0:
        return a
    return gcdr(b - a, a)

##
#   @brief GCD (Greatest Common Divisor) of two integers.
#
#   This is an iterative algorithm.
#
#   @param a first positive integer.
#   @param b second positive integer.
#   @return GCD of a and b.
#
def gcdi(a, b):
    if a == 0:
        return b
    while b != 0:
        if a > b:
            a = a - b
        else:
            b = b - a
    return a

##
#   @brief GCD (Greatest Common Divisor) of two integers.
#
#   This is a fast algorithm.
#
#   @param x first positive integer.
#   @param y second positive integer.
#   @return GCD of a and b.
#
def gcdf(x, y):
    while x:
        x, y = y % x, x
    return y


## Least Common Multiple, which returns the smallest
#  number that can be divided by x and y without any remainder.
#  @param x first integer.
#  @param y second integer.
#  @return LCM.
#  @see https://en.wikipedia.org/wiki/Least_common_multiple
#  @see https://www.w3resource.com/python-exercises/challenges/1/python-challenges-1-exercise-37.php
#
def lcm(x, y): return x * y // gcdf(x, y)

##
#   @brief Exception class.
#
#   Thrown for invalid arguments.
#
#   @param Exception an exception.
#
class Usage(Exception):
    ##
    #   @brief Constructor.
    #
    #   @param msg Error message.
    #
    def __init__(self, msg=""):
        if (msg):
            ## @var msg
            #  hold the error message.
            self.msg = "Usage: " + msg
        else:
            self.msg = "Usage: Invalid or NULL arguments"

    ##
    #   @brief Redefines the printing method.
    #
    #   @return msg
    #
    def __str__(self):
        return self.msg

##
#   @brief main function for testing.
#
#   @param argv None
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    try:
        try:
            opts, args = getopt.getopt(argv[1:], "h", ["help"])
        except getopt.GetoptError as msg:
            raise Usage(str(msg))
        # opts is an option list of pairs [(option1, argument1), (option2, argument2)]
        # args is the list of program arguments left after the option list was stripped
        # for instance, "gcd.py -h --help 1 2", sets opts and args to:
        # [('-h', ''), ('--help', '')] ['1', '2']
        for h, a in opts:  # something such as [('-h', '')] or [('--help', '')]
            if h in ("-h", "--help"):
                print("Usage gcd.py n1 n2\
                     \nComputes the Greatest Common Divisor and \
                     \nLeast Common Multiple of two positive integers n1 and n2")
                return 1

        if len(args) < 2:
            # will be caught by the outer "try"
            raise Usage("two integer arguments needed.")

        (a, b) = args  # This is a list with two strings
        if not (a.isdigit() and b.isdigit()):
            # will be caught by the outer "try"
            raise Usage("Non numeric argument given.")

    except Usage as err:
        print(str(err) + "\nFor help, type: %s --help" % argv[0])
        return 2

    a, b = int(a), int(b)
    if a and b:
        print("The GCD of %s and %s is %d" % (a, b, gcdf(a, b)))
        print("The LCM of %s and %s is %d" % (a, b, lcm(a, b)))
        try:
            n = int(input("Type n: "))
        except SyntaxError:
            return
        print("The smallest integer divisible by all integers in the range(1,%d) is: %d" %
              (n + 1, reduce(lcm, range(1, n + 1))))
    else:
        raise Usage("This should not have occurred.")

    return 0


##  When main() calls sys.exit(), your interactive Python interpreter
#   will exit! The remedy is to let main()'s return value specify
#   the exit status.
#   @see http://www.artima.com/weblogs/viewpost.jsp?thread=4829
#
if __name__ == "__main__":
    print('This program is being run by itself')
    # throws an exception
    # http://docs.python.org/library/sys.html
    sys.exit(main())
else:
    print('I am being imported from another module')
