#!/usr/bin/env python
#
## @package _03d_pascal_rec
#   Pascal triangle using factorials.
#
# <PRE>
# 0        1
# 1       1 1
# 2      1 2 1
# 3     1 3 3 1
# 4    1 4 6 4 1
# 5  1 5 10 10 5 1
#
#    0 1 2  3  4 5
# </PRE>
#
#   @author Paulo Roma
#   @since 12/04/2009
#   @see http://en.wikipedia.org/wiki/Pascal_triangle

from functools import reduce

##
#   Factorial of n, recursive version.
#   The factorial, denoted by n!, is defined for a positive integer, and
#   represents the product of all numbers less than or equal n.
#
#   @param n an integer.
#   @return n!
#
def factr(n):
    if n <= 1:
        return 1
    else:
        return n * fact(n - 1)

##
#   Factorial of n, non-recursive version.
#   The factorial, denoted by n!, is defined for a positive integer, and
#   represents the product of all numbers less than or equal n.
#
#   @param n an integer.
#   @return n!
#   @see https://docs.python.org/3/library/functools.html?highlight=reduce#functools.reduce
#
def fact(n):
    # reduce(lambda x, y: x*y, [1, 2, 3, 4, 5])
    # ((((1*2)*3)*4)*5)
    return reduce(lambda x, y: (x * y), range(1, n + 1), 1)

##
#   k factorial of n.
#
#   @param n an integer.
#   @param k
#   @return n!/(n-k)!
#
def kfact(n, k):
    if k < 1:
        return 1
    else:
        return n * kfact(n - 1, k - 1)

##
#   The binomial coefficient, refered as row n, column k.
#   It also represents the number of combinations of n things
#   taken k at a time (called n choose k).
#
#   @param n row.
#   @param k column.
#   @return n!/(n-k)!k!
#
def pascal(n, k):
    return kfact(n, k) // fact(k)

##
#   Prints successive rows of Pascal's triangle, from 0 to n.
#
#   @param n a positive integer.
#
def showpascal(n):
    for r in range(0, n + 1):
        row = []
        for c in range(0, r + 1):
            row.append(pascal(r, c))
        print(' ' * (n - r) + ''.join(["%s " % el for el in row]))


if __name__ == "__main__":
    showpascal(int(input('Pascal level = ')))
