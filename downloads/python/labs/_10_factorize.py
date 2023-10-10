#!/usr/bin/env python
# coding: UTF-8
##  @package _10_factorize
#
#   A simple factorization algorithm.
#
#   1. If n is prime, this is the factorization, so stop here. <br>
#   2. If n is composite, divide n by the first prime p1.  <br>
#   3. If it divides cleanly, recurse with the value n/p1.  <br>
#   4. Add p1 to the list of factors obtained for n/p1 to get a factorization for n.  <br>
#   5. If it does not divide cleanly, divide n by the next prime p2, and so on.
#   <p>
#   Note that we need to test only primes @f$\pi@f$ such that @f$\pi \le \sqrt(n)@f$.
#
#   @author Paulo Roma
#   @since 27/12/2008
#   @see https://mathworld.wolfram.com/PrimeFactorizationAlgorithms.html
#   @see https://academickids.com/encyclopedia/index.php/Prime_factorization_algorithm

import sys
from math import sqrt
from progress_bar import progress_bar

# Fix Python 2.x.
try:
    input = raw_input
except NameError:
    pass

##
#   @brief Factorizes an integer or long number.
#
#   Recursive version.
#
#   @param n given integer.
#   @return a list with the prime factors of n.
#
def factorize_rec(n):
    primes = []
    candidate = 2

    # long operations take too much time
    if (n < sys.maxsize):
        n = int(n)

    max_value = int(sqrt(n))
    while candidate < max_value + 1:
        if n % candidate == 0:
            primes = primes + [candidate] + factorize_rec(n // candidate)
            return primes
        if (candidate == 2):  # 2 is the only even prime
            candidate = 3
        else:
            candidate += 2

    # if we got here, n is prime
    primes = [n]
    return primes

##
#   @brief Factorizes an integer or long number.
#
#   Non recursive version.
#
#   @param n given integer.
#   @return a list with the prime factors of n.
#
def factorize(n):
    primes = []
    candidate = 2
    max_value = int(sqrt(n))
    while candidate < max_value + 1:
        while n % candidate == 0:
            primes.append(candidate)
            n //= candidate  # integer division (floor)
            max_value = int(sqrt(n))
        if (candidate == 2):  # 2 is the only even prime
            candidate = 3
        else:
            candidate += 2

    # there can be only one prime factor greater than "int(sqrt(n))"
    if (n > 1):
        primes.append(n)

    return primes

##
#   @brief Condenses the list of prime factors of a number,
#   so that each factor appears just once, in the format @f$prime^{nth_{power}}@f$.
#
#   e.g., python factorize2.py 173248246132375748867198458668657948626531982421875 <br>
#   ['3^24', '5^14', '7^33', '13']
#
#   @param L a list with the prime factors of a number.
#   @return a condensed list.
#
def condense(L):
    count, oldp, list = None, None, []
    for p in L:
        if (oldp != p):
            count = L.count(p)
            list.append(str(p))
            if (count > 1):
                list[-1] += '^' + str(count)
            oldp = p
    return list

##
#   main function for testing.
#
#   @param argv sys.argv
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
    print(condense(factorize(eval(argv[1]))))
    print("Run time: %gs" % (time.time() - t0))

    sys.argv[1] = input("\nEnter next number to be factorized: ")
    main()

    return 0


if __name__ == "__main__":
    sys.exit(main())
