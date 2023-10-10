#!/usr/bin/env python
#
## @package seq
#
#   Evaluating the limit of a sequence.
#
#   @author Paulo Roma
#   @since  5/11/2012

from math import sqrt

##
#   @brief Finds the limit of the sequence:
#
#     @f{eqnarray*}{
#        a_0       &=& \sqrt{k},\ k > 0 \\
#        a_{n+1} &=& \sqrt{k+a_n}.
#     @f}
#
#   @param k a positive integer.
#   @return the limit of the sequence: @f$\frac {1+\sqrt{1+4k}}{2}@f$
#
def seq(k):
    a = sqrt(k)
    an = 0.0

    while (a - an) > 1.0e-05:
        an = a
        a = sqrt(k + an)
    return a

def main():
    k = int(input("Entre com o k: "))
    print(seq(k))
    print((1.0 + sqrt(1.0 + 4 * k)) * 0.5)


if __name__ == "__main__":
    main()
