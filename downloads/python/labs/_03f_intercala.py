#!/usr/bin/env python
# coding: UTF-8
#
## @package _03f_intercala
#   Interleaving two lists.
#
#   @author Paulo Roma
#   @since 21/05/2010

import sys

##
#   Interleaves two lists.
#
#   @param l1 first list.
#   @param l2 second list.
#   @return a new list with l1 and l2 interleaved.
#
def intercala(l1, l2):
    l3 = []

    # decide qual é a maior lista
    if (len(l1) >= len(l2)):
        lshort = l2
        llong = l1
    else:
        llong = l2
        lshort = l1

    # intercala até esgotar os elementos da menor lista
    for i in range(0, len(lshort)):
        l3 = l3 + [l1[i]] + [l2[i]]

    # adiciona o restante da maior lista ao resultado
    l3 = l3 + llong[len(lshort):]

    return l3

def main():
    try:
        try:
            # imprime o resultado
            print(intercala(str(raw_input('Lista1: ')).split(),
                  str(raw_input('Lista2: ')).split()))
        except NameError:
            print(intercala(str(input('Lista1: ')).split(),
                  str(input('Lista2: ')).split()))
    except ValueError:
        main()


if __name__ == "__main__":
    sys.exit(main())
