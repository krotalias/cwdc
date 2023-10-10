#!/usr/bin/env python
# coding: UTF-8
#
## @package _01e_fracoes
#
# Reads a file with a series of fractions, and prints their sum and product.
#
# @author Paulo Roma
# @since 25/09/2014

import sys

from _01a_fracao import Fracao
from functools import reduce


## Process fractions on a given file.
class Fracoes:
    ##
    #   Constructor.
    #   Opens filename and calls Reader for inputting the fraction readings.
    #   Raises an exception if filename does not exist.
    #
    #   @param filename fraction file name.
    #
    def __init__(self, filename):
        ## A list, which aggregates objects of type Fracao.
        self.lfracoes = []

        try:
            f = open(filename, 'r')
        except IOError:
            print('Fracoes: Cannot open file %s for reading' % filename)
            raise
        self.Reader(f)

    ##
    #   Reads a file with a numerator (int) and denominator (int) per line.
    #   Creates a Fracao object for each line and inserts it in the lfracoes list.
    #
    #   @param f fraction file object.
    #
    def Reader(self, f):
        for line in f:
            tempwords = line.split(None)
            if len(tempwords) == 2:
                try:
                    self.lfracoes.append(Fracao(int(tempwords[0]), int(tempwords[1])))
                except:
                    print('Fração Inválida: %s\n' % tempwords)
                    continue

        f.close()

    ##
    #   Returns the ith fraction.
    #
    #   @param i index.
    #
    def __getitem__(self, i):
        return self.lfracoes[i]

    ##
    #   Sets the ith fraction to f.
    #
    #   @param i index.
    #   @param f a fraction object.
    #
    def __setitem__(self, i, f):
        self.lfracoes[i] = f

    ##
    #   Returns the sum and product of all entries of "lfracoes".
    #
    #   @return a string: sum and product of all fractions.
    #
    def __str__(self):
        f = sum(self.lfracoes, Fracao(0))
        g = reduce(lambda x, y: x*y, self.lfracoes)
        return "Soma: %s\nProduto: %s\n" % (f, g)

    ##
    #   Returns each fraction in list "lfracoes".
    #
    #   @return a string: a series of fractions, one per line.
    #
    def __repr__(self):
        sb = ""
        for i, f in enumerate(self):
            sb += "Fracao %d: %s\n" % (i, f)

        return sb


##
#   Main method. Reads a series of pairs of numerators and denominators and prints
#   the sum and product of all fractions.
#
def main(argv=None):
    f = "fracoes.txt"
    if argv is None:
        argv = sys.argv

    if (len(argv) > 1):
        f = argv[1]

    try:
        m = Fracoes(f)
        print(repr(m))
        print(m)
        m[2] = Fracao(3, 5)
        print(repr(m))
        print(m)
    except IOError:
        sys.exit("File %s not found." % f)

if __name__ == "__main__":
    sys.exit(main())
