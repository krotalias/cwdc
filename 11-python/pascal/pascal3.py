#!/usr/bin/env python3
# coding: UTF-8

import sys

def pascal(nlines, line=[1]):
    yield line
    for _ in range(nlines - 1):
        line = list(map(sum, zip([0] + line, line + [0])))
        yield line


level = int(sys.argv[1]) if len(sys.argv) > 1 else 20
mlen = len(' '.join(map(str, list(pascal(level))[-1])))
print("\n".join([(' '.join(map(str, x))).center(mlen) for x in pascal(level)]))
