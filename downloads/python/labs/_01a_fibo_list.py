#!/usr/bin/env python
#
## @package _01a_fibo_list
#   Fibonacci sequence.
#
#   The Fibonacci Sequence is the series of numbers: @f$0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...@f$ <br>
#   where the next number is found by adding up the two numbers before it.
#
#   @author Paulo Roma

##
#   Fills a list with Fibonacci numbers.
#
#   @param num index of last Fibonnacci number.
#   @return list with the first "num" Fibonacci numbers.
#
def fibonacci(num):
    fibs = [0, 1]
    for i in range(num - 2):
        fibs.append(fibs[-2] + fibs[-1])
    return fibs

def main():
    num = int(input('How many Fibonacci numbers do you want? '))
    print(fibonacci(num))


if __name__ == "__main__":
    main()
