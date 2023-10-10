#!/usr/bin/env python
# coding: UTF-8
#
## \mainpage Bejeweled - A damn cool and awesome game.
#
# Bejeweled is a tile-matching puzzle video game by PopCap Games,
# developed for browsers in 2001.
#
# The goal is to clear gems of the same color, potentially causing a chain reaction.
#
# The game sold over 10 million copies and has been downloaded more than 150 million times.
#
## @package BasicGenerator
#
#  Generator implementation.
#
#  Class for generating the game Bejeweled.
#  To run:
#  - p3 BasicGenerator.py
#
from builtins import input

from IGame import IGame
from IGenerator import IGenerator
from Icon import Icon
from Cell import Cell
from GameImpl import GameImpl
from BasicIcon import BasicIcon
from random import randrange
import random
import sys

##
#   Class for generating the game Bejeweled.
#
#   To run non graphical:
#   - p3 BasicGenerator.py
#
#   To run the GUI:
#   - p3 GamePanelGL.py
#
#   @author Paulo Roma
#   @since 30/03/2020
#   @see <a href="http://en.wikipedia.org/wiki/Bejeweled">Wikipedia</a>
#   @see <a href="http://orion.lcg.ufrj.br/python/ADs/AD1_2021-1.pdf">PIG</a>
#
class BasicGenerator (IGenerator):
    ##  Constructs a BasicGenerator that will create icons with types 0 through numTypes - 1,
    #  using the given Random instance.
    #
    #  @param numTypes number of different jewel types.
    #  @param seed to initialize the random number generator.
    #
    def __init__(self, numTypes, seed=None):
        random.seed(seed)
        ## Number of different jewel types.
        self.__jewelTypes = numTypes

    ## Return the number of jewel types.
    #
    # @return number of different jewels.
    #
    def getJewelTypes(self):
        return self.__jewelTypes

    ##
    #  Initializes a given 2D array of Icons with new values.
    #  Any existing values in the array are overwritten.
    #  The grid is filled with alternating icons of types
    #  0 to jewelTypes-1.
    #
    #  @param grid the 2D array to be initialized
    #  @param randIcons whether generate random icons.
    #
    def initialize(self, grid, randIcons=False):
        pattern = False
        icon1 = 0
        icon2 = 1
        for i in range(len(grid)):
            pattern = not pattern

            # this pattern locks the game!
            if False:
                icon1 += 1
                icon1 = icon1 % self.getJewelTypes()
                if icon1 == icon2:
                    icon1 = (icon2 + 1) % self.getJewelTypes()
                icon2 = (icon1 + 1) % self.getJewelTypes()
                if icon1 == icon2:
                    icon2 = (icon1 + 1) % self.getJewelTypes()

            for j in range(len(grid[0])):
                if not randIcons:
                    grid[i][j] = BasicIcon(icon1 if pattern else icon2)
                else:
                    grid[i][j] = self.generate()
                pattern = not pattern

    ##
    #  Returns a new Icon.
    #
    #  @return a new Icon
    #
    def generate(self):
        return BasicIcon(randrange(self.__jewelTypes))


## Keep asking for movements.
#
# @param game the object to work with.
#
def gameLoop(game):
    w = game.getWidth()
    h = game.getHeight()
    while True:
        try:
            print("Score = %d" % game.getScore())
            (i, j) = tuple(int(x.strip())
                           for x in input("Enter a position (row,col): ").split(','))
            i = min(max(0, i), h - 1)
            j = min(max(0, j), w - 1)
            pos = input("Enter a direction (up, down, left, right): ")
            if pos == 'left' and j > 0:
                l = j - 1
                k = i
            elif pos == 'up' and i > 0:
                k = i - 1
                l = j
            elif pos == 'down' and i < h - 1:
                k = i + 1
                l = j
            elif pos == 'right' and j < w - 1:
                l = j + 1
                k = i
            else:
                raise ValueError("Invalid Direction")
        except (NameError, TypeError) as e:
            print("Try again (%s):" % e)
            print("position: 0..%d, 0..%d" % (w - 1, h - 1))
        except (SyntaxError, AttributeError) as e:
            sys.exit(e)
        except (KeyboardInterrupt, EOFError) as e:
            sys.exit("\nGame over. See you later alligator.")
        else:
            break

    if game.select([Cell(i, j, game.getIcon(i, j)), Cell(k, l, game.getIcon(k, l))]):
        game.removeAllRuns()
    else:
        raise ValueError("Invalid Movement")


