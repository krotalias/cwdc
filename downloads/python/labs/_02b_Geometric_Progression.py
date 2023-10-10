#!/usr/bin/env python
#
## @package _02b_Geometric_Progression
#
#   Summing a Geometric Progression.
#
#   A geometric progression, also known as a geometric sequence,
#   is a sequence of numbers where each term after the first
#   is found by multiplying the previous one by a fixed non-zero
#   number called the common ratio.
#   <p>
#   For example, the sequence 2, 6, 18, 54, ...
#   is a geometric progression with common ratio r=3,
#   and first element a=2.
#
#   @author Paulo Roma
#   @since 08/04/2007
#   @see http://en.wikipedia.org/wiki/Geometric_progression

import sys

##
# @brief Calculates the sum of the first n terms of a Geometric Progression.
#
# @param n an index of a term of the progression.
# @param a first term of the sequence.
# @param r ratio between to consecutive terms.
# @return sum of the first n terms: @f$S(n,a,r) = \frac{a(1 - r^n)}{(1-r)}.@f$
#
def P(n, a, r):
    return a * (1 - r**n) / (1 - r)

##
# @brief Calculates the sum of the first n terms of a Geometric Progression.
#
# @param n an index of a term of the progression.
# @param a first term of the sequence.
# @param r ratio between to consecutive terms.
# @return a string with all terms of the progression, until @f$a_n@f$,
#         separated by "+" and "=" to its sum: "1 + 3 + 9 + 27 + 81 + 243 + 729 = 1093".
#
def Pp(n, a, r):
    p = a
    r1 = 1
    s = str(a)
    ratio = r
    for i in range(1, n):
        r1 *= ratio
        s += ' + {}'.format(a * r1)
        p += a * r1  # p = p + a * r**i
    s += " = {}".format(p)
    return s

def main():
    while True:
        try:
            st = raw_input(
                "Enter: number of terms, first term, and common ratio: ")
        except NameError:
            st = input("Enter n, a, and r: ")
        try:
            terms, first, ratio = list(map(lambda v: float(v), st.split()))
            break
        except (IndexError, ValueError):
            print("Enter the values on the same line, separated by spaces")

    terms = int(terms)
    if first.is_integer():
        first = int(first)
    if ratio.is_integer():
        ratio = int(ratio)

    print("P({},{},{}) = {:g}".format(
        terms, first, ratio, P(terms, first, ratio)))
    print("P({},{},{}) = {}".format(terms, first, ratio, Pp(terms, first, ratio)))


if __name__ == "__main__":
    sys.exit(main())
