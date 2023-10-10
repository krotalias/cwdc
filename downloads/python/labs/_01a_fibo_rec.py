#!/usr/bin/env python
#
## @package _01a_fibo_rec
#   Fibonacci sequence.
#
#   The Fibonacci Sequence is the series of numbers: @f$0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...@f$ <br>
#   where the next number is found by adding up the two numbers before it.
#
#   @author Paulo Roma
#   @see http://en.wikipedia.org/wiki/Fibonacci_number
#   @see http://www.cs.northwestern.edu/academics/courses/110/html/fib_rec.html
#   @see http://stackoverflow.com/questions/360748/computational-complexity-of-fibonacci-sequence
#

import sys

##
#   This is a naive recursive version.
#   The number of calls is @f$O((\frac {(1+\sqrt{5})}{2})^n) = O(1.618^n)@f$, that is, for n = 20 there are 21891 calls.
#
#   @param n index of a Fibonacci number.
#   @return the nth Fibonacci number.
#
def fiboDumb(n):
    if not hasattr(fiboDumb, "ncalls"):
        fiboDumb.ncalls = 0
    fiboDumb.ncalls += 1

    if (n <= 1):
        return n
    else:
        return fiboDumb(n - 2) + fiboDumb(n - 1)

##
#   Generates a Fibonacci number using a recursive algorithm that makes only n recursive calls.
#
#   @param n index of a Fibonacci number.
#   @param p turns printing on or off.
#   @return the nth Fibonacci number.
#
def fibo(n, p=False):
    if (n <= 1):
        return n

    if not hasattr(fibo, "fibs") or fibo.fibs == []:
        fibo.fibs = [None] * (n + 1)
        fibo.nf = n

    if (fibo.fibs[n - 1] == None):
        fibo.fibs[n - 1] = fibo(n - 1)
    if (fibo.fibs[n - 2] == None):
        fibo.fibs[n - 2] = fibo(n - 2)

    f = fibo.fibs[n] = fibo.fibs[n - 2] + fibo.fibs[n - 1]
    if (n == fibo.nf):
        if p:
            print([i for i in fibo.fibs[1:]])
        fibo.fibs = []

    return f

##
#   Generates a Fibonacci number using a recursive algorithm that makes only n recursive calls.
#   This function just calls fib2.
#
#   @param n index of a Fibonacci number.
#   @return the nth Fibonacci number.
#   @see #fib2
#
def fib(n):
    fib2.ncalls = 0
    if n == 0:
        return 0
    else:
        return fib2(n, 0, 1)

##
#   Generates a Fibonacci number using a recursive algorithm that makes only n recursive calls.
#
#   @param n index of a Fibonacci number.
#   @param p0 a Fibonacci number.
#   @param p1 the Fibonacci number following p0.
#   @return the nth Fibonacci number: p0+p1.
#
def fib2(n, p0, p1):
    if not hasattr(fib2, "ncalls"):
        fib2.ncalls = 0
    fib2.ncalls += 1

    if n == 1:
        return p1
    else:
        return fib2(n - 1, p1, p0 + p1)

def main():
    n = int(input("Type an index of the Fibonacci sequence: "))
    print("\n%12s %12s %12s %12s\n" % ("N", "Fib(N)", "Dumb", "Smart"))
    print("%12s %12s %12s %12s\n" %
          ("-------", "-------", "-------", "-------"))
    for i in range(0, n + 1):
        fiboDumb.ncalls = 0
        fib(i)
        print("%12d %12d %12d %12d" %
              (i, fiboDumb(i), fiboDumb.ncalls, fib2.ncalls))

    print("\n")
    print("The %dth Fibonacci number is: %d\n" % (n, fibo(n, True)))
    print("\n")


if __name__ == "__main__":
    sys.exit(main())
