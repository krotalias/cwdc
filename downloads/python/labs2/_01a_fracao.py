#!/usr/bin/env python
# coding: UTF-8
#
## \mainpage Python lab2 set - A set of simple python programs to develop basic OO programming skills.
#
#  The set is made up of 38 small programs in increasing order of difficulty.
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
# - python <a href="../../ISU/VideoStore/doc/html">VideoStore/VideoStore.py</a>
# - python <a href="../../ISU/RiverSimulation/doc/html">RiverSimulation/River.py</a>
# - python <a href="/roma/cg/python/OpenPolyhedra/doc/html/index.html">Open Polyhedra</a>
#
## @package _01a_fracao
#
# A very simple fraction class.
#
# @author Miguel Jonathan e Paulo Roma
# @since 16/09/2009
# @see http://docs.python.org/library/fractions.html
# @see http://docs.python.org/reference/datamodel.html#emulating-numeric-types
# @see https://docs.python.org/2/library/operator.html
#
# In the future, Python will switch to always yielding a real result,
# and to force an integer division operation, you use the special "//"
# integer division operator.  If you want that behavior now, just
# import that "from the future":
#
from __future__ import division
import sys

## mdc is a general use function, defined outside the class.
#
#  @param x first integer: numerator.
#  @param y second integer: denominator.
#  @return GCD: Greatest Common Divisor.
#
def mdc(x, y):
    """Greatest Common Divisor (Maximo divisor comum)."""
    while y != 0:
        resto = x % y
        x = y
        y = resto
    return x

## A simple class for creating fraction objects (rational numbers).
#
class Fracao:
    ## Constructor.
    #
    #  @param num numerator.
    #  @param den denominator
    #
    def __init__(self, num=1, den=1):
        """Constructor"""

        if (den == 0):
            raise ValueError("Zero denominator")

        ### Numerator.
        self.num = num
        ### Denominator.
        self.den = den

        if self.den < 0:           # check for a negative denominator
            self.num = -self.num   # change the sign of the numerator
            self.den = -self.den
        self.simplifica()          # simplify the fraction

    ## Operator ==
    #
    def __eq__(self, f):
        a = self.simplifica()
        b = f.simplifica()
        return (a.num == b.num and a.den == b.den)

    ## Operator +
    #
    def __add__(self, f):
        if isinstance(f, int):       # check whether f is an integer
            num = self.num + f * self.den
            den = self.den
        elif isinstance(f, Fracao):  # check whether f is a fraction
            den = self.den * f.den
            num = self.num * f.den + self.den * f.num
        else:
            raise TypeError("__add__")
        # returns a copy, and therefore is slower than "+="
        return Fracao(num, den)      # a Fraction is built already simplified

    ## Operador right side addition.
    #
    #  This method is only called if the left object does not have an __add__ method,
    #  or that method does not know how to add the two objects
    #  (which it flags by returning NotImplemented).
    #
    def __radd__(self, f):
        return self + f

    ## Operator +=
    #
    def __iadd__(self, f):
        if isinstance(f, int):       # check whether f is an integer
            self.num += f * self.den
        elif isinstance(f, Fracao):  # check whether f is a fraction
            self.num = self.num * f.den + self.den * f.num
            self.den *= f.den
        else:
            raise TypeError("__iadd__")
        return self.simplifica()

    ## Operator *
    #
    def __mul__(self, f):
        if isinstance(f, int):       # check whether f is an integer
            num = self.num * f
            den = self.den
        elif isinstance(f, Fracao):  # check whether f is a fraction
            num = self.num * f.num
            den = self.den * f.den
        else:
            raise TypeError("__mul__")
        return Fracao(num, den)

    ## Operador right side multiplication.
    #
    #  This method is only called if the left object does not have a __mul__ method,
    #  or that method does not know how to add the two objects
    #  (which it flags by returning NotImplemented).
    #
    def __rmul__(self, f):
        return self * f

    ## Operator /
    #
    #  @return self / f when __future__.division is not in effect.
    #
    def __div__(self, f):
        try:
            return self // f
        except Exception as e:
            raise TypeError("__div__")

    ## Operator /
    #
    #  @return self / f when __future__.division is in effect.
    #
    def __truediv__(self, f):
        try:
            return self // f
        except Exception as e:
            raise TypeError("__truediv__")

    ## Operator //
    #
    #  @return self // f.
    #
    def __floordiv__(self, f):
        if isinstance(f, int):     # check whether f is an integer
            f = Fracao(f, 1)
        if isinstance(f, Fracao):  # check whether f is a fraction
            num = self.num * f.den
            den = self.den * f.num
        else:
            raise TypeError("__floordiv__")
        return Fracao(num, den)

    ## Operador right side integer division (python 2).
    #
    #  This method is only called if the left object does not have a __div__ method,
    #  or that method does not know how to add the two objects
    #  (which it flags by returning NotImplemented).
    #
    def __rdiv__(self, f):
        return self.__rfloordiv__(f)

    ## Operador right side float division (python 3).
    #
    #  This method is only called if the left object does not have a __truediv__ method,
    #  or that method does not know how to add the two objects
    #  (which it flags by returning NotImplemented).
    #
    def __rtruediv__(self, f):
        return self.__rfloordiv__(f)

    ## Operador right side integer division.
    #
    #  This method is only called if the left object does not have a __floordiv__ method,
    #  or that method does not know how to add the two objects
    #  (which it flags by returning NotImplemented).
    #
    def __rfloordiv__(self, f):
        return Fracao(self.den, self.num) * f

    ## Operator -
    #
    def __sub__(self, f):
        try:
            return self + -f
        except Exception as e:
            raise TypeError("__sub__")

    ## Operador right side subtraction.
    #
    #  This method is only called if the left object does not have a __sub__ method,
    #  or that method does not know how to add the two objects
    #  (which it flags by returning NotImplemented).
    #
    def __rsub__(self, f):
        return -self + f

    ## Operator -
    #
    def __neg__(self):
        return Fracao(-self.num, self.den)

    ## Controls how a fraction is printed.
    #
    #  @return a string: numerator/denominator, or
    #          only the numerator, if the denominator is 1, after simplification, or
    #          0, if the numerator is null.
    def __str__(self):
        if self.num == 0:
            return "0"
        elif self.den == 1:
            return str(self.num)
        else:
            return str(self.num) + '/' + str(self.den)

    ## Simplifies this fraction, by dividing either the numerator
    #  or the denominator by its gcd.
    #
    def simplifica(self):
        max = 1
        if self.num != 0:                   # assert Fracao != 0
            max = mdc(self.num, self.den)   # find the greatest common divisor
        if max > 1:                         # reduce this fraction!
            self.num //= max
            self.den //= max
        return self

