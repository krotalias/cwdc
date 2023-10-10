#!/usr/bin/env python
# coding: UTF-8
#
## @package _01f_vector
#
# Implements a n-D vector.
#
# @author Paulo Roma
# @since 03/07/2016
# @see http://nedbatchelder.com/text/names.html
# @see https://docs.python.org/dev/tutorial/controlflow.html#more-on-defining-functions
# @see https://gist.github.com/mcleonard/5351452

from __future__ import division
import sys
import math

## A n-D vector with the following operations:
#    +, -, dotProd, neg, norm, len, iter, *, /, [ ]
#
#  When using python 2, vector must be derived from object,
#  so property work!!
#
class vector(object):
    ## Constructor.
    #
    #  @param coords a variable number of arguments passed as a tuple.
    #
    def __init__(self, *coords):
        if len(coords) == 0:
            ## vector data
            self.__array = (0, 0)
        else:
            self.__array = list(coords)  # we want a mutable structure

    ## Operator +.
    def __add__(self, v):
        t = tuple(a + b for a, b in zip(self.__array, v.__array))
        return vector(*t)  # unpack t

    ## Negation operator.
    def __neg__(self):
        t = tuple(-a for a in self.__array)
        return vector(*t)

    ## Operator -.
    def __sub__(self, v):
        return self.__add__(-v)

    ## Dot product operator.
    def dotProd(self, v):
        return sum(a * b for a, b in zip(self, v))

    ## Returns the norm (length, magnitude) of the vector.
    def norm(self):
        return math.sqrt(self.dotProd(self))

    ## Operator * : multiplication by an scalar.
    def __mul__(self, s):
        t = tuple(s * a for a in self.__array)
        return vector(*t)

    ## Operator / : division by an scalar.
    def __truediv__(self, s):
        return self.__mul__(1.0 / s)

    ## Print this vector.
    def __repr__(self):
        return str(self.__array)

    ## Index operator [ ] for reading.
    def __getitem__(self, i):
        return self.__array[i]

    ## Index operator [ ] for writing.
    def __setitem__(self, i, val):
        if (i >= 0 and i < len(self.__array)):
            self.__array[i] = val

    ## Return an iterator for this vector.
    def __iter__(self):
        return self.__array.__iter__()

    ## Return this vector length.
    def __len__(self):
        return len(self.__array)

## Main program for testing.
def main():
    a = vector(1, 2, 3)
    print("a = %s" % a)
    a += vector(3, 5, 1)
    print("a += vector(3,5,1) -> %s" % a)
    print("a - vector(2,2,2) -> %s" % (a - vector(2, 2, 2)))
    print("a -> %s" % a)
    print("a[0] = %d" % a[0])
    print("a[1] = %d" % a[1])
    a[0] = 3
    print("a[0] = %d" % a[0])

    print("a -> %s" % a)
    print("a*3 -> %s" % (a * 3))
    print("a -> %s" % a)

    b = vector(5, 7, 3)
    print("b = %s" % b)
    print("b / 2 -> %s" % (b / 2))
    print("b.norm() -> %f" % b.norm())
    print("a dotProd (1,1,1) -> %d" % a.dotProd(vector(1, 1, 1)))


if __name__ == "__main__":
    sys.exit(main())
