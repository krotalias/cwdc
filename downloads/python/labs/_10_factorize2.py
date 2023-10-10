#!/usr/bin/env python
# coding: UTF-8
#
## @package _10_factorize2
#
#  A faster factorization algorithm.
#
#  The fundamental theorem of arithmetic states that every positive integer
#  (except the number 1) can be represented in exactly one way, <br />
#  apart from rearrangement, as a product of one or more primes
#  (Hardy and Wright 1979, pp 2-3).
#
#  This is a "fast" algorithm, which can factorize large numbers in a
#  reasonably small time.
#
#  @author Paulo Roma
#  @since 27/12/2008
#  @see https://mathworld.wolfram.com/PrimeFactorizationAlgorithms.html
#  @see https://academickids.com/encyclopedia/index.php/Prime_factorization_algorithm
#  @see https://en.wikipedia.org/wiki/Integer_factorization

from __future__ import print_function
from builtins import input

import sys

from _04b_intsqrt import intsqrt
from _04d_sieve import sieve

if sys.version_info.major == 2:
    ## Encodes a character to utf8 in Python 2.
    def charEncode(f): return str(f.encode('utf8'))
else:
    def charEncode(f): return str(f)

##
# Map decimal digits to their utf8 subscript or superscript equivalents.
#
# @returns a closure for returning a tuple with the subscript and superscript digits.
# @see https://en.wikipedia.org/wiki/Unicode_subscripts_and_superscripts
#
def __translate():
    if sys.version_info.major == 2:
        superscript = {ord(c): ord(t)
                       for c, t in zip(u"0123456789", u"⁰¹²³⁴⁵⁶⁷⁸⁹")}
        subscript = {ord(c): ord(t)
                     for c, t in zip(u"0123456789", u"₀₁₂₃₄₅₆₇₈₉")}
    else:  # python 3
        # translation table for creating superscript.
        superscript = str.maketrans("0123456789", "⁰¹²³⁴⁵⁶⁷⁸⁹")
        # translation table for creating subscript.
        subscript = str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉")
        # Encodes a character as utf8 in python 2

    def inner_translate(val):
        if isinstance(val, bytes):
            val = unicode(val, 'utf-8')
        return (val.translate(subscript), val.translate(superscript))

    return inner_translate


## A closure for mapping decimal digits to their utf8 counterparts.
translate = __translate()

## A cache list with the first 15 primes to speed up factorization.
cachedPrimes = sieve(47)

##
# @brief Checks if a given integer is prime
#
# @param n given integer.
# @return True if n is a prime, and false otherwise.
#
def isPrime(n):
    global cachedPrimes
    if n <= 1:
        return False
    high = intsqrt(n)
    for x in cachedPrimes:
        if x > high:
            return True
        if n % x == 0:
            return False

    x = cachedPrimes[-1] + 2
    while x <= high:
        if n % x == 0:
            return False
        x += 2
    return True

##
# @brief Factorizes an integer or long number.
# In number theory, integer factorization is the decomposition of a composite number
# into a product of smaller integers.<br />
# If these factors are further restricted to prime numbers,
# the process is called prime factorization.
#
# Essentially, to factor a negative number, find all of its positive factors,
# then duplicate them and write a negative sign in front of the duplicates.
#
# Prime factorization or integer factorization of a number is breaking a number
# down into the set of prime numbers, which multiply together to result in the original number.<br />
# This is also known as prime decomposition.
#
# If we know that one of the prime factors of x is p,
# then all the prime factors of x are p plus the decomposition of x/p.
#
# Number x cannot have more than log x prime factors, because every prime factor is ≥ 2.
# Factorization by the above method works in O(log x) time complexity.
#
# Note that consecutive factors will be presented in non-decreasing order.
# The amount of memory needed for large numbers is prohibitive.
#
# <pre>
#  For x = 20,         F[20] = 2 → [2]
#      x = 20/2 = 10,  F[10] = 2 → [2,2]
#      x = 10/2 = 5,   F[5]  = 0 → [2,2,5]
# </pre>
#
# E.g.:
#  - factorize(12) → [2, 2, 3]
#  - factorize(-12) → [2, 2, 3, -1]
#
# @param n given integer.
# @return a list with the prime factors of n.
#
def factorize(n):
    primes = []
    index = 0
    candidate = cachedPrimes[index]
    if (n == 0 or n == 1):
        return [n]
    # long operations take too much time
    if (n < sys.maxsize):
        n = int(n)
    if isPrime(n):
        primes = [n]
        return primes
    while candidate < intsqrt(n) + 1:
        if n % candidate == 0:
            # All factors of "n", lesser than "candidate", have been found before.
            # Therefore, "candidate" cannot be composite.
            n = n // candidate
            primes += [candidate] + factorize(n)
            break
        index += 1
        if index < len(cachedPrimes):
            candidate = cachedPrimes[index]
        else:
            candidate += 2
    return primes


##
# Return a superscript for the given digits, such as:
# - 12 → ¹² (unicode), or
# - 12 → &lt;sup&gt;12&lt;/sup&gt; (HTML)
#
# If type is false, and no ::translate function is available, it is returned '^12'
#
# @param val given digits (a numeric string).
# @param type select the superscript method.
# @return a new superscript string.
#
def exponent(val, type=False):
    if type:
        return "<sup>{}</sup>".format(val)
    elif translate is not None:
        return translate(val)[1]
    else:
        return "^{}".format(val)

##
# @brief Condenses the list of prime factors of a number,
# so that each factor appears just once, in the format @f$prime^{nth_{power}}@f$.
#
# e.g., python factorize2.py 173248246132375748867198458668657948626531982421875 <br>
#  - ['3²⁴', '5¹⁴', '7³³', '13'] (unicode translation table)
#  - ['3<sup>24</sup>', '5<sup>14</sup>', '7<sup>33</sup>', '13'] (html)
#  - ['3^24', '5^14', '7^33', '13'] (None)
#
# @param lst a list with the prime factors of a number.
# @return a condensed list.
#
def condense(lst):
    prime, count, list = None, 0, []
    for x in lst:
        if x == prime:
            count += 1
        else:
            if prime:
                list += [str(prime)]
                if (count > 1):
                    list[-1] += exponent(str(count))
            prime, count = x, 1
    if count:
        list += [str(prime)]
    if (count > 1):
        list[-1] += exponent(str(count))
    return list

##
# Stringify a condensed list of factors.
#
# Each factor is separated by a ''&times;'' symbol:
#
#  345
#  - 3 × 5 × 23
#
#  173248246132375748867198458668657948626531982421875
#  - 3²⁴ × 5¹⁴ × 7³³ × 13
#
# @param lfactor list of factors.
# @return string of factors.
#
def toString(lfactor):
    return (" × ").join(map(charEncode, lfactor))

##
# @brief main function for testing.
#
# argv:
#   - argv[0]: path.
#   - argv[1]: integer to be factorized.
#
# Usage:
#   - _10_factorize2.py 345
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    if len(argv) < 2:
        n = input("An integer argument is needed: ")
        argv.append(n)

    if not argv[1].isdigit():
        print("A positive integer is expected.")
        return 1

    import time
    t0 = time.time()
    print(toString(condense(factorize(eval(argv[1])))))
    print("\nRun time: %gs" % (time.time() - t0))

    sys.argv[1] = input("\nEnter next number to be factorized: ")
    main()

    return 0


try:
    if __name__ == '__main__':
        sys.exit(main())
except (KeyboardInterrupt, EOFError):   # used Ctrl-c to abort the program
    print("Bye, bye... See you later alligator.")
except OSError as msg:
    print(msg)