## Main function for triggering the game in text mode.
#
# @param nrow number of rows.
# @param ncol number of columns.
# @param nico number of different icons.
# @param d debugging state.
#
def mainGame(nrow, ncol, nico, d=False):
    gen = BasicGenerator(nico)
    jew = GameImpl(ncol, nrow, gen)
    jew.debug = d
    print("%r" % jew)
    while True:
        try:
            gameLoop(jew)
        except ValueError as e:
            print(e)
        print("%r" % jew)


##
#   Main function for testing.
#
#   @param args command line arguments:
#   - args[1] =
#     - 0: bejeweled in text mode.
#       - args[2]: number of columns.
#       - args[3]: number of rows.
#       - args[4]: number of icons.
#       - args[5]: debugging.
#     - 1: random grid.
#       - args[2]
#         - seed for the random generator.
#
def main(args=None):
    if args is None:
        args = sys.argv

    choice = 0
    fillGrid = False
    seed = None
    if len(args) > 1:
        try:
            choice = int(args[1])
        except ValueError as e:
            print(e)

    if choice == 0:
        nc, nr, ni, d = 8, 11, 7, False
        if len(args) > 5:
            try:
                nc = int(args[2])
                nr = int(args[3])
                ni = int(args[4])
                d = args[5] == 'true'
            except ValueError as e:
                print(e)
        while True:
            mainGame(nc, nr, ni, d)
    elif choice == 1:
        fillGrid = True
    if len(args) > 2:
        seed = int(args[2])

    mat = [[1, 0, 0, 3, 1],
           [0, 3, 4, 4, 2],
           [0, 0, 3, 3, 3],
           [4, 0, 0, 3, 4]]

    nrows = len(mat)
    ncols = len(mat[0])
    nicons = 5

    gen = BasicGenerator(nicons, seed)
    testGame = GameImpl(ncols, nrows, gen)
    testGame.debug = True
    print(testGame)
    print("%r" % testGame)

    #testGame.removeAndShiftUp(2,2)

    if fillGrid:
        print("Set icons on grid")
        for i in range(nrows):
            for j in range(ncols):
                testGame.setIcon(i, j, BasicIcon(mat[i][j]))
    else:
        print("Set icons on column 2")
        testGame.setIcon(0, 2, BasicIcon(2))
        testGame.setIcon(1, 2, None)
        testGame.setIcon(2, 2, None)
        testGame.setIcon(3, 2, None)

    print(testGame)
    #testGame.removeAndShiftUp(2,2)

    d = testGame.collapseColumn(2)
    testGame.fillColumn(2)

    print("Set icons on line 1")
    testGame.setIcon(1, 0, BasicIcon(0))
    testGame.setIcon(1, 1, BasicIcon(0))
    testGame.setIcon(1, 2, BasicIcon(0))
    testGame.setIcon(1, 3, BasicIcon(0))
    print(testGame)

    c = testGame.findRuns(True)
    for i in range(testGame.getWidth()):
        testGame.collapseColumn(i)
        testGame.fillColumn(i)
    print(testGame)

    c = []
    c0 = Cell(2, 3, testGame.getIcon(2, 3))
    c1 = Cell(3, 3, testGame.getIcon(3, 3))
    c.append(c0)
    c.append(c1)
    testGame.select(c)

    c = testGame.findRuns(True)

    testGame.fillColumn(3)
    testGame.fillColumn(0)

    print(BasicIcon(0) == BasicIcon(0))
    print(BasicIcon(0) == BasicIcon(1))


if __name__ == "__main__":
    sys.exit(main())
