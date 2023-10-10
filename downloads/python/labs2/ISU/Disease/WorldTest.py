#!/usr/bin/env python
# coding: UTF-8
# vim: tabstop=4:softtabstop=4:shiftwidth=4
#
## @package WorldTest
#
#  A class for testing the World.
#
#  @author Paulo Roma
#  @since 23/02/2020

import unittest
import sys

from Actor import Actor
from World import World


##
 # @author Paulo Roma
 #
 #
class WorldTest(unittest.TestCase):

    ##
     # Test initial height and width
     #
    def test_getWidthandHeight(self):
        world = World (400,530)
        self.assertEqual(world.getWidth(), 400)
        self.assertEqual(world.getHeight(), 530)
    
    
    
    ##
     # Test to see if added object to correct cell
     #
    def test_addObj (self):
        actor = Actor()
        world = World(15,15)
        world.addObject(actor, 4,4)
        self.assertEqual(actor.getX(), 4)
        self.assertEqual(actor.getY(), 4)
    
    
    ##
     # Tests to see if the grid is completely initialized as null
     #
    def test_nullBeginning (self):
        world = World(5,5)
        isNull = True
        arr = world.getObjects()
        for i in arr:
            if i is not None:
               isNull = False
        
        self.assertTrue(isNull)
    
    
    ##
     # Tests the thrown exceptions of addObject()
     #
    def test_exceptions (self):
        world = World (15, 15)
        act  = Actor()
        act1 = Actor()
        act2 = Actor()
        act3 = Actor()
        act4 = Actor()
        act5 = Actor()
        
        with self.assertRaises(RuntimeError):
             world.addObject(None, 0, 0)
        world.addObject(act, 0, 0)
        world.addObject(act1, 0, 0)
        world.addObject(act2, 0, 0)
        world.addObject(act3, 0, 0)
        self.assertEqual(world.addObject(act4, 0, 0),5)
        with self.assertRaises(SyntaxError):
             world.addObject(act5, 0, 0)

    
    ##
     # Tests the thrown exceptions of addObject()
     #
    def test_exceptions2 (self):
        world = World(15,15)
        actor = Actor()
        with self.assertRaises (ValueError):
             world.addObject(actor,18,-5)
    
    
    ##
     # Tests the thrown exceptions of addObject()
     #
    def test_exceptions3 (self):
        world = World(15,15)
        actor = None
        with self.assertRaises (RuntimeError):
             world.addObject(actor,13,12)
    
    
    def test_addObject(self):
        world = World(5,5)
        act = Actor()
        act1 = Actor()
        world.addObject(act, 0, 0)
        world.addObject(act1, 1, 0)
        correct = False

        obj = world.getObjects()
        if (obj[0] == act and obj[1] == act1):
            correct = True

        self.assertTrue(correct)
    
    
    ##
     # Tests the thrown exceptions of setGrid() - nRow > 1000
     #
    def test_setGrid(self):
        world = World(10,10)
        grid = world.createGrid(1001,1001,5)
        with self.assertRaisesRegexp (ValueError,'1stD length is out of range'):
             world.setGrid(grid, 3)
    

    ##
     # Tests the thrown exceptions of setGrid() - nRow > nCol
     #
    def test_setGrid2(self):
        world = World(10,10)
        grid = world.createGrid(3,1,5)
        with self.assertRaisesRegexp (ValueError, 'Different 2ndD lengths'):
             world.setGrid(grid, 3)
    
    
    ##
     # Tests the thrown exceptions of setGrid() - nCell > 5
     #
    def test_setGrid3(self):
        world = World(10,10)
        grid = world.createGrid(2,2,6)
        with self.assertRaisesRegexp (ValueError, '3rdD length is out of range'):
             world.setGrid(grid, 3)
    
    
    ##
     # Tests the thrown exceptions of setGrid() - len(aGrid[j]) != ncol
     #
    def test_setGrid4(self):
        world = World(10,10)
        grid = world.createGrid(2,4,5)
        with self.assertRaisesRegexp (ValueError, 'Different 2ndD lengths'):
             world.setGrid(grid, 3)
    
    
    ##
     # Tests the thrown exceptions of setGrid() - len(aGrid[j][k]) != ncel
     #
    def test_setGrid5(self):
        world = World(10,10)
        grid = world.createGrid(4,4,5)
        grid[0][3].pop()
        with self.assertRaisesRegexp (ValueError, 'Different 3rdD lengths'):
             world.setGrid(grid, 3)
    
    
    ##
     # Sets the world to an illegal size
     #
    def test_largeWorld (self):
        world = World (1050, 1001)
        self.assertEqual(world.getWidth(), 1000)
        self.assertEqual(world.getHeight(), 1000)
    

if __name__=="__main__":
    unittest.main() 
