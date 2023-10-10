#!/usr/bin/env python
# coding: UTF-8
#
## @package deeper
#
#  The deep_getsizeof() function drills down recursively and
#  calculates the actual memory usage of a Python object graph.
#
#  @see https://code.tutsplus.com/tutorials/understand-how-much-memory-your-python-objects-use--cms-25609
#  @see https://github.com/the-gigi/deep/blob/master/deeper.py#L80
#
from builtins import str
try:
    from collections import OrderedDict, Mapping, Container
except:
    from collections.abc import Mapping, Container  # python 3.10
from pprint import pprint

from sys import getsizeof


def deep_compare(a, b, pointer='/'):
    if a == b:
        return

    if type(a) != type(b):
        reason = 'Different data types'
        extra = str((type(a), type(b)))
        x(pointer, reason, extra)

    elif type(a) in (set, frozenset):
        pointer += 'set()'
        if len(a) != len(b):
            pointer += 'set()'
            reason = 'Different number of items'
            extra = str((len(a), len(b)))
            x(pointer, reason, extra)

        reason = 'Different items'
        extra = (a, b)
        x(pointer, reason, extra)

        for i in range(len(a)):
            deep_compare(a[i], b[i], pointer + 'set()'.format(i))

    elif type(a) in (list, tuple):
        if len(a) != len(b):
            pointer += '[]'
            reason = 'Different number of items'
            extra = str((len(a), len(b)))
            x(pointer, reason, extra)

        if sorted(a) == sorted(b):
            pointer += '[]'
            reason = 'Different sort order'
            extra = 'N/A'
            x(pointer, reason, extra)

        for i in range(len(a)):
            deep_compare(a[i], b[i], pointer + '[{}]'.format(i))

    elif type(a) in (dict, OrderedDict):
        if len(a) != len(b):
            pointer += '{}'
            reason = 'Different number of items'
            extra = str((len(a), len(b)))
            x(pointer, reason, extra)

        if set(a.keys()) != set(b.keys()):
            pointer += '{}'
            reason = 'Different keys'
            extra = (a.keys(), b.keys())
            x(pointer, reason, extra)

        for k in a:
            deep_compare(a[k], b[k], pointer + '[{}]'.format(k))
    else:
        reason = 'Different objects'
        extra = (a, b)
        x(pointer, reason, extra)


def x(pointer, reason, extra):
    message = 'Objects are not the same. Pointer: {}. Reason: {}. Extra: {}'
    raise RuntimeError(message.format(pointer, reason, extra))


def compare(a, b):
    try:
        deep_compare(a, b, '/')
    except RuntimeError as e:
        pprint(e.message)


def deep_getsizeof(o, ids):
    """Find the memory footprint of a Python object

    This is a recursive function that drills down a Python object graph
    like a dictionary holding nested ditionaries with lists of lists
    and tuples and sets.

    The sys.getsizeof function does a shallow size of only. It counts each
    object inside a container as pointer only regardless of how big it
    really is.

    :param o: the object
    :param ids:
    :return:
    """
    d = deep_getsizeof
    if id(o) in ids:
        return 0

    r = getsizeof(o)
    ids.add(id(o))

    # python2 used unicode not str
    if isinstance(o, str) or isinstance(0, str):
        return r

    if isinstance(o, Mapping):
        return r + sum(d(k, ids) + d(v, ids) for k, v in o.iteritems())

    if isinstance(o, Container):
        return r + sum(d(x, ids) for x in o)

    return r
