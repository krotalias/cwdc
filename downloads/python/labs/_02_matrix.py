#!/usr/bin/env python
# coding: UTF-8
#
## @package _02_matrix
#
#  Numpy is a module mainly written in C, which will
#  be much faster than programming in pure python.
#  Here is an example of how to invert a matrix,
#  and do other matrix manipulation.
#
#  You can also have a look at the array module,
#  which is a much more efficient implementation of lists,
#  when you have to deal with only one data type.
#
#  @author Paulo Roma
#  @since 03/08/2009

from numpy import matrix, linalg
from numpy import poly1d
from numpy.lib.polynomial import roots

A = matrix([[1, 2, 3], [11, 12, 13], [21, 22, 23]])  # Creates a matrix.
# Creates a matrix (like a column vector).
x = matrix([[1], [2], [3]])
# Creates a matrix (like a row vector).
y = matrix([[1, 2, 3]])

print("A =\n%s\n" % A)                            # matrix A
print("x =\n%s\n" % x)                            # vector x
print("A.T =\n%s\n" % A.T)                        # Transpose of A.
# Matrix multiplication of A and x.
print("A*x =\n%s\n" % (A * x))
print("Diag(A) = %s\n" % A.diagonal())            # Diagonal of A.
print("Inv(A) =\n%s\n" % A.I)                     # Inverse of A.
# Solve the linear equation system.
print("solve(A, x) =\n%s\n" % linalg.solve(A, x))

B = matrix([[27, 9, 3], [64, 16, 4], [125, 25, 5]])
z = matrix([[10], [20], [35]])
print("B.T =\n%s\n" % B.T)                        # Transpose of A.
print("B =\n%s\n" % B)                            # matrix A
print("z =\n%s\n" % z)
# Solve the linear equation system.
print("solve(B, z) =\n%s\n" % linalg.solve(B, z))

p = poly1d([3, 4, 5])                             # create a 1-d polynomial
print("p(x) =\n%s\n" % p)
print("p*p =\n%s\n" % (p * p))                    # p*p
print("roots(p) = %s\n" % roots(p))               # roots
print("Integral de p(x) =\n%s\n" % p.integ(k=6))  # integrate p
print("p'(x) = %s\n" % p.deriv())                 # derivate p
# evaluate p with x=4 and x=5
print("p(4) e p(5) = %s" % p([4, 5]))
