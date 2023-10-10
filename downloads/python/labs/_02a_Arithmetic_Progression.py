#!/usr/bin/env python
#
## @package _02a_Arithmetic_Progression
#
#   Summing an Arithmetic Progression.
#
#   An arithmetic progression or arithmetic sequence is
#   a sequence of numbers such that the difference of any
#   two successive members of the sequence is a constant.
#   <p>
#   For instance, the sequence 3, 5, 7, 9, 11, 13... is
#   an arithmetic progression with common difference d=2,
#   and first element a1=3.
#
#   @author Paulo Roma
#   @since 08/04/2007
#   @see http://en.wikipedia.org/wiki/Arithmetic_series

import sys

##
#   @brief Calculates the sum of the first n terms of an Arithmetic Progression.
#
#   @param n an index of a term of the progression.
#   @param a1 first term of the sequence.
#   @param d difference between to consecutive terms.
#   @return sum of the first n terms: @f$S(n,a_{1},r) = \frac{n}{2}(2a_{1} + (n-1)d).@f$
#
def S(n, a1, d):
    return n * (2 * a1 + (n - 1) * d) / 2

##
#   @brief Calculates the sum of the first n terms of an Arithmetic Progression.
#
#   @param n an index of a term of the progression.
#   @param a1 first term of the sequence.
#   @param d difference between to consecutive terms.
#   @return a string with all terms of the progression, until @f$a_n@f$, separated by "+" and "=" to its sum:
#           "1 + 4 + 7 + 10 + 13 + 16 + 19 = 70".
#
def Sp(n, a1, d):
    p = a1
    d1 = 0
    s = str(a1)
    for i in range(2, n + 1):
        d1 += d
        s += ' + {}'.format(a1 + d1)
        p += a1 + d1  # p = p + a1 + (i-1)*d
    s += " = {}".format(p)
    return s

def main():
    while True:
        try:
            st = raw_input(
                "Enter: number of terms, first term, and common difference: ")
        except NameError:
            st = input("Enter n, a1, and d: ")

        try:
            terms, first, diff = list(map(lambda v: float(v), st.split()))
            break
        except (IndexError, ValueError):
            print("Enter the values on the same line, separated by spaces")

    terms = int(terms)
    if first.is_integer():
        first = int(first)
    if diff.is_integer():
        diff = int(diff)

    print("S({},{},{}) = {:g}".format(terms, first, diff, S(terms, first, diff)))
    print("S({},{},{}) = {}".format(terms, first, diff, Sp(terms, first, diff)))


if __name__ == "__main__":
    sys.exit(main())
