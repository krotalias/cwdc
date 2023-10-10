#!/usr/bin/env python
# coding: UTF-8
#
## @package _03f_intercala_zip
#   Interleaving three lists.
#
#   @author Paulo Roma
#   @since 15/05/2010

import sys

# Fix Python 2.x.
try:
    input = raw_input
except NameError:
    pass

##
#   Interleaves a variable number of lists.
#
#   @param args tuple of lists.
#   @return a new list with args[0], args[1], ... args[len(args)-1] interleaved.
#
#def intercala (a, b, c):
def intercala(*args):       # pack arguments into tuple args
    result = []
    # zip cria uma lista de tuplas com os elementos das listas intercalados
    # [(a1,b1,c1), (a2,b2,c2), (a3,b3,c3) ....]
    #for items in zip(a, b, c):
    for items in zip(*args):  # unpack args produces the individual elements of the iterable
        for item in items:   # supress the tuples
            result.append(item)

    return result

##
#   Interleaves a variable number of lists.
#
#   @param args tuple of lists.
#   @return a new list with args[0], args[1], ... args[len(args)-1] interleaved.
#   @see https://petegraham.co.uk/interleave-strings-in-python/
#
def intercala3(*args):       # pack arguments into tuple args
    try:
        from itertools import chain, zip_longest
    except:
        from itertools import chain
        from itertools import izip_longest as zip_longest  # python2

    # also remove '' from list
    result = filter(None, list(chain(*zip_longest(*args, fillvalue=''))))
    return ' '.join(result)

def main():
    ## using list comprehension and lambda functions
    def intercala2(a, b, c): return [
        item for items in zip(a, b, c) for item in items]

    # type this way:
    # Lista1: 1 2 3
    # Lista2: 4 5 6
    # Lista3: 7 8 9
    f = intercala3
    print(f(str(input('Lista1: ')).split(),
            str(input('Lista2: ')).split(),
            str(input('Lista3: ')).split()))


if __name__ == '__main__':
    main()
