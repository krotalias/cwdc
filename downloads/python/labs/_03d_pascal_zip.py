#!/usr/bin/env python
#
## @package _03d_pascal_zip
#   A Pascal triangle generator using yield.
#
#   @author Paulo Roma
#   @since 21/05/2010
#   @see http://en.wikipedia.org/wiki/Generator_(computer_science)

import sys

##
#    A Pascal Triangle generator.
#
#    @param nlines number of rows to be returned.
#    @param line list with the current row.
#    @return a generator which, each time, return the whole next line of the Pascal triangle.
#    @see https://pythontips.com/2013/09/29/the-python-yield-keyword-explained/
#    @see https://docs.python.org/3/library/functions.html#map
#
#    map(function, iterable, ...)
#    <p>
#    Apply function to every item of iterable and return a list of the results.
#    If additional iterable arguments are passed, function must take that many
#    arguments and is applied to the items from all iterables in parallel. <br>
#    If one iterable is shorter than another it is assumed to be extended with None items.
#    </p><p>
#    If function is None, the identity function is assumed; if there are multiple arguments,
#    map() returns a list consisting of tuples containing the corresponding items from
#    all iterables (a kind of transpose operation). <br>
#    The iterable arguments may be a sequence  or any iterable object; the result is always a list.
#    </p>
#
# @code
#    >>> line=[1,3,3,1]
#    >>> [0] + line
#    [0, 1, 3, 3, 1]
#    >>> line + [0]
#    [1, 3, 3, 1, 0]
#    >>> list(zip([0] + line, line + [0]))
#    [(0, 1), (1, 3), (3, 3), (3, 1), (1, 0)]
#    >>> list(map(sum, zip([0] + line, line + [0])))
#    [1, 4, 6, 4, 1]
# @endcode
#
def pascal(nlines, line=[1]):
    yield line
    for x in range(nlines - 1):
        line = list(map(sum, zip([0] + line, line + [0])))
        yield line

def main():
    if (len(sys.argv) > 1):
        level = int(sys.argv[1])
    else:
        level = 5

    maxlen = len(' '.join(map(str, list(pascal(level))[-1])))
    print('\n'.join([(' '.join(map(str, x))).center(maxlen)
          for x in pascal(level)]))

    #print ( '\n'.join( [" "*(level-len(x)) + (' '.join(map(str,x))) for x in pascal(level)] ) )


if __name__ == '__main__':
    main()
