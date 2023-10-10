#!/usr/bin/env python
# coding: UTF-8
#
## @package _01c_str2int
#  The equivalent of the function atoi.
#
#  @author Paulo Roma
#  @since 10/12/2006
#

import sys

##
#    Converts a string with characters from '0' to '9' to an integer.
#
#    @param str given string.
#    @return the decimal representation of str.
#
def str2int(str):
    n = 0
    power = 1
    for c in str[::-1]:
        # only numerical digits
        if c >= '0' and c <= '9':
            location = int(c)          # ord(c)-ord('0')
            n += location * power
            power *= 10
    # a negative number
    if str[0] == '-':
        n = -n
    return n

def main():
    try:
        print(str2int(raw_input("Entre com um número: ")))
    except NameError:
        print(str2int(input("Entre com um número: ")))


if __name__ == "__main__":
    sys.exit(main())
