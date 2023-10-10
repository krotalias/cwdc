#!/usr/bin/env python
# coding: UTF-8
#
## @package sort_file
#
#  Sort the lines of a file.
#
#  @see http://docs.python.org/2/library/fileinput.html
#

import fileinput
import sys

## Sort the lines in the file named on standard input,
#  outputting the sorted lines on stdout.
#
#  Example call (from command line)
#  sort_file.py unsorted.txt > sorted.txt
#
def sort_file():
    lines = []  # list of file lines
    for line in fileinput.input():
        lines.append(line.rstrip())
    lines.sort()
    for line in lines:
        print(line)


if __name__ == "__main__":
    sys.exit(sort_file())
