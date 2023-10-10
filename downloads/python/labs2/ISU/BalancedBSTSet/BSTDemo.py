#!/usr/bin/env python
# coding: UTF-8
# vim: tabstop=4:softtabstop=4:shiftwidth=4
#
## @package BSTDemo
#
#  Demo of the BST implementation.
#
#  @author Paulo Roma Cavalcanti
#  @date 28/09/2018
#

from __future__ import print_function
import sys
try:
    from BalancedBSTSet import BalancedBSTSet as BSTSet
except ImportError:
    from BSTSet import BSTSet

try:
    from peekable import peekable
except ImportError:
    ## return an iterator for a BSTSet.
    def peekable(it):
        return it.iterator()

## set intersection given a list of mutable ordered sequences.
def intersection(*other_sets):
    s = set_intersection(other_sets[0], other_sets[1])
    for s2 in other_sets[2:]:
        s = set_intersection(s, s2)
    return s

## set union given a list of mutable ordered sequences.
def union(*other_sets):
    s = set_union(other_sets[0], other_sets[1])
    for s2 in other_sets[2:]:
        s = set_union(s, s2)
    return s

## set intersection given two mutable ordered sequences.
def set_intersection(itr1, itr2):
    p1 = peekable(itr1)
    p2 = peekable(itr2)
    result = type(itr1)()
    while p1.hasNext() and p2.hasNext():
        i1 = p1.peek()
        i2 = p2.peek()
        if i1 < i2:
            next(p1)
        elif i2 < i1:
            next(p2)
        else:
            result.append(i1)
            next(p1)
            next(p2)
    return result

## set union given two mutable ordered sequences.
def set_union(itr1, itr2):
    p1 = peekable(itr1)
    p2 = peekable(itr2)
    result = type(itr1)()
    while p1.hasNext() and p2.hasNext():
        i1 = p1.peek()
        i2 = p2.peek()
        if i1 < i2:
            result.append(i1)
            next(p1)
        elif i2 < i1:
            result.append(i2)
            next(p2)
        else:
            result.append(i1)
            next(p1)
            next(p2)

    while p1.hasNext():
        result.append(next(p1))
    while p2.hasNext():
        result.append(next(p2))
    return result

## set difference given two mutable ordered sequences.
def set_difference(itr1, itr2):
    p1 = peekable(itr1)
    p2 = peekable(itr2)
    result = type(itr1)()
    while p1.hasNext() and p2.hasNext():
        i1 = p1.peek()
        i2 = p2.peek()
        if i1 < i2:
            result.append(i1)
            next(p1)
        elif i2 < i1:
            next(p2)
        else:
            next(p1)
            next(p2)

    while p1.hasNext():
        result.append(next(p1))
    return result

##
# Short demo of the BST implementation.
#
def main():
    tree1 = BSTSet()
    tree1.update([20, 4, 3, 5, 15, 25, 24, 26, 30, 28, 29])
    #tree1.update([-1, 20, 4, 3, 5, 15, 25, 24, 26, 30, 28, 29])

    print("Elements: ")
    print(tree1)

    print()
    print()
    print("%r" % tree1)
    print()

    tree1.remove(3)
    tree1.remove(15)
    tree1.remove(25)

    print()
    print("After removing 3, 15, and 25 using remove() method")
    print(tree1)

    print()
    print()
    print("%r" % tree1)
    print()

    tree2 = BSTSet()
    tree2.update([5, 20, 4, 3, 5, 15, 25, 24, 26, 30, 28, 29])

    it = tree2.iterator()
    tree2.update([-17])
    for i in it:
        print("%d, " % i, end="")

    for i in it:
        if (i == 3 or i == 15 or i == 25):
            it.remove()

    print()
    print("After removing 3, 15, and 25 using iterator.remove() ")
    print(tree2)

    print()
    print()
    print("%r\n" % tree2)

    tree2.update([-1, 7, 5, 50])
    tree1.update([63, 17, 49])
    print("tree1 = %s" % tree1)
    print("tree2 = %s" % tree2)
    tree3 = BSTSet()
    tree3.update([70, 5, 20, 4, 60, 3])
    print("tree3 = %s" % tree3)

    print("\nintersection: tree1 * tree2")
    t = set_intersection(tree1, tree2)
    print(t)

    print("\nunion: tree1 + tree2")
    t = set_union(tree1, tree2)
    print(t)

    print("\ndifference: tree1 - tree2")
    t = set_difference(tree1, tree2)
    print(t)

    print("\ndifference: tree2 - tree1")
    t = set_difference(tree2, tree1)
    print(t)

    print("\nintersection: tree1 * tree2 * tree3")
    t = intersection(tree1, tree2, tree3)
    print(t)

    print("\nunion: tree1 + tree2 + tree3")
    t = union(tree1, tree2, tree3)
    print(t)

    print("\ncomplement: C(tree1) = (tree1 + tree2 + tree3) - tree1")
    t = union(tree2, tree1, tree3)
    t = set_difference(t, tree1)
    print(t)

    print("\nunion: [] + tree1 + []")
    t = union(BSTSet(), tree1, BSTSet())
    print(t)

    list1 = [1, 2, 3]
    list2 = [4, 5, 6]
    print("\nunion: %s + %s" % (list1, list2))
    t = set_union(list1, list2)
    print(t)

    str1 = "abck"
    str2 = "def"
    print("\nunion: %s + %s" % (str1, str2))
    t = set_union(list(str1), list(str2))
    print(''.join(t))
    print()


if __name__ == "__main__":
    main()
