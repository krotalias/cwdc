#!/usr/bin/env python
# coding: UTF-8
#
## @package _06a_palindroma
#
#   Checking for palindromes.
#   <p>
#   Examples:
#     1. civic, deified, dewed, kayak, level, madam, minim,
#     2. racecar, radar, redder, refer, rotator, rotavator, rotor,
#     3. sagas, solos, sexes, stats.
#
#   @author Paulo Roma

import sys

##
#   Checks whether a string is a palindrome.
#   A palindrome is a word or phrase which is the same when spelt in reverse.
#
#   @param str given string.
#   @return True if s is a palindrome, and False otherwise.
#
def palindrome(str):
    palavra = list(str)      # converte a string str para uma lista

    # reversa = palavra       # não funciona porque copia apenas a referência.
    reversa = palavra[:]      # copia palavra para reversa

    reversa.reverse()         # inverte a lista "reversa"

    return palavra == reversa

def main():
    try:
        str1 = raw_input("Entre com uma palavra: ")
    except NameError:
        str1 = input("Entre com uma palavra: ")

    if not palindrome(str1):
        print("\n\"%s\" não é palíndroma\n" % str1)
    else:
        print("\n\"%s\" é palíndroma\n" % str1)

    # imprime os primeiros 100 números palindromos maiores do que 10000
    i = 10000
    cnt = 0
    while cnt < 100:
        if palindrome(str(i)):
            print("%d = %d" % (cnt + 1, i))
            cnt += 1
        i += 1


if __name__ == "__main__":
    sys.exit(main())
