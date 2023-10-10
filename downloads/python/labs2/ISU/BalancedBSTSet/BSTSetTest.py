#!/usr/bin/env python
# coding: UTF-8
# vim: tabstop=4:softtabstop=4:shiftwidth=4
#
## @package BSTSetTest
#
#  Test for the BST implementation.
#
#  @author Paulo Roma Cavalcanti
#  @date 28/09/2018
#  @see https://www.onlinemathlearning.com/intersection-of-two-sets.html
#  @see https://docs.python.org/3.0/library/stdtypes.html#typesseq-mutable
#  @see https://www.w3resource.com/python/python-bytes.php
#  @see https://www.microsoft.com/en-us/research/wp-content/uploads/2011/01/p255-DingKoenig.pdf
#

from __future__ import print_function
try:
    from BalancedBSTSet import BalancedBSTSet as BSTSet
except ImportError:
    from BSTSet import BSTSet
import sys
import unittest

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
    p1 = iter(itr1)
    p2 = iter(itr2)
    result = type(itr1)()
    advit1 = True
    advit2 = True
    while True:
        try:
            if advit1:
                i1 = next(p1)
            if advit2:
                i2 = next(p2)
        except StopIteration:
            break
        if i1 < i2:
            advit1 = True
            advit2 = False
        elif i2 < i1:
            advit1 = False
            advit2 = True
        else:
            result.append(i1)
            advit1 = True
            advit2 = True
    return result

## set union given two mutable ordered sequences.
def set_union(itr1, itr2):
    p1 = iter(itr1)
    p2 = iter(itr2)
    result = type(itr1)()
    advit1 = True
    advit2 = True
    i1 = i2 = None
    while True:
        try:
            if advit1:
                i1 = next(p1)
        except StopIteration:
            if i2 is not None:
                result.append(i2)
            break
        try:
            if advit2:
                i2 = next(p2)
        except StopIteration:
            if i1 is not None:
                result.append(i1)
            break
        if i1 < i2:
            result.append(i1)
            advit1 = True
            advit2 = False
        elif i2 < i1:
            result.append(i2)
            advit1 = False
            advit2 = True
        else:
            result.append(i1)
            advit1 = True
            advit2 = True

    for i in p1:
        result.append(i)
    for i in p2:
        result.append(i)
    return result

## set difference given two mutable ordered sequences.
def set_difference(itr1, itr2):
    p1 = iter(itr1)
    p2 = iter(itr2)
    result = type(itr1)()
    advit1 = True
    advit2 = True
    while True:
        try:
            if advit1:
                i1 = next(p1)
        except StopIteration:
            break
        try:
            if advit2:
                i2 = next(p2)
        except StopIteration:
            result.append(i1)
            break
        if i1 < i2:
            result.append(i1)
            advit1 = True
            advit2 = False
        elif i2 < i1:
            advit1 = False
            advit2 = True
        else:
            advit1 = True
            advit2 = True

    for i in p1:
        result.append(i)
    return result

