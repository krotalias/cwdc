#!/usr/bin/env python
#
## @package _03a_roman2int_dict
#
#   Converting roman numerals to decimal.
#
#   @author Paulo Roma
#   @since 12/05/2010

import sys

##
#   Converts a roman numeral to its decimal representation.
#
#   @param roman a roman numeral.
#   @return the roman decimal representation.
#
def roman2int(roman):
    """A roman to int converter."""

    # create a dictionary for mapping roman symbols to decimal
    d = {"M": 1000,
         "D": 500,
         "C": 100,
         "L": 50,
         "X": 10,
         "V": 5,
         "I": 1}

    total = pptr = 0
    m = False
    for c in roman[::-1]:       # backward
        if (c in "MDCLXVImdclxvi()"):
            if c == ')':
                m = True
                continue
            elif c == '(':
                m = False
                continue
            else:
                cptr = d[c.upper()]
                if m:
                    cptr *= 1000
            if cptr < pptr:
                total -= cptr   # IV = 5 - 1, IX = 10 - 1, XL = 50 - 10
            else:
                total += cptr
            pptr = cptr
        else:
            raise ValueError("Invalid character")

    return total

def main():
    try:
        try:
            print(roman2int(raw_input("Enter roman number: ")))
        except NameError:
            print(roman2int(input("Enter roman number: ")))
    except ValueError:
        main()


if __name__ == "__main__":
    sys.exit(main())
