#!/usr/bin/env python
# coding: UTF-8
#
## @package _04d_sieve
#
#   The Sieve of Eratosthenes (276-194 BC).
#
#   Eratosthenes was invited by the Pharaoh Ptolemy III of Egypt, to be the chief librarian at
#   the library of Alexandria, the most important in the ancient times. <br>
#   He hold this position from 236 BC to his death.
#
#   The sieve is a simple, ancient algorithm for finding all prime numbers up to any given limit. <br>
#   The algorithm iteratively marks as composite (i.e. not prime) the multiples of each prime, starting at 2,
#   using only additions.
#
#   @author Paulo Roma
#   @since 22/09/2009
#   @see http://en.wikipedia.org/wiki/Sieve_of_Eratosthenes
#   @see https://www.khanacademy.org/computing/computer-science/cryptography/comp-number-theory/v/sieve-of-eratosthenes-prime-adventure-part-4
#   @see <a href="/python/videos/crivo.mp4">Animation</a>

from __future__ import print_function

import sys

try:
    from bitarray import *
except (ImportError):
    pass  # bitarray is needed in Python2 only

from deeper import deep_getsizeof

## Maximum integer value for n.
MAXN = 32000000000

## Value for switching to using sieve2.
MINN = 1000

## Debugging state.
debug__ = True

## Set debugging on or off.
#
#  @param stat debugging status.
#
def setDebug(stat):
    global debug__
    debug__ = stat

##
#   Returns a list with all primes up to n.
#
#   We're iterating through n numbers. Whenever we reach a prime p,
#   we start iterating through the multiples of p up to n.
#   For each prime, this takes n/p operations.
#
#   @f$ n\ \sum_{p\ prime\ \leq n} {{1} \over {p}} = n\ (ln ({ln {(n)}}) + M)@f$
#
#   So we end up with the prime harmonic series up to n, which actually evaluates out to log(log(n)).
#   The total complexity is then: O(n log(log(n)).
#
#   @param n a given positive integer.
#   @return a list holding the primes up to n.
#   @see https://en.wikipedia.org/wiki/Divergence_of_the_sum_of_the_reciprocals_of_the_primes
#
def sieve(n):
    if (n < 2 or n > MAXN):
        return []

    if n > MINN:
        return sieve2(n)

    l = list(range(n + 1))
    l[0], l[1] = None, None
    for i in l:  # if fact, this loop ends when i == int(sqrt(n)) - see below
        if i is not None:
            # it's enough to eliminate multiples starting at
            # the square of the number, because all factors
            # until (i-1) have been already tested.
            #
            j = i * i
            if (j > n):
                break  # or i > sqrt(n)
            # for k in range(j, n+1, i)):
            #     l[k] = None
            while j <= n:
                l[j] = None
                j += i
    return list(filter(None, l))

## Memory efficient version, using bitarray.
#  For @f$n = 1 \times 10^9@f$ (one billion). <br>
#  Intel(R) Core(TM) i7-3770 CPU @ 3.40GHz
# <pre>
#  Number of primes: 50847534
#  Number of bytes: 112
#  Total Number of bytes: 160
#  Run time: 0h:6m:42s:884ms
#
#  Factors of  1000000000 is: [2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5]
#  Number of bytes: 8000000080
#
#  Total Number of bytes: 8000081728
#  Run time: 0h:4m:5s:482m
# </pre>
#
#  @param n a given positive integer.
#  @see https://pypi.org/project/bitarray/
#
def sieve2(n):
    if (n < 2 or n > MAXN):
        return []

    l = (n + 1) * bitarray('1')
    l[0], l[1] = False, False
    l[4:n + 1:2] = False  # even numbers are composite
    i = 3
    while i * i <= n:  # if fact, this loop ends when i > int(sqrt(n))
        if l[i]:
            # it's enough to eliminate multiples starting at
            # the square of the number, because all factors
            # until (i-1) have been already tested.
            #
            j = i * i
            # for k in range(j, n+1, i):
            #     l[k] = False
            while j <= n:
                l[j] = False
                j += i
        i += 2
    return l

