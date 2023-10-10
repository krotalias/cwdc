#!/usr/bin/env python
#
## @package _02c_int2roman
#   Converting decimal numbers to roman numerals.
#
#   @author Paulo Roma
#   @see http://en.wikipedia.org/wiki/Roman_numerals
#

##
#   Converts an integer number to its roman numeral representation.
#
#   This is a naive implementation, which uses four whiles and nine ifs.
#
#   @param num given number.
#   @return a string with num represented as a roman numeral.
#
def int2roman(num):
    """An int to roman converter."""

    romano = ""                     # Empty string
    if (num >= 4000) or (num < 1):
        romano = "N/A"
    else:
        while num >= 1000:
            romano = romano + "M"
            num = num - 1000

        if num >= 900:
            romano = romano + "CM"  # Concatenate letters to the right side
            num = num - 900

        if num >= 500:
            romano = romano + "D"
            num = num - 500

        if num >= 400:
            romano = romano + "CD"
            num = num - 400

        while num >= 100:
            romano = romano + "C"
            num = num - 100

        if num >= 90:
            romano = romano + "XC"
            num = num - 90

        if num >= 50:
            romano = romano + "L"
            num = num - 50

        if num >= 40:
            romano = romano + "XL"
            num = num - 40

        while num >= 10:
            romano = romano + "X"
            num = num - 10

        if num >= 9:
            romano = romano + "IX"
            num = num - 9

        if num >= 5:
            romano = romano + "V"
            num = num - 5

        if num >= 4:
            romano = romano + "IV"
            num = num - 4

        while num >= 1:
            romano = romano + "I"
            num = num - 1

    return romano

def main():
    n = int(input("Enter number: "))
    print("Answer = " + int2roman(n))


if __name__ == "__main__":
    main()
