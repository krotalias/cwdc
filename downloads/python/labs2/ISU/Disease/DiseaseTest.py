#!/usr/bin/env python
# coding: UTF-8
# vim: tabstop=4:softtabstop=4:shiftwidth=4
#
## @package DiseaseTest
#
#  A class for testing the Disease.
#
#  @author Paulo Roma
#  @since 23/02/2020

import unittest
import sys

from World import World
from MyWorld import MyWorld
from Disease import Disease

class DiseaseTest (unittest.TestCase):

    ##
    # Sets the temperature in each quadrant
    # @throws FileNotFoundException
    #
    def test_checkTemp(self):
        mw = MyWorld()
        mw.setTemp(0, 44.5)
        mw.setTemp(1, 49.5)
        mw.setTemp(2, 50.5)
        mw.setTemp(3, 32.5)
        self.assertEqual(int(mw.getTemp(0)), int(44.5))
        self.assertEqual(int(mw.getTemp(1)), int(49.5))
        self.assertEqual(int(mw.getTemp(2)), int(50.5))
        self.assertEqual(int(mw.getTemp(3)), int(32.5))

    ##
    # GetStrength() test
    #
    def test_getStrength(self):
        d = Disease()
        s = d.getStrength()
        self.assertEqual(int(s), 1, 'initial strength must be 1')

    def test_getStrength2(self):
        w = MyWorld()  # calls prepare(), which reads simulation.config

        for d in w.getObjects():
            d.act()
            s = d.getStrength()
            rate, low, high = d.getGrowthCondition()
            temp = d.getWorld().getTemp(d.getQuadrant())
            if temp <= high and temp >= low:
                self.assertEquals(
                    s, rate, 'quadtemp is in disease valid range')
            else:
                self.assertEquals(
                    s, 1, 'quadtemp is outside disease valid range')

    def test_quadrant2(self):
        d = Disease()
        mw = MyWorld()
        mw.addObject(d, 20, 390)
        self.assertEqual(d.getQuadrant(), 2, '(20,390) is in quadrant 2')

    def test_quadrant_invalid(self):
        d = Disease()
        mw = MyWorld()
        with self.assertRaises(ValueError):
            mw.addObject(d, 900, 390)
            print('(900,390) is not in any quadrant')

    def test_quadrant3(self):
        d = Disease()
        w = World(40, 40)
        w.addObject(d, 23, 23)
        self.assertEqual(d.getQuadrant(), 3, '(23,23) is in quadrant 3')


if __name__ == "__main__":
    unittest.main()
