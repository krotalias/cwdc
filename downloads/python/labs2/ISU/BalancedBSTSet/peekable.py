#!/usr/bin/env python
# coding: UTF-8
# vim: tabstop=4:softtabstop=4:shiftwidth=4
#
## @package peekable
#
#  An iterator that supports a peek operation.
#
#  @author Quintijn Hoogenboom. Adapted for python 3 by Paulo Roma.
#  @date 17/08/2010
#  @see http://code.activestate.com/recipes/577361-peek-ahead-an-iterator/
#
import collections
class peekable(object):
    """ An iterator that supports a peek operation. 

    this is a merge of example 19.18 of python cookbook part 2, peek ahead more steps
    and the simpler example 16.7, which peeks ahead one step and stores it in
    the self.preview variable.

    Adapted so the peek function never raises an error, but gives the
    self.sentinel value in order to identify the exhaustion of the iter object.

    Example usage:

    >>> p = peekable(range(4))
    >>> p.peek()
    0
    >>> p.next(1)
    [0]
    >>> p.isFirst()
    True
    >>> p.preview
    1
    >>> p.isFirst()
    True
    >>> p.peek(3)
    [1, 2, 3]
    >>> p.next(2)
    [1, 2]
    >>> p.peek(2) #doctest: +ELLIPSIS
    [3, <object object at ...>]
    >>> p.peek(1)
    [3]
    >>> p.next(2)
    Traceback (most recent call last):
    StopIteration
    >>> p.next()
    3
    >>> p.isLast()
    True
    >>> p.next()
    Traceback (most recent call last):
    StopIteration
    >>> p.next(0)
    []
    >>> p.peek()  #doctest: +ELLIPSIS
    <object object at ...>
    >>> p.preview #doctest: +ELLIPSIS
    <object object at ...>
    >>> p.isLast()  # after the iter process p.isLast remains True
    True
    """
    ## schildwacht (guard)
    sentinel = object()

    def __init__(self, iterable):
        ## iterator
        self._iterable = iter(iterable)
        try:
            ## next method hold for speed
            self._nit = self._iterable.next
        except AttributeError:
            self._nit = self._iterable.__next__
        ## deque object initialized left-to-right (using append())
        self._cache = collections.deque()
        ## initialize the first preview already
        self._fillcache(1)
        ## peek at leftmost item
        self.preview = self._cache[0]
        ## keeping the count allows checking isFirst and isLast status
        self.count = -1

    def __iter__(self):
        """return an iterator
        """
        return self

    def _fillcache(self, n):
        """fill _cache of items to come, with one extra for the preview variable
        """
        if n is None:
            n = 1
        while len(self._cache) < n + 1:
            try:
                Next = self._nit()
            except StopIteration:
                # store sentinel, to identify end of iter:
                Next = self.sentinel
            self._cache.append(Next)

    def __next__(self, n=None):
        """gives next item of the iter, or a list of n items

        raises StopIteration if the iter is exhausted (self.sentinel is found),
        but in case of n > 1 keeps the iter alive for a smaller "next" calls
        """
        self._fillcache(n)
        if n is None:
            result = self._cache.popleft()
            if result == self.sentinel:
                # find sentinel, so end of iter:
                self.preview = self._cache[0]
                raise StopIteration
            self.count += 1
        else:
            result = [self._cache.popleft() for i in range(n)]
            if result and result[-1] == self.sentinel:
                # recache for future use:
                self._cache.clear()
                self._cache.extend(result)
                self.preview = self._cache[0]
                raise StopIteration
            self.count += n
        self.preview = self._cache[0]
        return result

    def next(self, n=None):
        """python2 compatibility
        """
        return self.__next__(n)

    def isFirst(self):
        """returns true if iter is at first position
        """
        return self.count == 0

    def isLast(self):
        """returns true if iter is at last position or after StopIteration
        """
        return self.preview == self.sentinel

    def hasNext(self):
        """returns true if iter is not at last position
        """
        return not self.isLast()

    def peek(self, n=None):
        """gives next item, without exhausting the iter, or a list of 0 or more next items

        with n == None, you can also use the self.preview variable, which is the first item
        to come.
        """
        self._fillcache(n)
        if n is None:
            result = self._cache[0]
        else:
            result = [self._cache[i] for i in range(n)]
        return result
