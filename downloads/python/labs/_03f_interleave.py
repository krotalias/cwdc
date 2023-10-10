#!/usr/bin/env python
#
## @package _03f_interleave
#   Interleaving any number of lists.
#
#   @author Paulo Roma
#   @since  22/05/2010
#   @see http://code.activestate.com/recipes/511480-interleaving-sequences/

import sys

# Fix Python 2.x.
try:
    input = raw_input
except NameError:
    pass

##
#   Interleaves a variable number of lists.
#
#   @param *args some lists.
#
def interleave(*args):

    for idx in range(0, max(len(arg) for arg in args)):
        for arg in args:
            try:
                yield arg[idx]
            except IndexError:
                continue

def main():
    print([i for i in interleave(str(input('Lista1: ')).split(),
                                 str(input('Lista2: ')).split(),
                                 str(input('Lista3: ')).split())])


if __name__ == '__main__':
    main()
