#!/usr/bin/env python
# coding: UTF-8
#
## @package func
#  Calculating the complexity of three nested loops with initial counter
#  being the previous loop counter plus one.
#
#  6 iterations by default.
#

import sys

def main(argv=None):
    """Main Program."""
    if argv is None:
        argv = sys.argv

    func2 = 0
    func3 = 0
    n = 6
    if len(argv) > 1:
        n = int(argv[1])
    for i in range(0, n):
        for j in range(i + 1, n):
            func2 += 1
            for k in range(j + 1, n):
                func3 += 1

    n2 = n * n
    n3 = n2 * n
    print(func2, func3)
    # func2 is the sum of a P.A. : 1 + 2 + 3 + ... + n-1
    # func3 = C(n,3) = n(n-1)(n-1)/6 = (n3-3*n2+2*n)/6
    print((n2 - n) / 2, (n3 - 3 * n2 + 2 * n) / 6)


if __name__ == '__main__':
    main()
