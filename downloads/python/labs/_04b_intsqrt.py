#!/usr/bin/env python
# coding: UTF-8
#
## @package _04b_intsqrt
#   Finding int(sqrt) of a given number, by using Newton's Method.
#
#   @f[x_{n+1} = x_n - \frac {f(x_n)} {f'(x_n)}.@f]
#
#   Consider @f$x^{2} - n = 0@f$, which gives us the following recursive formula:
#   @f{eqnarray*}{
#         x_{k+1} &=& 1/2 (x_{k} + \frac{n}{x_{k}}), k >= 0, x_{0} > 0, \\
#         x_{0}   &=& n.
#   @f}
#   Stopping condition: @f$| x_{k+1} - x_{k} | < 1@f$
#
#   @author Paulo Roma
#   @since 04/01/2009
#   @see http://www.duke.edu/~dga2/cps149s/
#   @see http://programmingpraxis.com/2012/06/01/square-roots/
#   @see http://en.wikipedia.org/wiki/Integer_square_root
#   @see http://en.wikipedia.org/wiki/Newton's_method

import sys

##
#  Calculates the integer part of the square root of a long.
#  It is applied the Newton method for solving: @f$x^{2} - n = 0.@f$
#
#  @param n given long.
#  @return @f$int(\sqrt{n}).@f$
#
def intsqrt(n):
    r = n
    rnew = (r + 1) // 2
    while rnew < r:
        r = rnew
        rnew = (r + n // r) // 2   # integer division
    return r

## Python 3.8
#
#  @param n given long.
#  @return @f$int(\sqrt{n}).@f$
#  @see https://stackoverflow.com/questions/15390807/integer-square-root-in-python
def isqrt(n):
    if n > 0:
        x = 1 << (n.bit_length() + 1 >> 1)
        while True:
            y = (x + n // x) >> 1
            if y >= x:
                return x
            x = y
    elif n == 0:
        return 0
    else:
        raise ValueError("square root not defined for negative numbers")

def main(argv=None):
    if argv is None:
        argv = sys.argv

    if len(argv) < 2:
        print("One argument is needed.")
        return 1
    else:
        if not argv[1].isdigit():
            print("A positive integer is expected.")
            return 1

    n = int(argv[1])
    print("intsqrt({}) = {}".format(n,intsqrt(n)))
    print("isqrt({}) = {}".format(n,isqrt(n)))

    return 0


if __name__ == "__main__":
    sys.exit(main())
