#!/usr/bin/env python
# coding: UTF-8
#
## @package _01c_vector
#
# Implements a 2D vector.
#
# @author Paulo Roma
# @since 27/08/2010
# @see http://nedbatchelder.com/text/names.html

from __future__ import division
import sys
import math

## A vector 2D with the following operations:
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
        self.position = coords

    ## Operator +.
    def __add__(self, v):
        t = tuple(a + b for (a, b) in zip(self.position, v.position))
        return vector(*t)  # unpack t

    ## Negation operator.
    def __neg__(self):
        t = tuple(-a for a in self.position)
        return vector(*t)

    ## Operator -.
    def __sub__(self, v):
        return self.__add__(-v)

    ## Dot product operator.
    def dotProd(self, v):
        return sum(a * b for (a, b) in zip(self.position, v.position))

    ## Returns the norm (length, magnitude) of the vector.
    def norm(self):
        return math.sqrt(self.dotProd(self))

    ## Operator * : multiplication by an scalar.
    def __mul__(self, s):
        t = tuple(s * a for a in self.position)
        return vector(*t)

    ## Operator / : division by an scalar.
    def __truediv__(self, s):
        return self.__mul__(1.0 / s)

    ## Print this vector.
    def __repr__(self):
        return "vector(%s,%s)" % self.position

    ## Index operator [ ] for reading.
    def __getitem__(self, i):
        return self.position[i]

    ## Index operator [ ] for writing.
    def __setitem__(self, i, val):
        if i == 0:
            self.__x = val
        else:
            self.__y = val

    ## Return an iterator for this vector.
    def __iter__(self):
        return self.__position.__iter__()

    ## Return this vector length.
    def __len__():
        return len(self.position)

    ## Return this vector position.
    def __getPosition(self):
        return (self.__x, self.__y)

    ## Set this vector position.
    def __setPosition(self, v):
        ## The two coordinates of this vector
        self.__x, self.__y = v[0], v[1]

    ## A property for this vector position.
    position = property(__getPosition, __setPosition)

## Main program for testing.
def main():
    a = vector(1, 2)
    print("a = %s" % a)
    a += vector(3, 5)
    print("a += vector(3,5) -> %s" % a)
    print("a - vector(2,2) -> %s" % (a - vector(2, 2)))
    print("a -> %s" % a)
    print("a[0] = %d" % a[0])
    print("a[1] = %d" % a[1])
    a[0] = 3
    print("a[0] = %d" % a[0])

    print("a.position -> (%s, %s)" % a.position)
    # position is a property --> same as calling a.__setPosition(2,2)
    a.position = 2, 2
    print("a.position = ( 2, 2 ) -> (%s, %s)" % a.position)
    print("a -> %s, a.position -> %s" % (a, a.position))
    print("a*3 -> %s" % (a * 3))
    print("a -> %s" % a)

    b = vector(5, 7)
    print("b = %s" % b)
    print("b / 2 -> %s" % (b / 2))
    print("b.norm() -> %f" % b.norm())
    print("a dotProd (1,1) -> %d" % a.dotProd(vector(1, 1)))


if __name__ == "__main__":
    sys.exit(main())
