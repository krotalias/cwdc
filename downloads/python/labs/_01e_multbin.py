#!/usr/bin/env python
# coding: UTF-8
#
## @package _01e_multbin
#
#   Multiplication using shifts.
#
#   Thinking binary:
#   <PRE>
#       1011 X         11
#       1101           13
#       ----     --------
#       1011 +   1*1*1011  1011 << 0
#      00000     0*2*1011  0000 << 1
#     101100     1*4*1011  1011 << 2
#    1011000     1*8*1011  1011 << 3
#    -------     --------
#   10001111          143
#   </PRE>
#
#   @author Paulo Roma
#   @since 15/10/2011
#

from builtins import input

import sys

##
#
#   Multiplies two integers by using only the + operation.
#
#   @param a first factor.
#   @param b second factor.
#   @return a*b
#
def Product(a, b):
    p = 0
    while (b != 0):
        if (b & 1):  # get the first (rightmost) bit of 'b'
            p += a
        # shift 'a' 1 bit to the left (inserts a 0 bit on the right.)
        a <<= 1
        b >>= 1      # shift 'b' 1 bit to the right (drops the rightmost bit.)
    return p

def Product2(a, b, base=10):
    """Equivalent version, but very inneficient."""
    p = 0
    while (b != 0):
        d = b % base  # rightmost bit of b
        if (d):
            p += d * a
        a *= base     # shift to the left
        b //= base    # shift to the right
    return p

def main(argv=None):
    if argv is None:
        argv = sys.argv

    a = b = 0
    try:
        if len(argv) > 2:
            a = argv[1]
            b = argv[2]
        else:
            a, b = str(input('Type two positive integers: ')).split()
        a = int(a)
        b = int(b)
    except ValueError:
        main("")
    else:
        print("{} * {} = {}".format(a, b, Product(a, b)))
        print("{} * {} = {}".format(a, b, Product2(a, b)))


if __name__ == "__main__":
    sys.exit(main())
