#!/usr/bin/env python
#
## @package _03b_int2roman_dict
#
#   Converting decimal numbers to roman numerals.
#
#   @author Paulo Roma
#   @since 15/05/2010
#

##
#   Converts an integer number to its roman numeral representation.
#
#   @param number given number.
#   @return a string with num represented as a roman numeral.
#
def int2roman(number):
    if (number >= 4000) or (number < 1):
        roman = "N/A"
    else:
        # autopep8: off
        numerals = {1:  "I",  4: "IV",   5: "V",   9: "IX",  10: "X",  40: "XL",
                    50: "L", 90: "XC", 100: "C", 400: "CD", 500: "D", 900: "CM", 1000: "M"}
        # autopep8: on

        # this is the output of the sorted call
        #     [ (1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'), (100, 'C'),
        #       (90, 'XC'),  (50, 'L'),   (40, 'XL'), (10, 'X'),   (9, 'IX'),
        #       (5, 'V'),    (4, 'IV'),   (1, 'I') ]

        roman = ""
        # dictionaries are not ordered
        for value, numeral in sorted(numerals.items(), reverse=True):
            while number >= value:
                roman += numeral
                number -= value
    return roman

def main():
    print(int2roman(int(input("Enter a number (1 to 3999) in decimal form: "))))


if __name__ == "__main__":
    main()
