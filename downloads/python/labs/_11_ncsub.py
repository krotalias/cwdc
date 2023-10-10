#!/usr/bin/env python
#
## @package _11_ncsub
#
#   Non-continuous subsequences.
#
#   @author Paulo Roma
#   @since 10/07/2010
#   @see http://www.rosettacode.org/wiki/Non_Continuous_Subsequences
#   @see http://www.research.att.com/~njas/sequences/A002662

import sys

##
#   Calculates the k-combination of an integer.
#
#   @param n a given integer.
#   @param k an integer lesser than n.
#   @return @f$\frac{n!}{k!(n-k)!} = {n \choose k}@f$
#
def C(n, k):
    result = 1
    for d in range(1, k + 1):
        result *= n
        n -= 1
        result //= d
    return result


## The number of k-combinations.
def nsubs(n): return sum(C(n, k) for k in range(3, n + 1))

##
#   @brief Enumerates all non-continuous subsequences
#   for a given sequence.
#   <p>
#   A subsequence contains some subset of the elements of this sequence,
#   in the same order. A continuous subsequence is one in which no
#   elements are missing between the first and last elements of the
#   subsequence.
#   <p>
#   The idea behind this is to loop over the possible lengths of subsequence,
#   finding all subsequences, then discarding those which are continuous.
#   <p>
#   Non Recursive version.
#
#   @param seq a list of integers.
#   @return
#
def ncsub(seq):
    n = len(seq)
    result = [None] * nsubs(n)
    pos = 0
    for i in range(1, 2 ** n):
        S = []
        nc = False
        for j in range(n + 1):
            k = i >> j               # k = i/2**j
            if k == 0:
                if nc:
                    result[pos] = S
                    pos += 1
                break
            elif k % 2:              # odd (impar)
                S.append(seq[j])
            elif S:                  # even (par)
                nc = True
    return result

def main(argv=None):
    if argv is None:
        argv = sys.argv

    if len(argv) < 2:
        n = str(input("An integer argument is needed: "))
        argv.append(n)

    if not argv[1].isdigit():
        print("A positive integer is expected.")
        return 1

    n = int(argv[1])

    print(ncsub(range(1, n + 1)))

    return 0


if __name__ == "__main__":
    sys.exit(main())
