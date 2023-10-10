#!/usr/bin/env python
# coding: UTF-8
#
## @package _03e_multiply
#
#   Matrix multiplication: @f$A \times B@f$
#
#   @f[\mathbf{A}=\begin{pmatrix} A_{11} & A_{12} & \cdots & A_{1m} \\ A_{21} & A_{22} & \cdots & A_{2m} \\ \vdots & \vdots & \ddots & \vdots \\ A_{n1} & A_{n2} & \cdots & A_{nm} \\ \end{pmatrix},
#   \quad\mathbf{B}=\begin{pmatrix} B_{11} & B_{12} & \cdots & B_{1p} \\ B_{21} & B_{22} & \cdots & B_{2p} \\ \vdots & \vdots & \ddots & \vdots \\ B_{m1} & B_{m2} & \cdots & B_{mp} \\ \end{pmatrix} @f]
#
#   Given two matrices A and B, (where, necessarily, the number of columns in A equals the number of rows in B, which equals <em>m</em>) the matrix product AB is defined by:
#    @f[\mathbf{A}\mathbf{B} =\begin{pmatrix} (AB)_{11} & (AB)_{12} & \cdots & (AB)_{1p} \\ (AB)_{21} & (AB)_{22} & \cdots & (AB)_{2p} \\ \vdots & \vdots & \ddots & \vdots \\ (AB)_{n1} & (AB)_{n2} & \cdots & (AB)_{np} \\ \end{pmatrix} @f]
#   (with no multiplication signs or dots) where AB has entries defined by:
#    @f[(AB)_{ij} = \sum_{k=1}^m A_{ik}B_{kj}.@f]
#
#   Treating the rows and columns in each matrix as row and column vectors respectively, this entry is also their vector dot product:
#    @f[\mathbf{a}_i=\begin{pmatrix} A_{i1} & A_{i2} & \cdots & A_{im} \end{pmatrix}\,, \quad \mathbf{b}_j=\begin{pmatrix} B_{1j} \\ B_{2j} \\ \vdots \\ B_{mj} \end{pmatrix}, \quad (AB)_{ij} = \mathbf{a}_i \cdot \mathbf{b}_j. @f]
#
#   @author Paulo Roma
#   @since 16/04/2009
#   @see http://en.wikipedia.org/wiki/Matrix_multiplication

##
#   @brief Dot product of two vectors.
#
#   @param a first vector.
#   @param b second vector.
#   @return a . b
#
def dotProd(a, b):
    return sum([u * v for u, v in zip(a, b)])

##
#   @brief Transpose a given matrix.
#
#   @param m matrix.
#   @param pythonicWay selects the algorithm to use.
#   @return @f$m^T = zip(*m)@f$
#
def transpose(m, pythonicWay=False):
    if pythonicWay:
        return zip(*m)  # pythonic way of doing

    lm = len(m)         # number of lines of m
    cm = len(m[0])      # number of columns of m
    m2 = [0] * cm

    for i in range(cm):
        m2[i] = [0] * lm
        for j in range(lm):
            m2[i][j] = m[j][i]

    return m2

##
#   @brief Multiplies two matrices.
#
#   First solution, "C" or Pascal like.
#
#   @param m1 first matrix.
#   @param m2 second matrix.
#   @return m1 x m2.
#
def matMultiply(m1, m2):

    lm1 = len(m1)        # 5
    lm2 = len(m2)        # 4
    cm2 = len(m2[0])     # 3
    cm1 = len(m1[0])     # 4
    m2t = transpose(m2)  # m2 transposed
    m3 = []

    if (cm1 == lm2):
        for i in range(0, lm1):                         # para cada linha i
            m3.append([0] * cm2)                        # lm1 x cm2 = 5 x 3
            for j in range(0, cm2):                     # para cada coluna j
                #for k in range (0,lm2):                # calcula o produto escalar i.j
                #    m3[i][j] += m1[i][k]*m2[k][j]
                # calcula o produto escalar i.j
                m3[i][j] = dotProd(m1[i], m2t[j])

    else:
        print("Dimensões Incompatíveis")

    return m3


##
#   @brief Multiplies two matrices.
#
#   Second solution, using list comprehension.
#
#   @param m1 first matrix.
#   @param m2 second matrix.
#   @return m1 x m2.
#
def matMultiply2(m1, m2): return [
    [sum(i * j for i, j in zip(row, col)) for col in zip(*m2)] for row in m1]

##
#   @brief Multiplies two matrices.
#
#   Third solution, python like, using zip.
#
#   @param m1 first matrix.
#   @param m2 second matrix.
#   @return m1 x m2.
#   @see https://codeyarns.com/2012/04/26/unpack-operator-in-python/
#   @see http://hangar.runway7.net/python/packing-unpacking-arguments
#   @see https://docs.python.org/3/library/functions.html#zip
#
def matMultiply3(m1, m2):

    m3 = []
    for row in m1:            # para cada linha de m1
        l1 = []
        for col in zip(*m2):  # para cada coluna de m2
            l2 = []
            # l1 += [sum(i*j for i, j in zip(row, col))]
            for i, j in zip(row, col):
                l2 += [i * j]
            # produto escalar de uma linha de m1 com uma coluna de m2
            l1 += [sum(l2)]
        m3.append(l1)

    return m3

def main():
    m1 = [[1, 2, 3, 4],
          [4, 5, 6, 5],
          [7, 8, 9, 2],
          [1, 3, 7, 5],
          [2, 5, 6, 1]]  # 5 x 4

    m2 = [[3, 2, 1],
          [6, 5, 4],
          [9, 8, 7],
          [2, 3, 2]]   # 4 x 3

    print(matMultiply(m1, m2))
    print(matMultiply2(m1, m2))
    print(matMultiply3(m1, m2))


if __name__ == '__main__':
    main()
