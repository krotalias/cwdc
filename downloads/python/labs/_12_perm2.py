#!/usr/bin/env python
#
## @package _12_perm2
#
#   Full permutation.
#
#   @author Paulo Roma
#   @since 18/02/2015
#   @see https://helloacm.com/a-recursive-full-permutation-in-python/

## The full permutation of list "n" can be solved by picking any element,
#  placing it in the first, and recursively solving the smaller problem.
#
#  @param n list to have its elements permuted.
#  @param i first element index.
#
def perm(n, i):
    if i == len(n) - 1:
        print(n)
    else:
        for j in range(i, len(n)):
            n[i], n[j] = n[j], n[i]
            print(i, j, n)
            perm(n, i + 1)
            n[i], n[j] = n[j], n[i]  # swap back, for the next loop
            print(i, j, n)


if __name__ == '__main__':
    perm(["a", "b", "c"], 0)
