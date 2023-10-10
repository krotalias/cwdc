#!/usr/bin/env python
# coding: UTF-8
#
## @package _04c_perfect
#
#   Looking for perfect numbers.
#
#   Many ancient cultures were concerned with the relationship of a number
#   with the sum of its divisors, often giving mystic interpretations.
#   Here we are concerned only with one such relationship:
#
#     - A positive integer n is called a perfect number if it is equal to the sum of all of its positive divisors, excluding n itself.
#
#   For example, 6 is the first perfect number because 6=1+2+3.
#   The next is 28=1+2+4+7+14.  The next two are 496 and 8128.
#   These four were all known before the time of Christ.
#
#   Looking at these numbers in the following partially factored form:
#
#    @f[2 \times 3, 4 \times 7, 16 \times 31, 64 \times 127,@f]
#
#   it is possible to notice that they all have the same form: @f$2^{n-1}(2^{n}-1)@f$ (for n = 2, 3, 5, and 7, respectively).
#   Furthermore, in each case, @f$2^{n}-1@f$ is a Mersenne prime.
#
#   @author Paulo Roma
#   @since 28/12/2008
#   @see http://mathworld.wolfram.com/PerfectNumber.html
#   @see http://en.wikipedia.org/wiki/Perfect_number
#   @see http://www.archive.org/details/lecture12090
#   @see http://www.mersenne.org/
#   @see http://primes.utm.edu/mersenne/

import sys

##
#   Checks whether a given number is perfect.
#   <p>
#   A perfect number is defined as an integer
#   which is the sum of its proper positive divisors,
#   that is, the sum of the positive divisors not including the number.
#   <p>
#   e.g. 6, 28, 496, 8128, 33550336, 8589869056, 137438691328, 2305843008139952128
#
#   @param num given number.
#   @return True if num is perfect, plus the list of its factors, and False otherwise.
#
def is_perfect(num):
    d, f, l = 2, 1, [1]
    for d in range(2, num):
        if (num % d == 0):
            l.append(d)
            f += d
    return (f == num, l)

##
#   Finds the first n perfect numbers.
#   <p>
#   Euclid (300 BC) proved that whenever n is prime AND @f$2^n - 1@f$ is also prime,
#   then @f$2^{(n-1)}(2^{n} - 1)@f$ is perfect, and Euler (1707-1783) showed that all
#   even perfect numbers are of the form, @f$2^{(n-1)}(2^{n}-1)@f$.
#   <p>
#   An odd perfect number has never been found...
#   <p>
#   Dickson: Introduction to The Theory of Numbers, page 5, ex. 8
#   <p>
#   E.g., 6 = 2 * 3, 28 = 4 * 7, 496 = 16 * 31, 8128 = 64 * 127
#
#   @param n number of perfect numbers to be found.
#   @return list with the first n perfect numbers.
#
def find_perfect(n):
    results = []
    count = 1

    # The list of the 50 known primes p for which M(p) = 2**p-1 is a Mersenne prime.
    # There may be others between the 40th and 50th not found yet.
    # M(2) = 3,     M(3) = 7,   M4   = 15,   M(5) = 31,   M6   = 63,   M(7)  = 127,
    # M8   = 255,   M9   = 511, M10  = 1023, M11  = 2047, M12  = 4095, M(13) = 8191

    # autopep8: off
    mprimes = [
              2,        3,       5,         7,       13,       17,       19,
             31,       61,      89,       107,      127,      521,      607,
           1279,     2203,     2281,     3217,     4253,     4423,     9689,
           9941,    11213,    19937,    21701,    23209,    44497,    86243,
         110503,   132049,   216091,   756839,   859433,  1257787,  1398269,
        2976221,  3021377,  6972593, 13466917, 20996011, 24036583, 25964951, 
       30402457, 32582657, 37156667, 42643801, 43112609, 57885161, 74207281,
       77232917, 82589933
    ]
    # autopep8: on

    for i in mprimes:
        j = 2**(i - 1)
        j *= (2 * j - 1)
        if (count > n):
            break
        count += 1
        results.append(j)
    return results

##
#   @brief Main function for testing.
#
def main():
    num = int(input("Enter number: "))

    if (num < 6):
        print("%d is NOT Perfect " % num)
    else:
        res, l = is_perfect(num)
        if (res):
            print("%d is Perfect = " % num + "+".join(["%s" % el for el in l]))
        else:
            print("%d is NOT Perfect != " %
                  num + "+".join(["%s" % el for el in l]))

    print("\nThe first 10 perfect numbers are:")
    print(find_perfect(10))


if __name__ == "__main__":
    sys.exit(main())
