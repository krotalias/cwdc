#!/usr/bin/env python
#
## @package _01f_getDigit
#
#   Picks up a digit from an integer.
#
#   @author Paulo Roma

##
#   @brief Gets the n-th digit of an integer, from right to left.
#
#   @param num an integer.
#   @param d bit to be retrieved.
#   @return the d-th digit of num.
#
def getDigit(num, d):
    pwd = 10**(d - 1)
    return abs(num) % (10 * pwd) // pwd

def main():
    number = int(input("Type an integer: "))
    digit = int(input("Type a digit: "))
    print(getDigit(number, digit))


if __name__ == "__main__":
    main()
