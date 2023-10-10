#!/usr/bin/env python
# coding: UTF-8
#
## @package Cell
#
#  Cell representation.
#  Class that represents a grid position with an icon.
#  Optionally, it is possible to record a previous row for the icon.
#
#  @author Paulo Roma
#  @since 05/04/2020
#
from Icon import Icon

##
# Class that represents a grid position with an
# icon. Optionally, it is possible to record a previous
# row for the icon.
#
class Cell(object):
    ##
    # Constructs a Cell with the given row, column, and Icon.
    # The previous row is the same as the given row.
    #
    # @param row row for this cell.
    # @param col column for this cell.
    # @param icon the Icon in this cell.
    #
    def __init__(self, row, col, icon):
        ## Row for this cell.
        self.__row = row
        ## Column for this cell.
        self.__col = col
        ## Icon in this cell.
        self.__icon = icon
        ## Previous row for this cell, if applicable.
        self.__previousRow = row

    ##
    # Returns the previous row for this cell.
    # @return
    #   previous row for this cell
    #
    @property
    def previousRow(self):
        return self.__previousRow

    ##
    # Sets the previous row for this cell.
    # @param row
    #   previous row for this cell
    #
    @previousRow.setter
    def previousRow(self, row):
        self.__previousRow = row

    ##
    # Returns the Icon in this cell.
    # @return
    #   the Icon in this cell
    #
    def getIcon(self):
        return self.__icon

    ##
    # Returns the row of this cell
    # @return
    #   row of this cell
    #
    def row(self):
        return self.__row

    ##
    # Returns the column of this cell
    # @return
    #   column of this cell
    #
    def col(self):
        return self.__col

    ##
    # Determines whether this cell has the same position
    # as a given cell.
    # @param other
    #   the cell to compare with this one
    # @return
    #   True if the given cell has the same row and column
    #   as this one
    #
    def samePosition(self, other):
        return self.__row == other.__row and self.__col == other.__col

    ##
    # Determines whether this cell is adjacent by row or column
    # to a given cell.
    # @param other
    #   the cell to test with this one.
    # @return
    #   True if the given cell is adjacent to this one.
    #
    def isAdjacent(self, other):
        return (self.col() == other.col() and abs(self.row() - other.row()) == 1) or \
            (self.row() == other.row() and abs(self.col() - other.col()) == 1)

    ## Cell in grid testing.
    #
    # @param w right limit.
    # @param h bottom limit.
    #
    def inGrid(self, w, h):
        return self.row() >= 0 and self.row() < h and \
            self.col() >= 0 and self.col() < w

    ## Return whether two cells have the same content.
    #
    # @param other cell to test with this one.
    # @return True if this cell is at the same position
    #         and has the same icon type of other.
    #
    def __eq__(self, other):
        return self.samePosition(other) and self.getIcon() == other.getIcon()

    ##
    # Returns a String representation of this Cell in the form:
    # <pre>
    # [(row, column) icon]
    # </pre>
    # if row is the same as the previous row, or
    # <pre>
    # [(row, column) icon (previous row)]
    # </pre>
    # otherwise.
    #
    def __repr__(self):
        icon = '*' if self.getIcon() is None else str(self.getIcon().getType())
        stx = "(%d,%d) %s" % (self.row(), self.col(), icon)
        if (self.row() != self.previousRow):
            stx += " (%d)" % self.previousRow

        return "[%s]" % stx
