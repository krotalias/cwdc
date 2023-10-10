#!/usr/bin/env python
# coding: UTF-8
#
## @package func3
#  Calculating the complexity of three functions with two nested loops each.
#
#  6 iterations by default.
#

import sys

def main(argv=None):
    """Main Program."""
    if argv is None:
        argv = sys.argv

    func = 0
    func2 = 0
    func3 = 0
    func4 = 0
    n = 6
    if len(argv) > 1:
        n = int(argv[1])
    for i in range(0, n):
        for j in range(0, n):
            if (i < j):
                func += 1
            if ((i + j) < n):
                func2 += 1

    for i in range(0, n):
        for j in range(i + 1, n):
            func4 += 1

    for i in range(0, n + 1):
        for j in range(i + 1, n + 1):
            func3 += 1

    n2 = n * n
    # func2 is the sum of a P.A. : 1 + 2 + 3 + ... + n
    # n/2 (2 + (n-1)) = (n2 + n) / 2
    #
    # func2 = func3 = C(n+1,2) = n(n+1)/2
    #
    # func = func4 = C(n,2) = n(n-1)/2
    print(func, func4, func2, func3)
    print((n2 - n) / 2, (n2 + n) / 2)


if __name__ == '__main__':
    main()
