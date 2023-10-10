#!/usr/bin/env python
#
## @package _02d_interest
#
#   Interests.
#
#   @author Paulo Roma
#   @since 10/06/2012

import math

##
#   Calculates the compounding interest.
#
#   @param c initial capital.
#   @param n number of periods.
#   @param t interest rate.
#   @return @f$J(n,c,t) = c(1 + t)^{n}.@f$
#
def compounding_interest(c, n, t):
    return c * math.pow((1.0 + t), n)

##
#   Calculates the continuous compounding interest.
#
#   @param c initial capital.
#   @param n number of periods.
#   @param r interest rate.
#   @return @f$J(n,c,r) = ce^{rn}.@f$
#
def continuous_compounding_interest(c, n, r):
    return c * math.exp(r * n)

##
#   Calculates the compounding interest and the continuous compounding interest.
#
#   @param c initial capital.
#   @param n number of periods.
#   @param t interest rate.
#   @return a tuple: (compounding interest, continuous compounding interest).
#
def interest(c, n, t):
    return (compounding_interest(c, n, t), continuous_compounding_interest(c, n, t))

def main():
    a = float(input("Enter initial capital: "))
    b = int(input("Enter number of periods: "))
    c = float(input("Enter interest rate: "))

    #print (interest (1900,2.5,0.045))
    print(interest(a, b, c))


if __name__ == "__main__":
    main()
