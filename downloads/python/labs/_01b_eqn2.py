#!/usr/bin/env python
# coding: UTF-8
## @package _01b_eqn2
#   Solving second degree equations.
#
#   Having
#      @f$ax^2+bx+c=0,@f$
#   the roots are given by the quadratic formula
#      @f[x=\frac{-b \pm \sqrt {b^2-4ac}}{2a},@f]
#   where the symbol "±" indicates that both
#      @f$x=\frac{-b + \sqrt {b^2-4ac}}{2a}\quad\text{and}\quad x=\frac{-b - \sqrt {b^2-4ac}}{2a}@f$
#   are solutions of the quadratic equation.
#
#   @author Paulo Roma
#   @since 15/04/2010
#   @see http://en.wikipedia.org/wiki/Quadratic_equation

from math import *
import sys

##
#   Solves a second degree equation: @f$ax²+bx+c=0@f$
#
#   @param a a coefficient.
#   @param b b coefficient.
#   @param c c coefficient.
#   @return root1, root2
#
def eqn2(a, b, c):
    delta = b * b - 4 * a * c
    if (delta >= 0):
        sqrt_delta = sqrt(delta)
    else:
        sqrt_delta = complex(0, sqrt(abs(delta)))

    root1 = (-b + sqrt_delta) / float(2 * a)
    root2 = (-b - sqrt_delta) / float(2 * a)

    return (root1, root2)

def main():
    while True:
        try:
            a = float(input("Enter the 'a' coefficient: "))
            b = float(input("Enter the 'b' coefficient: "))
            c = float(input("Enter the 'c' coefficient: "))
        except (SyntaxError, ValueError) as e:
            sys.exit("The end")
        except (NameError, TypeError) as e:
            print("Type again (%s):" % e)
        else:
            break

    while True:
        try:
            r1, r2 = eqn2(a, b, c)
        except (ZeroDivisionError) as e:
            print("Coefficient 'a' cannot be 0 (%s)" % e)
            if b > 0.0:
                print("The linear equation has solution:", -c / float(b))
            try:
                a = float(input("Enter the 'a' coefficient again: "))
            except (SyntaxError, ValueError) as e:
                sys.exit("The end")
        else:
            break

    print("Root 1 = %r" % r1)
    print("Root 2 = %r" % r2)

    # just checking the roots
    def eq(root): return a * root * root + b * root + c
    print(eq(r1))
    print(eq(r2))
    print("\n")


if __name__ == "__main__":
    while True:
        main()
