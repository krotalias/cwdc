#!/usr/bin/env python
# coding: UTF-8
#
## @package GameTest
#
#  Class for testing the Bejeweled game.
#
#  @author Paulo Roma
#  @since 03/05/2020
#  @see https://docs.python.org/2/library/unittest.html
#

from GameImpl import GameImpl
from BasicGenerator import BasicGenerator
from BasicIcon import BasicIcon
from Cell import Cell
import sys
import unittest

##
# Class for testing certain aspects of the behavior of
# the game.
#
class GameTest(unittest.TestCase):
    ##
    # Grid to be used in the tests.
    # setUp is called automatically before every test is executed.
    #
    def setUp(self):
        mat = [[1, 0, 0, 3, 1],
               [0, 3, 4, 4, 2],
               [0, 0, 3, 3, 3],
               [4, 0, 0, 3, 4]]
        nrows = len(mat)
        ncols = len(mat[0])
        nicons = 5
        gen = BasicGenerator(nicons)
        self.testGame = GameImpl(ncols, nrows, gen)
        c = self.testGame.findRuns(False)
        self.assertEqual(c, [], 'There should be no run in the initial grid')
        self.setGrid(mat)

    ## Initialize the grid of the game.
    def setGrid(self, mat):
        nrows = len(mat)
        ncols = len(mat[0])
        for i in range(nrows):
            for j in range(ncols):
                self.testGame.setIcon(i, j, BasicIcon(mat[i][j]))

    ## Return the grid of the game.
    def getGrid(self):
        width = self.testGame.getWidth()
        height = self.testGame.getHeight()
        mat = [[None for y in range(width)] for x in range(height)]
        for i in range(height):
            for j in range(width):
                mat[i][j] = self.testGame.getIcon(i, j)
        return mat

    ## Every None icon should go to the top, and valid icons
    # go to the bottom.
    #
    def test_collapseColumn(self):
        msg = "collapseColumn should move 2 to the bottom"
        self.testGame.setIcon(0, 2, BasicIcon(2))
        self.testGame.setIcon(1, 2, None)
        self.testGame.setIcon(2, 2, None)
        self.testGame.setIcon(3, 2, None)

        #  1  0  2  3  1
        #  0  3  *  4  2
        #  0  0  *  3  3
        #  4  0  *  3  4

        g1 = self.getGrid()
        self.testGame.collapseColumn(2)
        g2 = self.getGrid()

        #  1  0  *  3  1
        #  0  3  *  4  2
        #  0  0  *  3  3
        #  4  0  2  3  4

        g1[0][2] = None
        g1[3][2] = BasicIcon(2)

        self.assertEqual(g2, g1, msg)

    ## Look for runs.
    def test_findRuns(self):
        c2 = [Cell(2, 2, BasicIcon(3)), Cell(
            2, 3, BasicIcon(3)), Cell(2, 4, BasicIcon(3))]
        c1 = self.testGame.findRuns(False)
        self.assertEqual(c1, c2)

        #  1  0  0  3  1
        #  0  3  4  4  2
        #  0  0  3  3  3
        #  4  0  0  3  4

        c1 = self.testGame.findRuns(True)
        self.assertIsNone(self.testGame.getIcon(2, 2))
        self.assertIsNone(self.testGame.getIcon(2, 3))
        self.assertIsNone(self.testGame.getIcon(2, 4))
        self.assertEqual(self.testGame.getScore(), 10)

        #  1  0  0  3  1
        #  0  3  4  4  2
        #  0  0  *  *  *
        #  4  0  0  3  4

        self.testGame.collapseColumn(2)
        self.testGame.collapseColumn(3)
        self.testGame.collapseColumn(4)
        # Nones should go to line 0.
        self.assertIsNone(self.testGame.getIcon(0, 2))
        self.assertIsNone(self.testGame.getIcon(0, 3))
        self.assertIsNone(self.testGame.getIcon(0, 4))

        #  1  0  *  *  *
        #  0  3  0  3  1
        #  0  0  4  4  2
        #  4  0  0  3  4

        self.testGame.fillColumn(2)
        self.testGame.fillColumn(3)
        self.testGame.fillColumn(4)

        #  1  0  4  3  4
        #  0  3  0  3  1
        #  0  0  4  4  2
        #  4  0  0  3  4

        # there should be at most one run, if the three new jewels inserted are equal.
        c1 = self.testGame.findRuns(True)
        self.assertLessEqual(
            len(c1), 4, 'there should be at most one run of length 3 or 4, at this point')

    ## Select two cells for swapping.
    def test_select(self):

        #  1  0  0  3  1
        #  0  3  4  4  2
        #  0  0  3  3  3
        #  4  0  0  3  4

        v = self.testGame.select(
            [Cell(2, 0, BasicIcon(0)), Cell(3, 0, BasicIcon(4))])
        self.assertTrue(v, 'this was a valid move')
        c = self.testGame.findRuns(True)
        self.assertEqual(self.testGame.getScore(), 20, 'Two runs: 10+10')

        c2 = [Cell(2, 2, BasicIcon(3)), Cell(2, 3, BasicIcon(3)), Cell(2, 4, BasicIcon(3)),
              Cell(3, 0, BasicIcon(0)), Cell(3, 1, BasicIcon(0)), Cell(3, 2, BasicIcon(0))]
        self.assertEqual(c, c2, 'there should be two runs')

        #  1  0  0  3  1
        #  0  3  4  4  2
        #  4  0  *  *  *
        #  *  *  *  3  4

        # after collapsing all columns

        #  *  *  *  *  *
        #  1  0  *  3  1
        #  0  3  0  4  2
        #  4  0  4  3  4

        # new runs may have appeared in the first line and/or third column.
        self.testGame.removeAllRuns()
        g1 = self.getGrid()

        #  1  4  1  4  2
        #  1  0  1  3  1
        #  0  3  0  4  2
        #  4  0  4  3  4

        v = self.testGame.select(
            [Cell(3, 0, BasicIcon(4)), Cell(3, 1, BasicIcon(0))])
        g2 = self.getGrid()
        self.assertFalse(v, 'this was an invalid move - no run')
        self.assertEqual(g1, g2, 'grid should be restored')

        v = self.testGame.select(
            [Cell(3, 0, BasicIcon(4)), Cell(3, 5, BasicIcon(0))])
        self.assertFalse(
            v, 'this was an invalid move - cells are not adjacent')

        v = self.testGame.select(
            [Cell(3, 6, BasicIcon(4)), Cell(3, 5, BasicIcon(0))])
        self.assertFalse(
            v, 'this was an invalid move - cells are adjacent but out of range')

    ## Force an exception.
    def test_Exception(self):
        return  # there is no exception ...
        with self.assertRaises(ValueError):
            pass


if __name__ == "__main__":
    unittest.main()
