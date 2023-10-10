#!/usr/bin/env python
#
## @package _03b_int2roman
#
#   Converting decimal numbers to roman numerals.
#
#   @author Paulo Roma
#   @since 25/12/2008
#

##
#   Converts an integer number to its roman numeral representation.
#
#   @param num given number.
#   @return a string with num represented as a roman numeral.
#
def int2roman(num):
    """An int to roman converter."""

    if (num >= 4000000) or (num < 1):
        roman = "N/A"
    else:
        # autopep8: off
        symbols  = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]
        decimals = [1000, 900, 500,  400, 100,  90,  50,   40,  10,    9,   5,    4,   1]
        # autopep8: on

        ptr = 0
        roman = ""                          # Empty string

        if (num >= 4000):                   # The part of the number above 4000
            excess = num // 1000            # should be between parentheses.
            if (excess % 10 < 4):           # What is less than 4000 should be
                excess = excess // 10 * 10  # outside the parentheses.
            roman = "(" + int2roman(excess) + ")"
            num -= excess * 1000

        while num > 0:  # Check to see if "num" still has any value left in it.
            # See how many of the currently selected value can
            # fit in the remaining input.
            temp = num // decimals[ptr]

            # Append a number of Roman characters depending
            # on the value of "temp".
            roman += symbols[ptr] * temp

            # Subtract the value of the characters that were
            # appended to output from the input.
            num -= temp * decimals[ptr]
            # Move the pointer to the next cell of the arrays.
            ptr += 1
    return roman

def main():
    print("Answer = " + int2roman(int(input("Enter number: "))))


if __name__ == "__main__":
    main()
