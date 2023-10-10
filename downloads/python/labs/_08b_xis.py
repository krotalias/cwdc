#!/usr/bin/env python
#
## @package _08b_xis
#   Formatting prints.
#
#   @author Paulo Roma
#   @since 16/06/2009

##
#   Prints an X using asterisks.
#   The X is parameterized by n,
#   which indicates the number of lines: lines = 2n+1 <br>
#   For n = 2 (5 lines):
#   @code
#       *   *
#        * *
#         *
#        * *
#       *   *
#   @endcode
#   @param n order of the X: lines = 2n+1.
#   @return string for printing the X.
def xis(n):
    s = ""
    for i in range(n, 0, -1):
        s += (n - i) * " " + "*" + (2 * i - 1) * " " + "*" + "\n"
    s += " " * n + "*" + "\n"
    for i in range(1, n + 1):
        s += (n - i) * " " + "*" + (2 * i - 1) * " " + "*" + "\n"
    return s

def main():
    print(xis(int(input("Type n: "))))


if __name__ == '__main__':
    main()
