#!/usr/bin/env python
# coding: UTF-8
#
## @package IGame
#
#  IGame Interface.
#  Interface specifying the API for the logic of a Bejeweled-like matching game.
#
#  @author Paulo Roma
#  @since 05/04/2020
#
try:                 # python >= 3.4
    from abc import ABC, ABCMeta, abstractmethod
except ImportError:  # python 2
    from abc import ABCMeta, abstractmethod
    ABC = object

##
# Interface specifying the API for the logic of a Bejeweled-like matching game.
#
class IGame(ABC):
    ##
    # Returns the Icon at the given location in the game grid.
    # @param row
    #   row in the grid
    # @param col
    #   column in the grid
    # @return
    #   Icon at the given row and column
    #
    @abstractmethod
    def getIcon(self, row, col): pass

    ##
    # Sets the Icon at the given location in the game grid.
    # (Note: this method is intended for testing and is not
    # normally used for game play.)
    # @param row
    #   row in the grid
    # @param col
    #   column in the grid
    # @param icon
    #   icon to be used.
    #
    @abstractmethod
    def setIcon(self, row, col, icon): pass

    ##
    # Returns the number of columns in the game grid.
    # @return the width of the grid.
    #
    @abstractmethod
    def getWidth(self): pass

    ##
    # Returns the number of rows in the game grid.
    # @return the height of the grid.
    #
    @abstractmethod
    def getHeight(self): pass

    ##
    # Returns the current score.
    # @return
    #   current score for the game
    #
    @abstractmethod
    def getScore(self): pass

    ##
    # Selects a group of cells for a move (such as a swapping two cells).
    # If the move can be made, no modification is made to the game state
    # other than to update the selected cells. If the move cannot be made,
    # the game state is not modified.
    # @param cells
    #   cells to select
    # @return
    #   true if the selected cells were modified, false otherwise
    #
    @abstractmethod
    def select(self, cells): pass

    ##
    # Returns a list of all cells forming part of a vertical or horizontal
    # run.  The list is in no particular order and may contain duplicates.
    # If the argument is false, no modification is made to the game
    # state if the argument is true, grid locations for all cells in the
    # list are nulled and the score is updated.
    # @param doMarkAndUpdateScore
    #   if false, game state is not modified
    # @return
    #   list of all cells forming runs
    #
    @abstractmethod
    def findRuns(self, doMarkAndUpdateScore): pass

    ##
    # Collapses the icons in the given column of the current game grid such
    # that all null positions, if any, are at the top of the column
    # and non-null icons are moved toward the bottom (i.e., as if by gravity).
    # The returned list contains Cells representing icons that were moved (if any)
    # in their new locations. Moreover, each Cell's previousRow
    # property returns the original location of the icon.  The list is
    # in no particular order.
    # @param col
    #   column to be collapsed
    # @return
    #   list of cells for moved icons
    #
    @abstractmethod
    def collapseColumn(self, col): pass

    ##
    # Fills the null locations (if any) at the top of the given column in the
    # current game grid.  The returned list contains Cells representing new
    # icons added to this column in their new locations.  The list is
    # in no particular order.
    #
    # @param col
    #   column to be filled
    # @return
    #   list of new cells for icons added to the column
    #
    @abstractmethod
    def fillColumn(self, col): pass
