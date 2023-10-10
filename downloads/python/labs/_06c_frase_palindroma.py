#!/usr/bin/env python
# coding: UTF-8
#
## @package _06c_frase_palindroma
#
# Checking for palindrome phrases.
#
#   Exemplos:
#    1. "Anotaram a maratona"
#    2. "Sairam o tio Sa e as oito Marias"
#    3. "Roma me tem amor"
#    4. "Socorram-me, subi no onibus em marrocos"
#

import sys

##
#   Checks whether a phrase is a palindrome.
#   The only difficulty here is to remove spaces, accents and punctuation from the String.
#
#   @param st string to be tested.
#   @return True if s is a palindrome phrase, and False otherwise.
#
def isPhrasePalindrome(st):
    unWantedChars = [" ", ",", ".", ":", ";", "-", "_"]
    for c in unWantedChars:
        if c in st:
            st = st.replace(c, "")           # retira brancos e pontuação

            # converte maiúsculas para minúsculas e
    # converte a string str para uma lista
    palavra = list(st.lower())

    reversa = []                            # lista vazia
    reversa.extend(palavra)                # copia palavra para reversa
    reversa.reverse()                       # inverte a lista "reversa"
    return palavra == reversa

def main():
    try:
        str1 = raw_input("Entre com uma palavra: ")
    except NameError:
        str1 = input("Entre com uma palavra: ")

    if (isPhrasePalindrome(str1)):
        print("\n\"%s\" é um palíndromo" % str1)
    else:
        print("\n\"%s\" não é um palíndromo" % str1)


if __name__ == "__main__":
    sys.exit(main())
