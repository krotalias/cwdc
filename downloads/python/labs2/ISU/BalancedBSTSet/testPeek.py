#!/usr/bin/env python
# coding: UTF-8
# vim: tabstop=4:softtabstop=4:shiftwidth=4
#
## @package testPeek
#
#  Demo of the peekable implementation.
#
#  @author Paulo Roma Cavalcanti
#  @date 13/11/2018
#
from peekable import peekable
import sys
try:
    from BalancedBSTSet import BalancedBSTSet as BSTSet
except ImportError:
    from BSTSet import BSTSet

from BSTDemo import set_union, set_intersection, set_difference

##
# Short demo of the BST implementation.
#
def main():
    lst1 = [-1, 4, 3, 5, 15, 25, 24, 26, 30, 28, 29, 50]
    lst2 = [4, 3, 5, 15, 25, 24, 26, 30, 28, 29]

    if True:
        bst1 = BSTSet()
        bst2 = BSTSet()
        bst1.update(lst1)
        bst2.update(lst2)
        lst1 = bst1
        lst2 = bst2

    print("l1 = %s" % lst1)
    print("l2 = %s" % lst2)

    print("Intersection (l1 * l2):\n%s" % set_intersection(lst1, lst2))
    print("Union (l1 + l2):\n%s" % set_union(lst1, lst2))
    print("Difference (l1 - l2):\n%s" % set_difference(lst1, lst2))
    print("Difference (l2 - l1):\n%s" % set_difference(lst2, lst1))


if __name__ == "__main__":
    main()
