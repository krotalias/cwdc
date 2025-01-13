#!/usr/bin/env python3
# coding: UTF-8
#
## @package factorize
#
# Prints the the decomposition of a given whole number into its prime factors,
# which when all multiplied together, are equal to that number.
# This Python script is meant to be called from Javascript to factorize the given integer.
#
# @author Paulo Roma
# @since 22/05/2021
# @see <a href="/cwdc/11-python/factorize.py?43">link</a>
# @see <a href="/python/labs/doc/html/__10__factorize2_8py.html">_10_factorize2.py</a>

import sys
import os
sys.path.insert(0, os.path.expanduser("~roma") + "/html/python/labs")
from _10_factorize2 import toString, factorize, condense

print("Content-Type: text/html\n")

if len(sys.argv) > 1:
    ## Integer to be factorized.
    f = int(sys.argv[1])
    ## String with f's prime factors.
    print(toString(condense(factorize(f))))
