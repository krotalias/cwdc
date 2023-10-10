#!/usr/bin/env python
# coding: UTF-8
#
## @package GameImpl
#
#  Game implementation.
#
#  Concrete implementation of the IGame interface. This implementation has the following behavior:
#  - Moves are allowed via the select() method for pairs of adjacent cells only.
#    The cells must have different types. The move must create at least one run.
#  - A run is defined to be three or more adjacent cells of the same type, horizontally or vertically.
#    A given cell may be part of a horizontal run or a vertical run at the same time.
#  - Points are awarded for runs based on their length. A run of length 3 is awarded BASE_SCORE points,
#    and a run of length (3 + n) points gets @f$BASE\_SCORE \times 2^n@f$.
#
#  @author Paulo Roma
#  @since 12/04/2020
#
from Cell import Cell
from IGame import IGame
from IGenerator import IGenerator
from Icon import Icon

##
# Concrete implementation of the IGame interface. This implementation
# has the following behavior:
# <ul>
#   <li> Moves are allowed via the select() method for pairs of adjacent cells
#        only.  The cells must have different types.  The move must create
#        at least one run.
#   <li> A run is defined to be three or more adjacent cells of the same
#        type, horizontally or vertically. A given cell may be part
#        of a horizontal run or a vertical run at the same time.
#   <li> Points are awarded for runs based on their length.  A run of length
#        3 is awarded BASE_SCORE points, and a run of length (3 + n)
#        points gets @f$BASE\_SCORE \times 2^n@f$.
# </ul>
#
class GameImpl (IGame):
   ##
   # Score awarded for a three-cell run.
   #
    __BASE_SCORE = 10

    ## Turn debugging on or off.
    __DEBUG__ = False

   ##
   # Constructs a game with the given number of columns and rows
   # that will use the given <code>IGenerator</code> instance
   # to create new icons.
   #
   # @param width number of columns.
   # @param height number of rows.
   # @param generator generator for new icons.
   #
    def __init__(self, width, height, generator):
        ## The grid of icons for this game.
        self.__grid = [[None for y in range(width)] for x in range(height)]

        # Initialize the grid.
        generator.initialize(self.__grid, True)

        ## Current score of the game.
        self.__score = 0

        ## Icon generator.
        self.__generator = generator

        self.removeAllRuns()

        # Reset score.
        self.__score = 0

    ## Remove all runs from the grid.
    #
    # The search for runs is based on the fact that an empty list evaluates to False (bool([]) is False).
    # - Duck typing: "If it walks like a duck and it quacks like a duck, then it must be a duck."
    # - That is: In duck typing, an object's suitability is determined by the presence of certain
    # methods and properties, rather than the type of the object itself.
    #
    # @see https://medium.com/better-programming/how-to-check-if-a-list-is-empty-in-python-b29faecaadc1
    def removeAllRuns(self):
        while self.findRuns(True):
            for col in range(self.getWidth()):
                self.collapseColumn(col)
                self.fillColumn(col)

    ## Get the debugging state.
    @property
    def debug(self):
        return GameImpl.__DEBUG__

    ## Set the debugging state.
    @debug.setter
    def debug(self, deb):
        GameImpl.__DEBUG__ = deb

    ## Returns the Icon at the given location in the game grid.
    #
    # @param row row in the grid.
    # @param col column in the grid.
    # @return Icon at the given row and column
    #
    def getIcon(self, row, col):
        return self.__grid[row][col]

    ## Sets the Icon at the given location in the game grid.
    #
    # @param row row in the grid.
    # @param col column in the grid.
    # @param icon to be set in (row,col).
    #
    def setIcon(self, row, col, icon):
        self.__grid[row][col] = icon

    ## Returns the number of columns in the game grid.
    #
    # @return the width of the grid.
    #
    def getWidth(self):
        return len(self.__grid[0])

    ## Returns the number of rows in the game grid.
    # the height of the grid.
    #
    # @return the height of the grid.
    #
    def getHeight(self):
        return len(self.__grid)

    ## Returns the current score.
    #
    # @return current score for the game.
    #
    def getScore(self):
        return self.__score

    ## Swap the icons contained in two cells.
    #
    #  @param cells array with two cells.
    #  @see swapIcons (self, i, j, k, l)
    #
    def swapCells(self, cells):
        self.swapIcons(cells[0].row(), cells[0].col(),
                       cells[1].row(), cells[1].col())

    ## Swap the positions of two icons.
    #
    #  @param (i,j) first icon.
    #  @param (k,l) second icon.
    #
    def swapIcons(self, i, j, k, l):
        temp = self.getIcon(i, j)
        self.setIcon(i, j, self.getIcon(k, l))
        self.setIcon(k, l, temp)

    ##
    # In this implementation, the only possible move is a swap
    # of two adjacent cells.  In order for move to be made, the
    # following must be True.
    # <ul>
    #   <li>The given array has length 2
    #   <li>The two given cell positions must be adjacent
    #   <li>The two given cell positions must have different icon types
    #   <li>Swapping the two icons must result in at least one run.
    # </ul>
    # If the conditions above are satisfied, the icons for the two
    # positions are exchanged and the method returns True otherwise,
    # the method returns False.  No other aspects of the game state
    # are modified.
    #
    # @param cells cells to select.
    # @return True if the selected cells were modified, False otherwise.
    #
    def select(self, cells):
        if self.debug:
            print("select")
            print("Cell 0 = %s" % cells[0])
            print("Cell 1 = %s" % cells[1])

        validSelection = \
            (len(cells) == 2) and cells[0].isAdjacent(cells[1]) and \
            (cells[0].getIcon() != cells[1].getIcon()) and \
            cells[0].inGrid(self.getWidth(), self.getHeight()) and \
            cells[1].inGrid(self.getWidth(), self.getHeight())

        if validSelection:
            self.swapCells(cells)
            if not self.findRuns(False):  # empty list
                self.swapCells(cells)
                validSelection = False

        return validSelection

    ## Returns a list of all cells forming part of a vertical or horizontal run.
    # The list is in no particular order and may contain duplicates.
    # If the argument is False, no modification is made to the game state;
    # if the argument is True, grid locations for all cells in the list are
    # nulled, and the score is updated.
    #
    # @param doMarkAndUpdateScore if False, game state is not modified.
    # @return list of all cells forming runs, in the form:
    # @f$[c_1, c_2, c_3,...], \text{where } c_i = Cell(row_i, col_i, iconType_i)@f$
    #
    def findRuns(self, doMarkAndUpdateScore):
        c = []
        # Keeps runs by size, e.g., runs[4] holds the number of runs of size 4.
        runs = [0] * (max(self.getWidth(), self.getHeight()) + 1)

        # Get runs on a line or column.
        def getRuns(w, h, gIcon, nCell):
            for i in range(h):
                j = 0
                while j < w - 2:
                    if (gIcon(i, j) == gIcon(i, j + 1)) and (gIcon(i, j) == gIcon(i, j + 2)):
                        run_size = 0
                        while (j < w - 1) and (gIcon(i, j) == gIcon(i, j + 1)):
                            c.append(nCell(i, j, gIcon(i, j)))
                            j += 1
                            run_size += 1

                        c.append(nCell(i, j, gIcon(i, j)))
                        run_size += 1
                        runs[run_size] += 1
                    else:
                        j += 1

        # find runs on a line
        getRuns(self.getWidth(), self.getHeight(),
                self.getIcon, lambda i, j, k: Cell(i, j, k))
        # find runs on a column - transpose
        getRuns(self.getHeight(), self.getWidth(), lambda i,
                j: self.getIcon(j, i), lambda i, j, k: Cell(j, i, k))

        if doMarkAndUpdateScore:
            for cell in c:
                self.setIcon(cell.row(), cell.col(), None)

            #
            # Points are awarded for runs based on their length.
            # A run of length 3 is awarded BASE_SCORE points, and
            # a run of length (3 + n) points gets BASE_SCORE times 2 to the power n.
            #
            for i in range(3, len(runs)):
                if runs[i] > 0:
                    self.__score += (GameImpl.__BASE_SCORE *
                                     pow(2, (i - 3))) * runs[i]

        if self.debug and c:
            print("\nfindRuns %r" % doMarkAndUpdateScore)
            print("Cells = " + self.toString(c))
            print("Grid = \n%s" % str(self))
            print("Score = %d" % self.__score)
            print("Runs = " + self.toString(runs))

        return c

    ##
    # Removes an element at index pos, in a given column col, from the grid.
    # All elements above the given position are shifted down, and the first
    # cell of the column is set to null.
    #
    # @param pos the position at which the element should be removed.
    # @param col column of pos.
    #
    def removeAndShiftUp(self, pos, col):
        for i in range(pos, 0, -1):
            self.setIcon(i, col, self.getIcon(i - 1, col))

        self.setIcon(0, col, None)

    ##
    #  Collapses the icons in the given column of the current game grid
    #  such that all null positions, if any, are at the top of the column
    #  and non-null icons are moved toward the bottom (i.e., as if by gravity).
    #  The returned list contains Cells representing icons that were moved
    #  (if any) in their new locations. Moreover, each Cell's previousRow property
    #  returns the original location of the icon. The list is in no particular order.
    #
    #  @param col column to be collapsed.
    #  @return list of cells for moved icons, in the form:
    #  @f$[c_1, c_2, c_3,...], \text{where } c_i = Cell(row_i, col_i, iconType_i)@f$
    #
    def collapseColumn(self, col):
        c = []

        n = 1
        i = 0
        while n > 0 and i < self.getHeight():
            n = 0  # number of nulls (found) below each icon
            for row in range(i + 1, self.getHeight()):
                if self.getIcon(row, col) is None:
                    n += 1
            if n > 0 and self.getIcon(i, col) is not None:
                # the icon goes down the number of nulls found below it
                # new icon position
                cell = Cell(i + n, col, self.getIcon(i, col))
                cell.previousRow = i                      # previous row
                c.append(cell)
            i += 1

        i = 0
        removed = True
        while removed:
            removed = False
            for k in range(i, self.getHeight()):
                if self.getIcon(k, col) is None:
                    self.removeAndShiftUp(k, col)
                    removed = True
                    break
            i += 1

        if self.debug and c:
            print("\ncollapseColumn %s" % col)
            print("Cells = " + self.toString(c))
            print("Grid = \n%s" % str(self))
        return c

    ## Fills the null locations (if any) at the top of the given column in the current game grid.
    # The returned list contains Cells representing new icons added to this column in their new locations.
    # The list is in no particular order.
    #
    # @param col column to be filled.
    # @return list of new cells for icons added to the column, in the form:
    # @f$[c_1, c_2, c_3,...], \text{where } c_i = Cell(row_i, col_i, iconType_i)@f$
    #
    def fillColumn(self, col):
        c = []

        for i in range(self.getHeight()):
            if self.getIcon(i, col) is None:
                icon = self.__generator.generate()
                self.setIcon(i, col, icon)
                c.append(Cell(i, col, icon))

        if self.debug and c:
            print("\nfillColumn %s" % col)
            print("Cells = " + self.toString(c))
            print("Grid = \n%s" % str(self))
        return c

    ##
    # Returns a String representation of the grid for this game,
    # with rows delimited by newlines.
    #
    def __str__(self):
        sb = ""
        for row in range(self.getHeight()):
            for col in range(self.getWidth()):
                icon = self.getIcon(row, col)
                sb += "%s" % ("*" if icon is None else str(icon)).rjust(3, ' ')
            sb += "\n"
        return sb

    ## Return a string representation of the grid, with 8 symbols:
    # - @f$0\ 1\ \ 2\ 3\ 4\ \ 5\ \ 6\ 7@f$
    # - @f$ !\ @ + *\ \$\ \%\ \#\ .@f$
    def __repr__(self):
        sb = ""
        w = self.getWidth()
        h = self.getHeight()

        def n(i):
            n = str(i) + ' '
            return n if i > 9 else "0" + n
        for i in range(w):
            sb += (n(i) if w > 10 else str(i) + " ")
        sb += "   \n\n"

        #sb = " ".join(list(map(str,range(w))))+"\n\n"
        separator = "  " if w > 10 else " "
        symbols = "!@+*$%#."
        for i in range(h):
            for j in range(w):
                sb += symbols[self.getIcon(i, j).getType() % min(
                    len(symbols), self.__generator.getJewelTypes())] + separator
            sb += "  " + str(i) + "\n"
        return sb

    ##
    # Returns a String representation of a List of cells.
    #
    # @param lcells given list.
    # @return string with cells.
    #
    def toString(self, lcells):
        s = ""
        for c in lcells:
            s += str(c) + " "

        if lcells:
            s += "\n"
        return s
