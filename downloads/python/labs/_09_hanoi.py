#!/usr/bin/env python
# coding: UTF-8
#
##  @package _09_hanoi
#
#   Towers of Hanoi
#
#   The Tower of Hanoi puzzle was invented by the French mathematician Edouard Lucas in 1883.
#   The game consists of a tower of eight disks, initially stacked in increasing size on one of three pegs.
#   The objective is to transfer the entire tower to one of the other pegs, by
#   moving only one disk at a time, and never a larger one onto a smaller.
#
#   Recurrence: @f$T(h) = 2T(h-1) + 1 = 2^{h} - 1 \to O(2^{h}).@f$
#
#   @author Paulo Roma
#   @since 31/12/2008
#   @see http://en.wikipedia.org/wiki/Tower_of_Hanoi
#   @see http://www.cut-the-knot.org/recurrence/hanoi.shtml

import sys

##  @brief Hanoi Tower.
#
#   A game invented by the French mathematician Edouard Lucas in 1883.
#
#    1. Move the top N-1 disks from Src to Aux (using Dst as an intermediary peg).
#    2. Move the bottom disk from Src to Dst.
#    3. Move N-1 disks from Aux to Dst (using Src as an intermediary peg).
#
#   @param n     number of disks.
#   @param from_ source peg.
#   @param to_   destination peg.
#   @param by_   intermediary peg.
#
def Hanoi(n, from_, to_, by_):
    if (n == 1):
        print('Move the plate from %s to %s' % (from_, to_))
    else:
        Hanoi(n - 1, from_, by_, to_)
        Hanoi(1, from_, to_, by_)
        Hanoi(n - 1, by_, to_, from_)

##  @brief Main function for testing.
#
#   @param argv number of disks.
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    if (len(argv) < 2):
        nd = int(input('Enter number of disks: '))
    else:
        nd = int(argv[1])

    Hanoi(nd, 'A', 'B', 'C')


if __name__ == "__main__":
    sys.exit(main())
