#!/usr/bin/env python3
#
## @package readFile
#  Reads a file and prints it.
#
# @author Paulo Roma
# @since 08/08/2021
# @see <a href="/cwdc/11-python/pascal/readFile.py?pascal3.py">link</a>
# @see <a href="/cwdc/11-python/showCodePython.php?f=pascal/readFile">source</a>

import sys
print("Content-Type: text/html\n")

if len(sys.argv) > 1:
    f = open(sys.argv[1], "r")
    lines = f.readlines()
    print("".join(lines))
