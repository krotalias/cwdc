#!/usr/bin/env python
# coding: UTF-8
#
## @package World
#
import sys
from Actor import Actor

##
# Class for holding Actor objects in cells of a grid in the world.
# The world is represented by a 2 dimensional array of cells,
# with the specified width and height. One cell
# can keep at most 5 Actor objects.
#
# @author Paulo Cavalcanti
# @date 20/02/2020
#
class World:
    ## Maximum dimension.
    __MAXDIM = 1000

    ##
    # Constructor.
    # Creates a world with the given width and height.
    #
    # - The maximum width and height are 1000.
    # - The maximum number of Actor objects in a cell is 5.
    # <PRE>
    # If worldWidth <= 0 or worldWidth > maximum width
    #     use the maximum width instead.
    # If worldHeight <=0 or worldHeight > maximum height
    #     use the maximum height instead.
    # </PRE>
    #
    # @param worldWidth Width in number of cells
    # @param worldHeight Height in number of cells
    #
    def __init__(self, worldWidth, worldHeight):
        ## A 3D array of Actors.
        self.__grid = []

        ## Counter for the number of added objects.
        self.__objCounter = 0

        ## Width of the world.
        self.__width = 0

        ## Height of the world.
        self.__height = 0

        ## Depth of the world.
        self.__depth = 5

        if (worldWidth <= 0 or worldWidth > World.__MAXDIM):
            worldWidth = World.__MAXDIM

        if (worldHeight <= 0 or worldHeight > World.__MAXDIM):
            worldHeight = World.__MAXDIM

        self.__width = worldWidth
        self.__height = worldHeight

        self.__grid = self.createGrid(worldHeight, worldWidth, self.__depth)

    ## Initializes each object of the array as None.
    #
    # @param h grid height.
    # @param w grid width.
    # @param d grid depth.
    # @return grid.
    #
    def createGrid(self, h, w, d):
        return [[[None] * d for y in range(w)] for x in range(h)]

        grid = []
        for i in range(h):
            grid.append([])
            for j in range(w):
                grid[i].append([])
                for k in range(d):
                    grid[i][j].append(None)
        return grid

    ## Return a string representation of the grid.
    # List by width. Each slice is height x depth.
    #
    # @return string with the grid.
    def __str__(self):
        gstr = 'Grid is %d x %d x %d\n\n' % (
            self.getHeight(), self.getWidth(), self.getDepth())
        for i, x in enumerate(self.__grid):
            gstr += 'width %d\n' % i
            gstr += '\n'.join([' '.join([' '.join(str('*' if z is None else z.getID()))
                              for z in y]) for y in x]) + '\n\n'
        return gstr

    ## Return a string representation of the grid.
    # List by depth. Each slice is height x width.
    #
    # @return string with the grid.
    # @see https://www.ict.social/python/basics/multidimensional-lists-in-python
    def __repr__(self):
        g = self.__grid
        h = self.getHeight()
        w = self.getWidth()
        d = self.getDepth()
        gstr = 'Grid is %d x %d x %d\n\n' % (h, w, d)
        for z in range(d):
            gstr += 'depth %d\n' % z
            for y in range(h):
                for x in range(w):
                    o = g[y][x][z]
                    gstr += str('*' if o is None else o.getID()) + ' '
                gstr += '\n'
            gstr += '\n'
        return gstr

    ##
    # Blank method body.
    # Overriden in subclasses as appropriate
    #
    def act(self):
        pass

    ##
    # Adds a new actor to this world at a given position.
    #
    # - The new object will be added at the cell (x,y) if there are less than 5 objects in this cell.
    # - Be sure to make the added object know that it is in this world and it is at this cell.
    # - Check which methods of the Actor class to call.
    #
    # @param object the object to be added at this cell (x, y)
    # @param x the column
    # @param y the row
    # @return number of objects in cell (x,y).
    #
    # @throws SyntaxError when already max number of objects are in that cell
    # @throws ValueError if x or y is not in the valid range
    # @throws NameError if the object is null
    #
    def addObject(self, object, x, y):
        if (object == None):
            raise RuntimeError('None object added')

        if (x >= self.getWidth() or y >= self.getHeight()):
            raise ValueError('Position out of bounds')

        # number of objects in cell (x,y) - the 3rd dimension of the world
        objDepth = self.__depth - self.__grid[y][x].count(None)

        if (objDepth < self.__depth):
            self.__objCounter += 1
            self.__grid[y][x][objDepth] = object
            object.addedToWorld(self)
            object.setLocation(x, y)
            objDepth += 1
        else:
            raise SyntaxError('Depth > %d' % self.getDepth())

        return objDepth

    ##
    # Returns the world height.
    #
    # @return the world height.
    #
    def getHeight(self):
        return len(self.__grid)

    ##
    # Returns the world width.
    #
    # @return the world width.
    #
    def getWidth(self):
        return len(self.__grid[0])

    ##
    # Returns the world depth.
    #
    # @return the world depth.
    #
    def getDepth(self):
        return len(self.__grid[0][0])

    ##
    # Returns the total number of objects in this world.
    #
    # @return Total number of objects in this world.
    #
    def numberOfObjects(self):
        return self.__objCounter

    ##
    # Returns an array with all Actor objects in this world.
    #
    # @return Array of Actor objects that are in this world.
    #
    # Comments:
    # - Each class in Java is a subclass of the Object class.
    # - Observe that you use the implicit upcast where you assign an Actor
    #   object (sub-class) in an element of the Object array.
    #
    def getObjects(self):
        # Array that contains every Object in the world
        everyObj = [None] * self.__objCounter

        # Next available position in everyObj
        c = 0

        for i in range(self.__height):
            for j in range(self.__width):
                for k in range(self.__depth):
                    if (self.__grid[i][j][k] is not None):
                        everyObj[c] = self.__grid[i][j][k]
                        c += 1

        return everyObj

    ##
    #  It checks if aGrid is a 3D array with the same positive length in each dimension.
    #  If so, it sets the grid to aGrid and the other private fields of class World to
    #  the dimension lengths of aGrid and numObjs.
    #
    #  Note that some checks are omitted. For example, no check is performed to make sure
    #  that numObjs is consistent with the number of Actor objects in aGrid.
    #
    #  Each Actor object in aGrid has to be set to this World object.
    #
    #  @param aGrid reference to a 3D array of Actor objects.
    #
    #  @param numObjs the number of Actor objects in aGrid.
    #
    #  @throws ValueError if the length of each dimension is out of range
    #         or 2nd/3rd dimension has different lengths.
    #
    def setGrid(self, aGrid, numObjs):

        nrow = len(aGrid)
        ncol = len(aGrid[0])
        ncel = len(aGrid[0][0])

        # print ( nrow + " " + ncol + " " + ncel )

        if (nrow < 1 or nrow >= World.__MAXDIM):
            raise ValueError("1stD length is out of range")

        if (ncol < 1 or ncol >= World.__MAXDIM):
            raise ValueError("2ndD length is out of range")

        if (ncel < 1 or ncel >= self.__depth):
            raise ValueError("3rdD length is out of range")

        if (nrow != ncol):
            raise ValueError("Different 2ndD lengths")

        # checks if each dimension is of the same length.
        for j in range(nrow):
            if (len(aGrid[j]) != ncol):
                raise ValueError("Different 2ndD lengths")

            for k in range(ncol):
                if (len(aGrid[j][k]) != ncel):
                    raise ValueError("Different 3rdD lengths")

        ## Set the grid to aGrid
        self.__grid = aGrid
        ## Sets the private field for the number of rows to nrow.
        self.__height = nrow
        ## Sets the private field for the number of columns to ncol.
        self.__width = ncol
        ## Sets the private field for the number of Actor objects to numObj.
        self.__objCounter = numObjs

        for i in range(self.__height):
            for j in range(self.__width):
                for k in range(self.__depth):
                    if (self.__grid[i][j][k] is not None):
                        self.__grid[i][j][k].addedToWorld(self)


def main():
    world = World(7, 9)
    print("Number of objects in cell(4,4) = %d" %
          world.addObject(Actor(), 4, 4))
    print("Number of objects in cell(2,3) = %d" %
          world.addObject(Actor(), 2, 3))
    print("Number of objects in cell(4,4) = %d" %
          world.addObject(Actor(), 4, 4))
    print("Number of objects in cell(4,4) = %d" %
          world.addObject(Actor(), 4, 4))
    print(world)
    print("%r" % world)


if __name__ == "__main__":
    sys.exit(main())
