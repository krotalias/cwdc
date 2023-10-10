#!/usr/bin/env python
#
## @package _03a_roman2int
#
#   Converting roman numerals to decimal.
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
#   @since 12/05/2010
#   @see http://en.wikipedia.org/wiki/Roman_numerals
#   @see http://www.onlineuniversity.net/resources/roman-numeral-date-conversion-resource/

import sys

# Fix Python 2.x.
try:
    input = raw_input
except NameError:
    pass

##
#   Converts a roman numeral to its decimal representation.
#
#   @param roman a roman numeral.
#   @return the roman decimal representation.
#
def roman2int(roman):
    """A roman to int converter."""

    l = [0] * ord('Z')

    # A list must be addressed by positive integers.
    # The ord function maps a character to its
    # corresponding integer in the ASCII table.
    # Since we reserved ord("Z") = 90,
    # positions in the list, we are fine.

    l[ord("M")] = 1000
    l[ord("D")] = 500
    l[ord("C")] = 100
    l[ord("L")] = 50
    l[ord("X")] = 10
    l[ord("V")] = 5
    l[ord("I")] = 1

    total = pptr = 0
    m = False
    for c in roman[::-1].upper():
        if (c in "MDCLXVI()"):
            if c == ")":
                m = True
            elif c == "(":
                m = False
            else:
                cptr = l[ord(c)]
                if m:
                    cptr *= 1000
                if cptr < pptr:
                    total -= cptr    # IV = 5 - 1, IX = 10 - 1, XL = 50 - 10
                else:
                    total += cptr
                pptr = cptr
        else:
            raise ValueError("Invalid character")
    return total

def main(argv=None):
    if argv is None:
        argv = sys.argv
    try:
        if len(argv) > 1:
            s = argv[1]
        else:
            s = input("Enter roman number: ")
        print("Answer: {}".format(roman2int(s)))
    except ValueError as msg:
        print("{} --> Invalid data: {}".format(argv[0], msg))


if __name__ == "__main__":
    sys.exit(main())
