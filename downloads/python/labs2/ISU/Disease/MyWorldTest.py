#!/usr/bin/env python
# coding: UTF-8
# vim: tabstop=4:softtabstop=4:shiftwidth=4
#
## @package MyWorldTest
#
#  A class for testing the MyWorld.
#
#  @author Paulo Roma
#  @since 01/03/2020

import unittest
import sys

from Actor import Actor
from World import World
from MyWorld import MyWorld


##
# @author Paulo Roma
#
#
class MyWorldTest(unittest.TestCase):

    ##
    # Run for all tests.
    #
    def setUp(self):
        ## world object.
        self.wd = MyWorld()
        ## number of objects (diseases) in wd.
        self.nd = self.wd.numberOfObjects()
        ## list of objects (diseases) in wd.
        self.objs = self.wd.getObjects()

        try:
            inputFile = open("./simulation.config")
        except IOError as e:
            raise IOError("File \"simulation.config\" not found.")

        self.lines = inputFile.readlines()

    ##
    # Test number of objects.
    #
    def test_numberofObjects(self):
        s = self.lines[0].split('=')[1]
        self.assertEqual(self.nd, int(s))

    ##
    # Test quadrant temperatures.
    #
    def test_quadTemp(self):
        s = self.lines[3].split('=')[1]
        temp = eval("[%s]" % s.replace(';', ','))
        for i in range(4):
            self.assertEqual(self.wd.getTemp(i), temp[i])

    ##
    # Test disease position.
    #
    def test_diseasePos(self):
        s = self.lines[1].split('=')[1]
        pos = eval("[(%s)]" % s.replace(';', '),('))
        for i, o in enumerate(self.objs):
            # there is no order
            self.assertIn((o.getX(), o.getY()), pos)

    ##
    # Test disease strength.
    # - 10 <  12 < 15 - disease in region 0 (grows with rate 2)
    # - 10 < 100 > 13 - disease in region 4 (does not grow)
    #
    def test_strength(self):
        def getRate(o):
            rate, low, high = o.getGrowthCondition()
            temp = o.getWorld().getTemp(o.getQuadrant())
            return rate if temp <= high and temp >= low else 1

        stren = [getRate(o) for o in self.objs]
        for j in range(5):
            self.wd.act()
            self.assertLessEqual(
                abs(self.wd.getSumStrength() - sum(map(lambda i: i**j, stren))), 0.01)
            for o in self.objs:
                rate = getRate(o)
                self.assertLessEqual(abs(o.getStrength() - rate**j), 0.01)
                o.act()

    ##
    # Test disease growth.
    #
    def test_diseaseGrowth(self):
        s = self.lines[2].split('=')[1]
        stren = eval("[(%s)]" % s.replace(';', '),('))
        self.assertEqual(sorted([tuple([float(j) for j in t]) for t in stren]),
                         sorted([o.getGrowthCondition()[1:] + o.getGrowthCondition()[:1] for o in self.objs]))


if __name__ == "__main__":
    unittest.main()
