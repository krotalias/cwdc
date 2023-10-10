#!/usr/bin/env python
# coding: UTF-8
# vim: tabstop=4:softtabstop=4:shiftwidth=4
#
## @package ActorTest
#
#  A class for testing the Actor.
#
#  Usage:
#  - py.test ActorTest.py
#
#  @author Paulo Roma
#  @since 22/02/2020

import unittest
import sys

from Actor import Actor
from World import World
import pytest


def test_actOutput(capsys):
    act = Actor()
    act.act()
    captured = capsys.readouterr()
    assert captured.out == "Iteration 0: Actor 0\n"

class ActorTest (unittest.TestCase):

    def test_constructor(self):
        a = Actor()
        id = a.getID()
        b = Actor()
        self.assertEqual(b.getID(), id + 1, "constructor")
        self.assertEqual(a.Iteration(), 0, "constructor")

    ##
    # Exception tests for setLocation()
    #
    def test_setLocation1(self):
        w = World(10, 10)
        act = Actor()
        w.addObject(act, 0, 0)
        with self.assertRaises(ValueError):
            act.setLocation(12, 5)

    ##
    # Exception tests for setLocation()
    #
    def test_setLocation2(self):
        w = World(10, 10)
        act = Actor()
        w.addObject(act, 0, 0)
        with self.assertRaises(ValueError):
            act.setLocation(9, 14)

    ##
    # SetLocation() test
    #
    def test_setLocation3(self):
        w = World(10, 10)
        act = Actor()
        w.addObject(act, 0, 0)
        act.setLocation(5, 9)
        self.assertEqual(act.getX(), 5, "setLocation3")

    ##
    # SetLocation() test
    #
    def test_setLocation4(self):
        w = World(10, 10)
        act = Actor()
        w.addObject(act, 0, 0)
        act.setLocation(5, 9)
        self.assertEqual(act.getY(), 9, "setLocation4")

    def test_getWorld(self):
        w = World(5, 5)
        act = Actor()
        w.addObject(act, 0, 0)
        self.assertEqual(act.getWorld(), w, "getWorld")

    def test_addedtoWorld(self):
        w = None
        act = Actor()
        with self.assertRaises(RuntimeError):
            act.addedToWorld(w)


if __name__ == "__main__":
    unittest.main()