##
# Class for testing certain aspects of the behavior of
# BSTSet trees.
#
# By default, only functions which names start with test are run.
#
class BSTSetTest(unittest.TestCase):
    ## Controls what is initialized.
    setup_done = False

    ## Called before evey test.
    def setUp(self):
        print('In setUp()', end='')
        self.tree1 = BSTSet()
        self.tree1.update([20, 4, 3, 5, 15, 25, 24, 26, 30, 28, 29])
        self.tree2 = BSTSet()
        self.tree2.update([5, 20, 4, 3, 5, 15, 25, 24, 26, 30, 28, 29])
        self.tree3 = BSTSet()
        self.tree3.update([70, 5, 20, 4, 60, 3])

        if BSTSetTest.setup_done:
            self.tree1.remove(3)
            self.tree1.remove(15)
            self.tree1.remove(25)
            self.tree2.remove(3)
            self.tree2.remove(15)
            self.tree2.remove(25)
        else:
            BSTSetTest.setup_done = True

    ## Called after evey test.
    def tearDown(self):
        print('setup_done = %r In tearDown()\n' % BSTSetTest.setup_done)

    ## remove elements using remove().
    def testRemove(self):
        l1 = [4, 5, 20, 24, 26, 28, 29, 30]
        print("\n%s" % self.tree1, end='')
        self.tree1.remove(3)
        self.tree1.remove(15)
        self.tree1.remove(25)
        l2 = self.tree1.toArray()
        self.assertListEqual(l1, l2)
        print("\nAfter removing 3, 15, and 25 using remove() method")
        print(self.tree1)
        #print("\n\n%r\n" % self.tree1)
        BSTSetTest.setup_done = False

    ## remove elements using iterators.
    def testRemoveIter(self):
        it = self.tree2.iterator()
        self.tree2.update([-17])
        print()
        for i in it:
            print("%d, " % i, end="")

        for i in it:
            if (i == 3 or i == 15 or i == 25):
                it.remove()

        l1 = [-17, 4, 5, 20, 24, 26, 28, 29, 30]
        l2 = self.tree2.toArray()
        self.assertListEqual(l1, l2)

        print("\nAfter removing 3, 15, and 25 using iterator.remove() ")
        print(self.tree2)
        #print("\n\n%r\n" % self.tree2)

    ## set operations with BSTSets.
    def testSetOperOnTrees(self):
        self.tree2.update([-17])
        self.tree2.update([-1, 7, 5, 50])
        self.tree1.update([63, 17, 49])

        print()
        print("tree1 = %s" % self.tree1)
        print("tree2 = %s" % self.tree2)
        print("tree3 = %s" % self.tree3)

        print("\nintersection: tree1 * tree2")
        t = set_intersection(self.tree1, self.tree2)
        print(t)
        l2 = [4, 5, 20, 24, 26, 28, 29, 30]
        self.assertListEqual(t.toArray(), l2)

        print("\nunion: tree1 + tree2")
        t = set_union(self.tree1, self.tree2)
        print(t)
        l2 = [-17, -1, 4, 5, 7, 17, 20, 24, 26, 28, 29, 30, 49, 50, 63]
        self.assertListEqual(t.toArray(), l2)

        print("\ndifference: tree1 - tree2")
        t = set_difference(self.tree1, self.tree2)
        print(t)
        l2 = [17, 49, 63]
        self.assertListEqual(t.toArray(), l2)

        print("\ndifference: tree2 - tree1")
        t = set_difference(self.tree2, self.tree1)
        print(t)
        l2 = [-17, -1, 7, 50]
        self.assertListEqual(t.toArray(), l2)

        print("\nintersection: tree1 * tree2 * tree3")
        t = intersection(self.tree1, self.tree2, self.tree3)
        print(t)
        l2 = [4, 5, 20]
        self.assertListEqual(t.toArray(), l2)

        print("\nunion: tree1 + tree2 + tree3")
        t = union(self.tree1, self.tree2, self.tree3)
        print(t)
        l2 = [-17, -1, 3, 4, 5, 7, 17, 20, 24,
              26, 28, 29, 30, 49, 50, 60, 63, 70]
        self.assertListEqual(t.toArray(), l2)

        print("\ncomplement: C(tree1) = (tree1 + tree2 + tree3) - tree1")
        t = union(self.tree2, self.tree1, self.tree3)
        t = set_difference(t, self.tree1)
        print(t)
        l2 = [-17, -1, 3, 7, 50, 60, 70]
        self.assertListEqual(t.toArray(), l2)

        print("\nunion: [] + tree1 + []")
        t = union(BSTSet(), self.tree1, BSTSet())
        print(t)
        self.assertListEqual(t.toArray(), self.tree1.toArray())

    ## set operations with Lists.
    def testSetOperOnSequences(self):
        list1 = [1, 2, 3]
        list2 = [4, 5, 6]
        print("\nunion: %s + %s" % (list1, list2))
        t = set_union(list1, list2)
        print(t)
        l2 = [1, 2, 3, 4, 5, 6]
        self.assertListEqual(t, l2)

        str1 = "abck"
        str2 = "def"
        print("\nunion: \"%s\" + \"%s\"" % (str1, str2))
        t = set_union(list(str1), list(str2))
        t = ''.join(t)
        print(t)
        self.assertEqual(t, "abcdefk")

        str1 = bytearray("abcdk", 'utf-8')
        str2 = bytearray(list(range(6)))
        print("\nunion: %r + %r" % (str1, str2))
        t = set_union(str1, str2)
        #print("%r" % t)
        print(t.decode("ascii"))
        self.assertEqual(t, b'\x00\x01\x02\x03\x04\x05abcdk')

def main():
    test = BSTSetTest()
    test.setUp()
    test.removeItems()


if __name__ == "__main__":
    unittest.main()
    #sys.exit(main())
