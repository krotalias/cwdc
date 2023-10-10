#!/usr/bin/env python
#
## @package _02e_interest
#
#   Interest rates.
#
#   @author Paulo Roma
#   @since 10/06/2012

import math

##
#   Calculates the interest rate of a compounding interest.
#
#   @param c initial capital.
#   @param f final capital.
#   @param n number of periods.
#   @return @f$r = {(\frac{f}{c})}^{\frac{1}{n}} - 1.@f$
#
def interest_rate(c, f, n):
    return math.pow(float(f) / c, 1 / float(n)) - 1.0

##
#   Calculates the interest rate of a continuous compounding interest.
#
#   @param c initial capital.
#   @param f final capital.
#   @param n number of periods.
#   @return @f$r = \frac {ln(\frac{f}{c})}{n}.@f$
#
def continuous_interest_rate(c, f, n):
    return math.log(float(f) / c) / float(n)

##
#   Calculates the interest rate of a compounding interest and a continuous compounding interest.
#
#   @param c initial capital.
#   @param f final capital.
#   @param n number of periods.
#   @return a tuple: (rate of a compounding interest, rate of a continuous compounding interest).
#
def interest(c, f, n):
    return (interest_rate(c, f, n), continuous_interest_rate(c, f, n))

def main():
    a = float(input("Enter initial capital: "))
    b = float(input("Enter final capital: "))
    c = int(input("Enter number of periods: "))

    print(interest(a, b, c))
    #print (interest (1900,2126,2.5))


if __name__ == "__main__":
    main()
