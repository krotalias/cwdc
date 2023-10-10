#!/usr/bin/env python
#
# @package validateRoman
#
#  Validating roman numerals.
#
#  @author Paulo Roma
#  @since 22/06/2011

import sys
from _03a_roman2int import roman2int
from _03c_int2roman import int2roman
try:
    xrange
except NameError:
    xrange = range
    raw_input = input

##
# Validates a roman numeral.
#
# @param r roman numeral to be validated.
# @return an error code string, or an empty string, if no error has occurred.
#
def validateRoman(r):
    r = r.upper()
    r = r.replace("(", "")
    s = r.split(")")

    # create a dictionary for mapping roman symbols to decimal
    d = {"M": 1000, "D": 500, "C": 100, "L": 50, "X": 10, "V": 5, "I": 1}

    for r in s:
        lr = len(r)
        if not r:
            continue
        if (not r[lr - 1] in "MDCLXVI"):
            return r[lr - 1]
        for i in range(0, lr - 1):
            if (not r[i] in "MDCLXVI"):
                return r[i]
            if (i + 2) < lr:
                if (i + 3) < lr:
                    if (r[i] == r[i + 1] and r[i] == r[i + 2] and r[i] == r[i + 3]):
                        return "0: " + r[i:i + 4]
                if (d[r[i]] < d[r[i + 2]]):
                    return "1: " + r[i:i + 3]
                if (r[i] in "VLD" and r[i] == r[i + 2]):
                    return "2: " + r[i:i + 3]
                if (r[i] == "I" and r[i + 2] == "I" and r[i + 1] != "I"):
                    return "3: " + r[i:i + 3]
                if (r[i] == "X" and r[i + 2] == "X" and r[i + 1] in "LC"):
                    return "4: " + r[i:i + 3]
            if (d[r[i]] < d[r[i + 1]]):
                if (r[i] not in "IXC"):
                    return "5: " + r[i:i + 2]
                if (r[i] == "I" and not r[i + 1] in "VX"):
                    return "6: " + r[i:i + 2]
                if (r[i] == "X" and not r[i + 1] in "LC"):
                    return "7: " + r[i:i + 2]
                if (r[i] == "C" and not r[i + 1] in "DM"):
                    return "8: " + r[i:i + 2]
            if (r[i] in "VLD" and r[i] == r[i + 1]):
                return "9: " + r[i:i + 2]
    return ""

##
# Validates a roman numeral using regular expressions.
#
# @param r roman numeral to be validated in the range [1,3999].
# @return true if there is a match between the regular expression and the string r.
#         Otherwise, false.
#
def reRoman(r):
    import re

    regex = re.compile(r"""
                ^M{0,3}
                (CM|CD|D?C{0,3})
                (XC|XL|L?X{0,3})
                (IX|IV|V?I{0,3})$
            """, flags=re.VERBOSE | re.IGNORECASE)

    return re.match(regex, r) != None

##
# Main program.
# Converts roman numerals to decimals or vice-versa.
#
# @param argv command line arguments.
# - argv[0]: /Library/WebServer/Documents/python/labs/validateRoman.py (macOS)
# - argv[1]: value to convert
#
# @see https://developers.google.com/edu/python/regular-expressions
# @see https://www.regular-expressions.info
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    try:
        if len(argv) > 1:
            r = argv[1]
            sys.argv = []
            for i in xrange(0, 40000):
                roman = int2roman(i)
                if (validateRoman(roman)):
                    print("%d: %s" % (i, roman))
                if (i < 4000 and not reRoman(roman)):
                    print("%d: %s" % (i, roman))
        else:
            r = raw_input("Enter value: ")

        try:
            d = int(r)
            r = int2roman(d)
        except ValueError as e:
            pass

        s = validateRoman(r)

        if s:
            raise ValueError("Invalid roman - case %s" % s)
        else:
            d = roman2int(r)
            if (0 < d and d < 4000):
                t = reRoman(r)
                print("{} is {}valid".format(r, "" if t else "in"))
            print("{} = {}".format(r, d))
    except ValueError as msg:
        print(msg)
    except (KeyboardInterrupt, EOFError):
        print("See you later alligator")
        return

    # keep asking for values to convert
    main()


if __name__ == "__main__":
    sys.exit(main())
