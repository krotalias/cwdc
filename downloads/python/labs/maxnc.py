#!/usr/bin/env python
# coding: UTF-8
#
## @package maxnc
#  Maximum of two numbers without conditionals.
#
#  <pre>
#  a > b, a + b + a - b = 2a
#  a < b, a + b - a + b = 2b
#  max(a,b) = (a + b + abs(a-b)) / 2
#  </pre>
#
#  @author Paulo Roma
#  @date 07/04/2018
#  @see https://stackoverflow.com/questions/1375882/mathematically-find-max-value-without-conditional-comparison
#
import sys
import math

## Return the maximum of two numbers.
#
#  (a + b + math.sqrt((a-b)*(a-b))) / 2.0
#
#  Note that even square root has also a conditional test.
#  - Whenever c > 0 and @f$c^2 = d@f$, we have a second solution -c,
#  because @f$(-c)^2 = (-1)^2*c^2 = 1*c^2 = d.@f$
#  - Square root returns the greatest in the pair.
#  It comes with a built in:
# <pre>
#  int max(int c1, int c2) {
#      return c1 > c2 ? c1 : c2;
#  }
# </pre>
#
#  A second approach is using bitwise operators, which works for integers.
#
#  Let nb be the number of bits in a word minus one.
#  - a-((a-b)&((a-b)>>nb))
#
#  (a-b)>>nb gets the sign bit
#  - For unsigned numbers, the bit positions that have been vacated by the right shift operation are zero-filled.
#  - For signed numbers, the sign bit is used to fill the vacated bit positions.
#  - In other words, if the number is positive, 0 is used, and if the number is negative, 1 is used.
#
#  This results in:
#  - -1 for negative and 0 for positive
#  - if a > b @f$\rightarrow@f$ (a-b)&0 is 0 @f$\rightarrow@f$ a - (a-b)&0 = a
#
#  Two complement is all bits negated plus 1.
#  - a-b = a + (~b+1).
#  - So, -1 is a number with all bits set: (111111...1)
#  - x & -1 is x.
#  - if a < b @f$\rightarrow@f$ (a-b)&-1 is (a-b) = -abs(a-b) @f$\rightarrow@f$ a - (a-b)&-1 = b
#
#  @param a first number.
#  @param b second number.
#  @see https://msdn.microsoft.com/en-us/library/336xbhcz.aspx
#  <br>
def maxnc(a, b):
    nb = 63
    return a - ((a - b) & ((a - b) >> nb))
    #return (a + b + math.sqrt((a-b)*(a-b))) / 2.0

def main():
    print(maxnc(20, 30))
    print(maxnc(30, 20))
    print(maxnc(-20, 30))
    print(maxnc(30, -20))
    print(maxnc(-30, -20))
    print(maxnc(-20, -30))


if __name__ == '__main__':
    sys.exit(main())
