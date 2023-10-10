#!/usr/bin/env python
# coding: UTF-8
#
## @package _01d_dec2bin
#
#   Converting between different numerical bases.
#
#   In a positional number system, the value of each digit is determined by which place
#   it appears in the full number. The lowest place value is the rightmost position,
#   and each successive position to the left has a higher place value.
#
#   For example, the value of the binary number 10011 is determined by
#   computing the place value of each of the digits of the number:
#   <PRE>
#            1          0          0          1          1       the binary number
#            2⁴         2³         2²         2¹         2⁰      place values
#         (1 * 2⁴) + (0 * 2³) + (0 * 2²) + (1 * 2¹) + (1 * 2⁰)
#       =    16    +    0     +    0     +    2     +    1
#       =    19
#   </PRE>
#
#   @author Paulo Roma
#   @since 11/02/2009
#   @see http://en.wikipedia.org/wiki/Binary_numeral_system
#

import sys

# Fix Python 2.x.
try:
    input = raw_input
except NameError:
    pass

##
#   Converts denary integer to a binary string.
#
#   @param num an integer.
#   @return binary string.
#
def Denary2Binary(num):
    if (num == 0):
        return '0'
    if num < 0:
        n = -num
    else:
        n = num
    bStr = ''
    while n != 0:
        bStr = str(n % 2) + bStr
        n >>= 1      # n /= 2
    if (num < 0):
        bStr = '-' + bStr
    return bStr


##
#   Converts a binary string to a denary integer.
#
#   @param bStr a binary string.
#   @return int(bStr,2).
#
def Binary2Denary(bStr):
    n = 0
    d = 1
    for l in bStr[::-1]:
        if (l == '1'):
            n += d
        elif (l == '-'):
            n = -n
            break
        elif (l != '0'):
            raise ValueError("Value must be binary")
        d <<= 1     # d *= 2
    return n

##
#   Converts a denary integer to hexadecimal.
#
#   @param n an integer.
#   @return hex(n).
#
def dec2hex(n):
    return "%X" % n  # hex(n)


##
#   @brief Converts a string or number to a plain integer.
#
#   The radix parameter gives the base for the conversion
#   (which is 10 by default) and may be any integer in
#   the range [2, 36], or zero.
#   If radix is zero, the proper radix is determined based on
#   the contents of string;
#   the interpretation is the same as for integer literals.
#
#   @param s
#   @return int(s, 16).
#
def hex2dec(s):
    return int(s, 16)

##
#   Converts an integer to a binary string representation with an specified number of bits.
#
#   @param n an integer.
#   @param count number of digits.
#   @return the binary of integer n, using count number of bits.
#
#
def int2bin(n, count=24):
    return "".join([str((n >> y) & 1) for y in range(count - 1, -1, -1)])

def main():
    a = input("Entre com um número decimal: ")
    b = input("Entre com um número binário: ")
    c = input("Entre com um número hexadecimal: ")
    if a[0] == '-':
        if not a[1:].isdigit():
            raise ValueError("Value must be an integer")
    else:
        if not a.isdigit():
            raise ValueError("Value must be an integer")

    print(a + " = %s em binário" % Denary2Binary(int(a)))
    print(b + " = %d em decimal\n" % Binary2Denary(str(b)))
    print(a + " = %s em hexadecimal" % dec2hex(int(a)))
    print(c + " = %d em decimal\n" % hex2dec(str(c)))

    #
    #  Convert a binary string back to decimal
    #
    print("int (Denary2Binary(%s), 2) = %d" %
          (a, int(Denary2Binary(int(a)), 2)))  # a

    #
    # this version formats the binary, using 12 digits
    #
    print("int2bin (255, 12) = %s" % int2bin(255, 12))  # 000011111111

    #
    # test it
    #
    print('int("000011111111", 2) = %d' % int("000011111111", 2))  # 255

    print('Binary2Denary ( "11110000111" ) = %d' %
          Binary2Denary("11110000111"))  # 1927


if __name__ == '__main__':
    try:
        sys.exit(main())
    except ValueError as err:
        print(err)
