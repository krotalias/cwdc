#!/usr/bin/env python
#
## @package _05e_pascal_zip
#   A Pascal triangle generator using yield.
#
#   @author Paulo Roma
#   @since 21/05/2010
#   @see http://en.wikipedia.org/wiki/Generator_(computer_science)
#   @see https://wiki.python.org/moin/Generators
#   @see https://docs.python.org/2/library/itertools.html
#   @see https://realpython.com/introduction-to-python-generators
#   @see https://gist.github.com/kenichi-shibata/7dd7b325f399f64a5a5676254706d6bf

from itertools import takewhile, count

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


import sys
def main():
    first_level = 0
    if (len(sys.argv) > 1):
        level = int(sys.argv[1])
        if (len(sys.argv) > 2):
            first_level = int(sys.argv[2])
    else:
        level = 5

    # A generator expression cannot have its own scope
    line = [1]
    q = (list(map(sum, zip([0] + line, line + [0]))) for x in count())
    for x in range(level + 1):
        print(line)
        line = next(q)

    # This will allow one to iterate through the values generated.
    # Assigning a generator to a variable will automatically create __next__() method.
    p = pascal(level + 1)
    # pred, seq --> seq[0], seq[1], until pred fails
    takewhile(lambda x: x < level + 1, p)
    while True:
        try:
            print(' '.join(map(str, next(p))))
        except StopIteration:
            break

    Pascal = []
    Pascal += [(' '.join(map(str, x))) for x in pascal(level + 1)]
    lenmax = len(''.join(map(str, Pascal[level])))
    for level, line in enumerate(Pascal):
        if level >= first_level:
            print(''.join(map(str, line)).center(lenmax))


if __name__ == '__main__':
    main()
