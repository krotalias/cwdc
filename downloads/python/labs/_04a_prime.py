#!/usr/bin/env python
# coding: UTF-8
#
## @package _04a_prime
#
#   Primality testing.
#
#   A prime number (or a prime) is a natural number
#   which has exactly two distinct natural number divisors:
#   1 and itself.
#
#   Only divisors up to @f$\lfloor \sqrt{n} \rfloor@f$ (where @f$\lfloor x \rfloor@f$is the floor function) need to be tested.
#   This is true since if all integers less than this had been tried, then
#   @f$\frac{n}{(\lfloor\sqrt{n}\rfloor+1)} < \sqrt{n}.@f$
#   In other words, all possible factors have had their cofactors already tested.
#   Given a factor a of a number n=ab, the cofactor of a is b=n/a.
#
#   Trial division, used here, is hopeless for finding any but small prime numbers.
#   Mathematica versions 2.2 and later have implemented the multiple
#   Rabin-Miller test combined with a Lucas pseudoprime test.
#   @see https://literateprograms.org/miller-rabin_primality_test__python_.html
#
#   Assuming that @f$2^{61}-1@f$ is prime (2305843009213693951),
#   the algorithm will do about @f$2^{60}@f$ divisions
#   (if not using the @f$\lfloor\sqrt{n}\rfloor@f$ limit).
#   Supposing that the computer can perform @f$10^{9}@f$ divisions per sec
#   (1 gigaflop), then this will take approximately 36 years:
#   @f$\frac{1152921504606846976}{(1000000000*31536000)}=36.558901085@f$
#   - Using the @f$\lfloor\sqrt{n}\rfloor@f$ limit, this falls to
#   @f$\frac{1518500249}{2*1000000000} = 0.759s@f$
#   - On a Quadcore Q6600 (64 bits), this python program took 100s.
#   - The same program written in C took 17s.
#   Therefore, the C program is almost 6 times faster.
#   - On a Pentium 4, 2.60GHz (32 bits), this python program took
#   1295.3035109 s (21.5 min).
#   - On a Eightcore i7-2600 CPU @ 3.40GHz (64 bits), this python program took 45s.
#   - The same program written in C took 6.5s.
#
#   There are several prizes for those who discover large
#   prime numbers, such as a $250,000 to the first individual or group
#   who discovers a prime number with at least 1,000,000,000 decimal digits.
#
#   @author Paulo Roma
#   @since 28/12/2008
#   @see http://primes.utm.edu/howmany.shtml
#   @see http://en.wikipedia.org/wiki/FLOPS
#   @see http://www.intel.com/support/processors/sb/CS-023143.htm#1
#   @see http://www.easycalculation.com/prime-number-chart.php
#   @see http://www.eff.org/awards/coop

import sys
from math import sqrt
sys.path.append("./")             # path for searching modules
from _04b_intsqrt import intsqrt

try:
    xrange
except NameError:
    xrange = range

##
#   Tests whether an integer is prime.
#
#   @param n given integer.
#   @return 0 if n is prime, or one of its factors, otherwise.
#
def isPrime(n):
    if (n == 1):
        return 1                  # 1 is not prime
    elif n < 4:                   # 2 and 3 are primes
        return 0
    elif n % 2 == 0:
        return 2                  # composite
    else:
        limit = intsqrt(n)        # trunc to the lowest integer
        for i in xrange(3, limit + 1, 2):
            if n % i == 0:
                return i          # composite
        return 0                  # prime

##
#   Using list comprehensions creates a list with all divisors of 'n'.
#   If the list is empty, then 'n' is prime (very inefficient).
#   Ex. n = 100 -> return not [2, 4, 5, 10]
#   @see http://www.secnetix.de/olli/Python/list_comprehensions.hawk
#
def isPrime2(n):
    return not [x for x in range(2, int(sqrt(n)) + 1) if n % x == 0]

def main(argv=None):
    if argv is None:
        argv = sys.argv

    if len(argv) < 2:
        num = int(input("Please, enter a positive integer: "))
    else:
        num = int(argv[1])

    import time
    t0 = time.time()
    res = isPrime(num)
    print("Run time: %es" % (time.time() - t0))

    if (res):
        print("%s is Composite because it is divisible by %s" % (num, res))
    else:
        print("%s is Prime because it is only divisible by 1 and itself" % num)


if __name__ == "__main__":
    sys.exit(main())
