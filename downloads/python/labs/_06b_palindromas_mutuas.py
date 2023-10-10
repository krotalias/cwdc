#!/usr/bin/env python
# coding: UTF-8
#
##
# @package _06b_palindromas_mutuas
#
#   Checking for mutual palindromes.
#   <p>
#   Examples:
#      1. stressed / desserts
#      2. samaroid (resembling a samara) / dioramas
#      3. rewarder / redrawer
#      4. animal   / lamina
#      5. departer / retraped (verb trape is recorded as an alternative spelling of traipse)
#

import sys

##
#   Checks whether two strings are mutual palindromes.
#   Two words are mutual palindromes when they are the same when one of them is spelt in reverse.
#
#   @param str1 firts string.
#   @param str2 second string.
#   @return True is str1 and str2 are mutual palindromes, and False otherwise.
#
def areMutualPalindromes(str1, str2):
    palavra1 = list(str1)     # converte a string str1 para uma lista
    palavra2 = list(str2)     # converte a string str2 para uma lista

    reversa = []              # lista vazia
    reversa.extend(palavra2)  # copia palavra para reversa
    reversa.reverse()         # inverte a lista "reversa"

    return palavra1 == reversa

def main():
    try:
        str1 = raw_input("Entre com uma palavra: ")
        str2 = raw_input("Entre com uma palavra: ")
    except NameError:
        str1 = input("Entre com uma palavra: ")
        str2 = input("Entre com uma palavra: ")

    if (areMutualPalindromes(str1, str2)):
        print("\n\"%s\" e \"%s\" são palíndromos mútuos" % (str1, str2))
    else:
        print("\n\"%s\" e \"%s\" não são palíndromos mútuos" % (str1, str2))


if __name__ == "__main__":
    sys.exit(main())