## Main program for testing.
#
def main():
    f = Fracao(15, 45)
    g = Fracao(50, 75)
    print("f = 15/45 = %s" % f)
    print("g = 50/75 = %s" % g)
    print("f + g = %s" % (f + g))
    h = Fracao(10, 28)
    print("h = 10/28 = %s" % h)
    print("f * h = %s" % (f * h))
    print("f + g + h = %s" % (f + g + h))
    print("f + g * h = %s" % (f + g * h))
    print("g - f - f = %s" % (g - f - f))
    print("f * 2 = %s" % (f * 2))
    print("f + 2 = %s" % (f + 2))
    print("f / g = %s" % (f / g))
    print("f // g = %s" % (f // g))
    print("-f = %s" % -f)
    f += g * 2
    print("f += g*2 = %s" % f)
    f -= g * 2
    print("f -= g*2 = %s" % f)
    try:
        print("2 + f = %s" % (2 + f))  # right side addition
    except (ValueError, TypeError) as e:
        print("Exception caught: %s" % e)
    print("f == h %s" % (f == h))
    print("f=g=h")
    f = g = h
    print("f == h %s" % (f == h))
    try:
        print("f += \'a\'")
        f += "a"
    except (ValueError, TypeError) as e:
        print("Exception caught: %s" % e)
    try:
        print("Fracao(2,0) = ")
        print(Fracao(2, 0))
    except (ValueError, TypeError) as e:
        print("Exception caught: %s" % e)
    try:
        print("Fracao(5,3) / Fracao(0,4)")
        print(Fracao(5, 3) / Fracao(0, 4))
    except Exception as e:
        print("Exception caught: %s" % e)


if __name__ == "__main__":
    sys.exit(main())