## Prepare an array for factorization.
#  For every number up to n, we will remember
#  the smallest prime that divides this number.
#
#  For n = 20, return: <br>
# <pre>
#  [0, 0, 0, 0, 2, 0, 2, 0, 2, 3,  2,  0,  2,  0,  2,  3,  2,  0,  2,  0,  2]
#   0  1  2  3  4  5  6  7  8  9  10  11  12  13  14  15  16  17  18  19  20
# </pre>
#
#  @param n number to factorize.
#  @return array F.
#
def arrayF(n):
    if (n < 3 or n > MAXN):
        return [0] * 3

    F = [0] * (n + 1)
    i = 2
    while i * i <= n:
        if F[i] == 0:
            k = i * i
            while k <= n:
                if F[k] == 0:
                    F[k] = i
                k += i
        i += 1
    return F

## Return the factors of x, given an array with the smallest number
#  that divides each integer (0, if the integer is prime) up to x.
#
#  If we know that one of the prime factors of x is p,
#  then all the prime factors of x are p plus the decomposition of x/p.
#
#  Number x cannot have more than log x prime factors, because every prime factor is >= 2.
#  Factorization by the above method works in O(log x) time complexity.
#
#  Note that consecutive factors will be presented in non-decreasing order.
#  The amount of memory needed for large numbers is prohibitive.
#
# <pre>
#  For x = 20,         F[20] = 2 -> [2]
#      x = 20/2 = 10,  F[10] = 2 -> [2,2]
#      x = 10/2 = 5,   F[5]  = 0 -> [2,2,5]
# </pre>
#
#  @param x number to factorize.
#  @param F factor array.
#  @see https://codility.com/media/train/9-Sieve.pdf
#  @see _10_factorize
#  @see _10_factorize2
#
def factorization(x, F):
    primeFactors = []
    if len(F) < x:
        return primeFactors
    while F[x] > 0:
        primeFactors += [F[x]]
        x //= F[x]
    primeFactors += [x]
    return primeFactors

## Print the primes corresponding to a given array.
#
#  @param array Array of prime numbers.
#  @return number of elements printed.
#
def printArray(array):
    if not isinstance(array, bitarray):
        if debug__:
            print(array)
        return len(array)

    if not debug__:
        print("debugging is off")
        return array.count()

    t = 0
    print("(", end='')
    for i, b in enumerate(array):
        if b:
            print(i, end=', ')
            t += 1
    print("\b\b)")
    return t

## Return the primes corresponding to a given array.
#
#  @param array Array of prime numbers.
#  @return list of prime numbers.
#
def getArray(array):
    if not isinstance(array, bitarray):
        return array

    return [i for i, b in enumerate(array) if b]

## Return the time in the format: hr:min:sec:msec.
#
#  @param dsec number of seconds as a double.
#  @return a tuple (h, m, s, ms).
#
def getTime(dsec):
    sec = int(dsec)
    return (sec // 3600, (sec % 3600) // 60, sec % 60, (dsec - sec) * 1000)

## Main program for testing.
#
#  @see https://code.tutsplus.com/tutorials/understand-how-much-memory-your-python-objects-use\--cms-25609
#
def main(argv=None):

    if argv is None:
        argv = sys.argv

    if len(argv) < 2:
        num = str(input("Please, enter a positive integer: "))
    else:
        num = argv[1]

    if not num.isdigit():
        exit(0)
    num = int(num)

    import time
    t0 = time.time()
    res = sieve(num)
    t1 = time.time()

    print("The list of primes up to %d is:" % num)
    #print ( "The list of primes up to {i} is:".format(i=num) )
    #print(getArray(res))
    if num > 5 * MINN:
        setDebug(False)
    print("Number of primes: %d" % printArray(res))
    print("Number of bytes: %d " % sys.getsizeof(res))
    print("Total Number of bytes: %d " % deep_getsizeof(res, set()))
    print("Run time: %dh:%dm:%ds:%dms\n" % getTime(t1 - t0))

    t0 = time.time()
    F = arrayF(num)
    res = factorization(num, F)
    t1 = time.time()
    print("\nFactors of % d is: %s" % (num, res))
    print("Number of bytes: %d " % sys.getsizeof(F))
    print("Total Number of bytes: %d " % deep_getsizeof(F, set()))
    print("Run Time: %dh:%dm:%ds:%dms\n" % getTime(t1 - t0))


if __name__ == "__main__":
    sys.exit(main())
