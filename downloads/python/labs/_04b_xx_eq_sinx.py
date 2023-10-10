#!/usr/bin/env python
# coding: UTF-8
#
## @package _04b_xx_eq_sinx
#
#   Finding roots (or zeroes) of a real-valued function, by using Newton's Method.
#
#      @f[x_{n+1} = x_n - \frac {f(x_n)} {f'(x_n)}.@f]
#   <p>
#      Consider @f$x^{2} - sin(x) = 0@f$, which gives us the following recursive formula:
#
#      @f{eqnarray*}{
#          x_{k+1} &=& x_k - \frac {(x_k²-sin(x_k))}{(2*x_k - cos(x_k))}, k >= 0, x_0 > 0 \\
#                &=& \frac {(x_k² - x_k*cos(x_k) + sin(x_k))}{(2*x_k - cos(x_k))}, \\
#         x_0    &=& 1.
#      @f}
#      Stopping condition: @f$ | x_{k+1} - x_k | < \epsilon @f$
#   <p>
#   Alternative way, by using the first two terms of the Mclaurin series for sin(x):
#
#      @f[x^{2} - (x - \frac{x^{3}}{3!}) = 0@f] or
#
#      @f[6x^{2} - 6x + x^{3} = 0 => x^{2} + 6x - 6 = 0@f]
#
#      @f[x = \sqrt{15} - 3 = 0.872983346@f]
#      Remainder @f$< \frac {x^{5}}{5!} < \frac {1}{200} = 0.005@f$
#
#   @author Paulo Roma
#   @since 29/10/2012
#   @see http://www.duke.edu/~dga2/cps149s/
#   @see http://en.wikipedia.org/wiki/Integer_square_root
#   @see http://en.wikipedia.org/wiki/Newton's_method


import sys
from math import cos, sin

##
#   Solves the equation @f$x^{2} = sin (x)@f$.
#
#   @return solution for the equation.
#
def xx_eq_sinx():
    r = 0.0
    rnew = 0.5
    while abs(r - rnew) > 0.005:
        r = rnew
        cosseno = cos(r)
        rnew = (r * r - r * cosseno + sin(r)) / (2 * r - cosseno)
    return rnew

def main(argv=None):
    if argv is None:
        argv = sys.argv

    print("x = %f" % xx_eq_sinx())

    return 0


if __name__ == "__main__":
    sys.exit(main())
