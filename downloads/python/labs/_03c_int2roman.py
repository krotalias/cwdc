#!/usr/bin/env python
#
## @package _03c_int2roman
#   Converting decimal numbers to roman numerals.
#
#   Roman numerals, the numeric system in ancient Rome, uses combinations of letters
#   from the Latin alphabet to signify values. The numbers 1 to 10, 50, 100, 500 e 1000
#   can be expressed in Roman numerals as follows:
#     - I, II, III, IV, V, VI, VII, VIII, IX, X, L, C, D, and M.
#
#   In the Middle Ages, a horizontal line was used above a particular numeral,
#   or parentheses placed around it, to represent one thousand times that numeral.
#     - @f$\bar I@f$ or (I) for one thousand.
#     - @f$\bar V@f$ or (V) for five thousand.
#
#   @author Paulo Roma
#   @since 25/12/2008
#   @see http://en.wikipedia.org/wiki/Roman_numerals
#   @see http://www.onlineuniversity.net/resources/roman-numeral-date-conversion-resource/
#

import sys

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
        symbols = \
            [["", "I",   "II",   "III",   "IV",   "V",   "VI",   "VII",   "VIII",   "IX"],    # units    
             ["", "X",   "XX",   "XXX",   "XL",   "L",   "LX",   "LXX",   "LXXX",   "XC"],    # tens  
             ["", "C",   "CC",   "CCC",   "CD",   "D",   "DC",   "DCC",   "DCCC",   "CM"],    # hundreds
             ["", "M",   "MM",   "MMM",   "(IV)", "(V)", "(VI)", "(VII)", "(VIII)", "(IX)"],  # thousands
             ["", "(X)", "(XX)", "(XXX)", "(XL)", "(L)", "(LX)", "(LXX)", "(LXXX)", "(XC)"],  # ten thousands
             ["", "(C)", "(CC)", "(CCC)", "(CD)", "(D)", "(DC)", "(DCC)", "(DCCC)", "(CM)"],  # hundred thousands
             ["", "(M)", "(MM)", "(MMM)", "",     "",    "",     "",      "",       ""]]      # millions
        # autopep8: on

        # Convert num to string.
        cnum = str(num)
        # Find out how many digits are in the input number (magnitude).
        strlen = len(cnum) - 1
        # Empty string.
        roman = ""

        # The loop is executed at most 7 times, and
        # it uses no division or multiplication.
        # Loop forward (0,1,...,len-1).
        for c in cnum:
            # dig between [0,9]. Note that int(c) == ord(c) - ord("0")
            dig = int(c)
            # Loop backward (len-1,len-2,len-3,...,0).
            roman += symbols[strlen][dig]
            strlen -= 1

    return roman.replace(')(', '')

def main(argv=None):
    if argv is None:
        argv = sys.argv
    try:
        if len(argv) > 1:
            n = int(argv[1])
        else:
            n = int(input("Enter number: "))
        print("Answer = {}".format(int2roman(n)))
    except (NameError, SyntaxError, ValueError) as e:
        print("{} --> Invalid number: {}".format(argv[0], e))


if __name__ == "__main__":
    sys.exit(main())
