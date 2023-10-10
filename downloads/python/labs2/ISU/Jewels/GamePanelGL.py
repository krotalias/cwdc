#!/usr/bin/env python
# coding: UTF-8
#
## @package GamePanelGL
#
#   OpenGL Game interface, based on a Java Swing implementation.
#
#   @author Paulo Roma
#   @since 10/04/2020
#
#   @see http://zetcode.com/tutorials/javaswingtutorial/firstprograms/
#
#   Python 2 and 3.
#
from __future__ import print_function

from OpenGL.GL import *
from OpenGL.GLUT import *
from OpenGL.GLU import *

import getopt

from Icon import Icon
from Cell import Cell
from IGame import IGame
from GameImpl import GameImpl
from BasicGenerator import BasicGenerator

import sys
from datetime import datetime
from enum import Enum

## Return the number of seconds in a timedelta for python < 2.7.
#
#  @param td time delta.
#  @return number of seconds in a timedelta.
#
def total_seconds(td):
    return float(td.microseconds + (td.seconds + td.days * 24 * 3600) * 10**6) / float(10**6)

## Return the current Coordinated Universal Time (UTC) in milliseconds.
#
#  @return time since the Epoch (00:00:00 UTC, January 1, 1970) measured in milliseconds.
#
def dateNow():
    if sys.version_info < (2, 7):
        return total_seconds(datetime.now() - datetime.utcfromtimestamp(0)) * 1000
    else:
        return (datetime.now() - datetime.utcfromtimestamp(0)).total_seconds() * 1000

## Call the callback function after an interval of speed ms.
#
class Timer:
    ## Constructor.
    #
    # @param speed time delay.
    # @param callback function to call after a delay interval of time.
    #
    def __init__(self, speed, callback):
        ## Delay for the animation.
        self.speed = speed
        ## Function to call.
        self.callback = callback
        ## Previous time stamp
        self.previousTimeStamp = dateNow()
        ## Number of frames per second
        self.numberOfFramesForFPS = 0
        ## Used to stop the timer.
        self.on = True

    ## Run the callback function after an interval of speed ms.
    #
    # @param value an integer controlling the printing of the fps.
    #
    def run(self, value=1):
        # How many times we've been here in one second.
        currentTime = dateNow()
        if (abs(currentTime - self.previousTimeStamp) >= 1000):
            if GameMain.FPS and value:
                print("fps = %d, delay = %d ms \r" %
                      (self.numberOfFramesForFPS, self.speed), end='')
                sys.stdout.flush()
            self.numberOfFramesForFPS = 0
            self.previousTimeStamp = currentTime
        self.numberOfFramesForFPS += 1

        self.callback()
        # call this function again in delay milliseconds
        if self.on:
            glutTimerFunc(self.speed, self.run, value)

    ## Stop the task.
    def stop(self):
        self.on = False

    ## Restart the task.
       #
       # @param value an integer controlling the printing of the fps.
       #
    def restart(self, value=1):
        self.stop()
        self.on = True
        glutTimerFunc(self.speed, self.run, value)

    ## Set the delay interval.
    def setDelay(self, delay):
        self.speed = delay

##
# Colors for icon types (types outside range 0 - 19 will display as black).
#
class Color(Enum):
    TOPAZ = 0
    EMERALD = 1
    GARNET = 2
    RUBY = 3
    DIAMOND = 4
    AMETHYST = 5
    SAPPHIRE = 6
    BLUE = 7
    GREEN = 8
    ORANGE = 9
    PINK = 10
    RED = 11
    YELLOW = 12
    BURGUNDY = 13
    MAGENTA = 14
    CYAN = 15
    WHITE = 16
    GREY = 17
    GRAY = 18
    BLACK = 19

##
# User interface for the main grid of a Bejeweled-like game.
#
class GamePanel:
    ## Background color.
    BACKGROUND_COLOR = Color.GRAY
    ## Border color.
    BOUNDARY_COLOR = Color.GREY

    ##
    # Constructs a GamePanel with the given game associated ScorePanel.
    # @param game
    #   the IGame instance for which this is the UI.
    # @param windowID graphical context for this panel.
    # @param scorePanel
    #   panel for displaying scores associated with the game.
    #
    def __init__(self, game, windowID, scorePanel=None):
        ## Number of pixels each icon falls per frame when animating.
        self.fallPerFrame = 4
        ## Interval between frames when animating falling icons, in milliseconds.
        self.fallingSpeed = GameMain.SPEED
        ## Number of times to flash when a pair is selected.
        self.numberOfFlashes = 5
        ## Interval between flashes, in milliseconds.
        self.flashingSpeed = 150
        ## State variable counts down to zero while flashing the cells to be collapsed.
        self.flashingState = 0
        ## Cells about to be collapsed are flashed briefly before moving.
        self.cellsToCollapse = None
        ## Flag indicates whether we are currently moving cells down.
        self.collapsing = False
        ## Cells currently being moved down during a collapse.
        self.movingCells = None
        ## Flag indicates whether we are currently filling new cells.
        self.filling = False
        ## New cells filled from top.
        self.fillingCells = None
        ## Cell currently selected by a mouse down event.
        self.currentCell = None
        ## Cell currently selected by a mouse drag event.
        self.nextCell = None
        self.setStroke(1)
        ## Window running this panel.
        self.g = windowID
        glutSetWindow(self.g)

        ## Dictionary of colors.
        # @see https://www.2020colours.com
        self.colors = {Color.GRAY: [0.5, 0.5, 0.5],
                       Color.GREY: [0.33, 0.33, 0.33],
                       Color.RED: [1.0, 0.0, 0.0],
                       Color.GREEN: [0.0, 1.0, 0.0],
                       Color.YELLOW: [1.0, 1.0, 0.0],
                       Color.BLUE: [0.0, 0.0, 1.0],
                       Color.CYAN: [0.0, 1.0, 1.0],
                       Color.MAGENTA: [1.0, 0.0, 1.0],
                       Color.BURGUNDY: [0.5, 0.0, 0.13],
                       Color.GARNET: [0.6, 0.02, 0.3],
                       Color.PINK: [0.98, 0.68, 0.82],
                       Color.AMETHYST: [0.6, 0.4, 0.8],
                       Color.EMERALD: [0.31, 0.78, 0.47],
                       Color.DIAMOND: [0.73, 0.95, 1.0],
                       Color.TOPAZ: [1.0, 0.78, 0.49],
                       Color.RUBY: [0.88, 0.07, 0.37],
                       Color.SAPPHIRE: [0.06, 0.32, 0.73],
                       Color.WHITE: [1.0, 1.0, 1.0],
                       Color.BLACK: [0.0, 0.0, 0.0],
                       Color.ORANGE: [1.0, 0.5, 0.0]}

        ## The IGame instance for which this is the UI.
        self.game = game
        ## Score panel associated with the game.
        self.scorePanel = scorePanel
        ## Background color.
        self.backgroundColor = self.colors[GamePanel.BACKGROUND_COLOR] + [1.0]
        ## Window height.
        self.h = self.game.getHeight() * GameMain.SIZE
        ## Window width.
        self.w = self.game.getWidth() * GameMain.SIZE
        ## using two viewports
        self.twoViewp = (self.g == self.scorePanel.g)

        glutMouseFunc(self.mousePressed)
        glutMotionFunc(self.mouseDragged)
        glutDisplayFunc(self.TimerCallback)
        glutReshapeFunc(self.reshape)
        glClearColor(*self.backgroundColor)

        ## Timer instance used to animate the UI.
        # self.TimerCallback
        self.timer = Timer(self.fallingSpeed, glutPostRedisplay)
        self.timer.run()

    ## Reshape callback.
    #
    # Since cell (0,0) is at the upper left corner of the grid,
    # we draw the Y axis upside down.
    #
    # @param w new window width.
    # @param h new window height.
    #
    def reshape(self, w, h):
        if self.twoViewp:
            w //= 2
        aspect = float(self.game.getHeight()) / float(self.game.getWidth())
        if w * aspect > h:
            GameMain.SIZE = h // self.game.getHeight()
        else:
            GameMain.SIZE = w // self.game.getWidth()
        self.h = self.game.getHeight() * GameMain.SIZE
        self.w = self.game.getWidth() * GameMain.SIZE
        self.d = abs(h - self.h)

        # (0,0) at upper left corner.
        xmin = w if self.twoViewp else 0
        glViewport(xmin, self.d, self.w, self.h)
        glMatrixMode(GL_PROJECTION)
        glLoadIdentity()
        # Y axis upside down.
        glOrtho(0, self.w, self.h, 0, -1, 1)
        if GameMain.__DEBUG__:
            print('Resizing game window')

    ## Force a repaint of this panel.
    def repaint(self):
        glutSetWindow(self.g)
        self.paintComponent()

        # two viewports.
        if self.twoViewp:
            w = glutGet(GLUT_WINDOW_WIDTH) // 2
            h = glutGet(GLUT_WINDOW_HEIGHT)
            # set the viewport for the panel.
            self.scorePanel.reshape(w, h)
            self.setColor(Color.WHITE)
            # clean only the score panel, drawing a rectangle
            if h > w:
                self.fillRect(0, 0, h, w)
            else:
                self.fillRect(0, 0, w, h)
            self.scorePanel.paintComponent(False)
            glutSwapBuffers()
            # restore the viewport for the game
            glViewport(w, self.d, self.w, self.h)
            glLoadIdentity()
            glOrtho(0, self.w, self.h, 0, -1, 1)
        else:
            self.scorePanel.paintComponent()
        glutSwapBuffers()

    ## Fill a rectangle.
    #
    # @param x coordinate of the upper left corner.
    # @param y coordinate of the upper left corner.
    # @param w width of the rectangle.
    # @param h height of the rectangle.
    #
    def fillRect(self, x, y, w, h):
        glBegin(GL_QUADS)
        glVertex2f(x, y)
        glVertex2f(x + w, y)
        glVertex2f(x + w, y + w)
        glVertex2f(x, y + w)
        glEnd()

    ## Draw the edges of a rectangle.
    #
    # @param x coordinate of the upper left corner.
    # @param y coordinate of the upper left corner.
    # @param w width of the rectangle.
    # @param h height of the rectangle.
    #
    def drawRect(self, x, y, w, h):
        glBegin(GL_LINE_LOOP)
        glVertex2f(x, y)
        glVertex2f(x + w, y)
        glVertex2f(x + w, y + w)
        glVertex2f(x, y + w)
        glEnd()

    ## Line width.
    def setStroke(self, w):
        ## Line width.
        self.stroke = w
        glLineWidth(w)

    ## Set current color.
    def setColor(self, c):
        ## Current color.
        self.color = self.colors[c]
        glColor3f(*self.color)

    ##
    #  Maps a point from screen coordinates to WC.
    #  If the game viewport origin in not at (0,0), this is necessary.
    #
    #  @param x given point.
    #  @param y given point.
    #  @return pt in world coordinates.
    #
    def unProject(self, x, y):
        modelMatrix = glGetDoublev(GL_MODELVIEW_MATRIX)
        projMatrix = glGetDoublev(GL_PROJECTION_MATRIX)
        viewport = glGetIntegerv(GL_VIEWPORT)

        h = glutGet(GLUT_WINDOW_HEIGHT)
        y = h - y

        wcx, wcy, wcz = gluUnProject(
            x, y, 0, modelMatrix, projMatrix, viewport)

        return int(wcx), int(wcy)

    ## Callback for mouse button pressed.
    def mousePressed(self, button, button_state, cursor_x, cursor_y):
        if (self.flashingState > 0 or self.collapsing or self.filling):
            return

        if (button == GLUT_LEFT_BUTTON) and (button_state == GLUT_DOWN):
            cursor_x, cursor_y = self.unProject(cursor_x, cursor_y)
            row = cursor_y // GameMain.SIZE
            col = cursor_x // GameMain.SIZE
            if row >= self.game.getHeight() or col >= self.game.getWidth() or \
               row < 0 or col < 0:
                return
            if GameMain.__DEBUG__:
                print("(row,col) = (%d,%d)" % (row, col))
            self.currentCell = Cell(row, col, self.game.getIcon(row, col))
            glutPostRedisplay()
        elif (button == GLUT_LEFT_BUTTON) and (button_state == GLUT_UP):
            # If we have selected two adjacent cells, then tell the game to try
            # to swap them.
            if (self.currentCell is not None):
                if (self.nextCell is not None):
                    swapped = self.game.select(
                        [self.currentCell, self.nextCell])
                    if GameMain.__DEBUG__:
                        print(swapped)
                    if swapped:
                        # Successful move, start up the timer
                        self.timer.setDelay(self.flashingSpeed)
                        self.timer.restart()

            self.currentCell = None
            self.nextCell = None
            glutPostRedisplay()

    ## Callback for mouse button dragged.
    def mouseDragged(self, cursor_x, cursor_y):
        cursor_x, cursor_y = self.unProject(cursor_x, cursor_y)
        row = cursor_y // GameMain.SIZE
        col = cursor_x // GameMain.SIZE
        if row >= self.game.getHeight() or col >= self.game.getWidth() or \
           row < 0 or col < 0:
            return
        if self.currentCell is not None:
            # if the cell is adjacent to the one in which mouse was pressed,
            # record it as the nextCell
            c = Cell(row, col, self.game.getIcon(row, col))
            if self.currentCell.isAdjacent(c):
                self.nextCell = c
            else:
                self.nextCell = None
            glutPostRedisplay()

    ## The paintComponent is invoked whenever the panel needs
    # to be rendered on the screen. In this application,
    # repainting is normally triggered by the calls to the repaint()
    # method in the timer callback and the keyboard event handler (see below).
    def paintComponent(self):
        # clear background
        glClearColor(*self.backgroundColor)
        glClear(GL_COLOR_BUFFER_BIT)

        # paint occupied cells of the grid
        for row in range(self.game.getHeight()):
            for col in range(self.game.getWidth()):
                t = self.game.getIcon(row, col)
                if t is not None:
                    self.paintOneCell(row, col, t)

        if self.currentCell is not None:
            self.highlightOneCell(self.currentCell.row(),
                                  self.currentCell.col())

        if self.nextCell is not None:
            self.highlightOneCell(self.nextCell.row(), self.nextCell.col())

        if self.flashingState > 0:
            # need to paint the cells, since they are nulled out in game
            for p in self.cellsToCollapse:
                self.paintOneCell(p.row(), p.col(), p.getIcon())

            # if cells are collapsing, flash them
            if self.flashingState % 2 != 0:
                self.highlightOneCell(p.row(), p.col())

        if self.collapsing:
            # first grey out the column where cells are moving
            # in order to match the background
            for c in self.movingCells:
                col = c.col()
                row = c.row()
                self.paintOneCellBG(row, col, GamePanel.BACKGROUND_COLOR)

            for c in self.movingCells:
                col = c.col()
                pixel = c.currentPixel
                self.paintOneCellByPixel(pixel, col, c.getIcon())

        if self.filling:
            # first grey out the column where cells are moving
            for c in self.fillingCells:
                col = c.col()
                row = c.row()
                self.paintOneCellBG(row, col, GamePanel.BACKGROUND_COLOR)

            for c in self.fillingCells:
                col = c.col()
                pixel = c.currentPixel
                self.paintOneCellByPixel(pixel, col, c.getIcon())

    ##
    # Renders a single cell of the grid.
    #
    # @param row y-coordinate of the cell to render
    # @param col x-coordinate of the cell to render
    # @param t the icon to render, normally used
    #   to determine the color with which to render the cell
    #
    def paintOneCell(self, row, col, t):
        # scale everything up by the SIZE
        x = GameMain.SIZE * col
        y = GameMain.SIZE * row
        self.setColor(self.getColorForIcon(t))
        self.fillRect(x, y, GameMain.SIZE, GameMain.SIZE)
        self.setColor(GamePanel.BOUNDARY_COLOR)
        self.drawRect(x, y, GameMain.SIZE - 1, GameMain.SIZE - 1)

    ##
    # Renders a single cell of the grid.
    #
    # @param row y-coordinate of the cell to render
    # @param col x-coordinate of the cell to render
    # @param color the color to render
    #
    def paintOneCellBG(self, row, col, color):
        # scale everything up by the SIZE
        x = GameMain.SIZE * col
        y = GameMain.SIZE * row
        self.setColor(color)
        self.fillRect(x, y, GameMain.SIZE, GameMain.SIZE)
        self.setColor(GamePanel.BACKGROUND_COLOR)
        self.drawRect(x, y, GameMain.SIZE - 1, GameMain.SIZE - 1)

    ##
    # Renders a single cell of the grid specifying its vertical
    # position in pixels.
    #
    # @param rowPixel y-coordinate of pixel at which to render the cell
    # @param col x-coordinate of the cell to render
    # @param t the icon to render, normally used
    #   to determine the color with which to render the cell
    #
    def paintOneCellByPixel(self, rowPixel, col, t):
        # scale everything up by the SIZE
        x = GameMain.SIZE * col
        y = rowPixel
        self.setColor(self.getColorForIcon(t))
        self.fillRect(x, y, GameMain.SIZE, GameMain.SIZE)
        self.setColor(GamePanel.BOUNDARY_COLOR)
        self.drawRect(x, y, GameMain.SIZE - 1, GameMain.SIZE - 1)

    ##
    # Draws a white border around one cell.
    #
    # @param row y-coordinate of the cell to highlight
    # @param col x-coordinate of the cell to highlight
    #
    def highlightOneCell(self, row, col):
        self.setColor(Color.WHITE)
        self.setStroke(2)
        self.drawRect(col * GameMain.SIZE, row * GameMain.SIZE,
                      GameMain.SIZE, GameMain.SIZE)
        self.setStroke(1)

    ##
    # Listener for timer events.
    #
    # This is the display callback method,
    # which is invoked each time the timer fires and the call
    # to repaint() at the bottom of the method causes the panel
    # to be redrawn.
    #
    def TimerCallback(self):
        # State may be flashing, collapsing or filling.
        # Timer is not stopped until all cascading collapses are finished.
        if (self.flashingState == 0 and not self.collapsing and not self.filling):
            # Either we are just starting execution of the timer, or
            # have finished a previous collapse and fill and need to check
            # whether there is a cascading collapse. If so,
            # set the flashing state and fall through
            self.cellsToCollapse = self.game.findRuns(True)
            if len(self.cellsToCollapse) != 0:
                self.flashingState = self.numberOfFlashes * 2
                self.timer.setDelay(self.flashingSpeed)
                self.timer.restart()

                # update the score too
                self.scorePanel.updateScore(self.game.getScore(
                ), not self.game.debug and self.scorePanel.g is None)
            else:
                # nothing more to collapse
                self.cellsToCollapse = None
                self.timer.stop()

        if (self.flashingState > 0):
            self.flashingState -= 1
            if (self.flashingState == 0):
                # Done flashing, start collapsing
                self.timer.setDelay(self.fallingSpeed)
                self.timer.restart()
                currentMovedCells = []
                for col in range(self.game.getWidth()):
                    currentMovedCells.extend(self.game.collapseColumn(col))
                # go into collapsing state
                self.collapsing = True
                self.movingCells = []
                for c in currentMovedCells:
                    self.movingCells.append(AnimatedCell(c))

        if self.collapsing:
            # see if there are still cells moving
            found = False
            for cell in self.movingCells:
                if not cell.done():
                    found = True
                    cell.animate(self.fallPerFrame)

            if not found:
                # done collapsing, start filling
                self.collapsing = False
                self.movingCells = None

                self.initializeCellsToFill()
                self.filling = True
                if len(self.fillingCells) == 0:
                    print(
                        "WARNING: game returned collapsing cells but failed to return cells to fill columns")
                    self.filling = False
                    self.fillingCells = None

        if self.filling:
            # see if we're done
            found = False
            for cell in self.fillingCells:
                if not cell.done():
                    found = True
                    cell.animate(self.fallPerFrame)

            if not found:
                self.filling = False
                self.fillingCells = None

        self.repaint()

    ##
    # Sets up the fillingCells list.
    #
    def initializeCellsToFill(self):
        self.fillingCells = []
        for col in range(self.game.getWidth()):
            currentNewCells = self.game.fillColumn(col)
            for c in currentNewCells:
                self.fillingCells.append(AnimatedCell(c, -1))

    ## Return the key corresponding to a certain value in a dictionary.
    def get_key(v, d): return next(k for k in d if d[k] is v)

    ##
    # Returns a color for the given icon.
    # @param icon
    # @return
    #
    def getColorForIcon(self, icon):
        if icon is None:
            return Color.GRAY
        index = icon.getType()
        if (index < 0 or index > len(self.colors)):
            return Color.BLACK

        return Color(index)


##
# Subclass of Cell that keeps track of a current vertical
# offset at which it should actually be drawn.
#
class AnimatedCell(Cell):
    ##
    # Constructs an AnimatedCell with the same attributes
    # as the given Cell, with a starting location determined
    # by the cell's previous row.
    # @param cell given cell.
    # @param startRow given starting row.
    #
    def __init__(self, cell, startRow=None):
        super(AnimatedCell, self).__init__(
            cell.row(), cell.col(), cell.getIcon())

        if startRow is not None:
            ## This cell previous row.
            self.previousRow = startRow
            ## Starting cell position in pixels.
            # row * (pixels in a cell)
            self.startPixel = startRow * GameMain.SIZE
            ## Current cell position in pixels.
            self.currentPixel = self.startPixel
        else:
            # pixel coordinates
            self.startPixel = cell.previousRow * GameMain.SIZE
            self.currentPixel = self.startPixel

        ## Final cell position in pixels.
        self.endPixel = cell.row() * GameMain.SIZE

    ##
    # Determines whether this cell has reached its
    # ending location.
    # @return
    #
    def done(self):
        return self.currentPixel == self.endPixel

    ##
    # Moves this cell's current position by the given amount.
    # @param pixels
    #
    def animate(self, pixels):
        self.currentPixel += pixels
        if self.currentPixel > self.endPixel:
            self.currentPixel = self.endPixel


##
# Panel for displaying the score in a simple video game.
#
class ScorePanel:
    ##
    # Format string for displaying score.
    #
    SCORE_FORMAT = "Score: %d"
    ## Bitmap font used to display the score.
    FONT = GLUT_BITMAP_TIMES_ROMAN_24

    ## Constructor.
    #
    # @param g OpenGL context to render this panel.
    # @see https://www.opengl.org/wiki/OpenGL_Context
    #
    def __init__(self, g=None):
        ## Current score.
        self.score = 0
        ## OpenGL window ID.
        self.g = g
        ## Font width.
        self.fw = glutBitmapWidth(ScorePanel.FONT, 32)

        viewport = glGetIntegerv(GL_VIEWPORT)
        ## Current viewport width.
        self.w = viewport[2] - viewport[0]
        ## Current viewport height.
        self.h = viewport[3] - viewport[1]

    ## Sets the score to be displayed in this panel.
    #
    # @param newScore
    #   score to be displayed.
    # @param doPrint
    #   whether to print the score on screen.
    #
    def updateScore(self, newScore, doPrint=True):
        ## Score to be displayed.
        self.score = newScore
        txt = ScorePanel.SCORE_FORMAT % self.score
        if not GameMain.__DEBUG__ and doPrint:
            print("\n" + txt)
            glutSetWindowTitle(txt)

    ## Reshape function for this panel.
    def reshape(self, w, h):
        self.w = w
        self.h = h
        glViewport(0, 0, w, h)
        glMatrixMode(GL_PROJECTION)
        glLoadIdentity()
        glOrtho(0, w, 0, h, -1, 1)
        if GameMain.__DEBUG__:
            print('Resizing score window')

    ## Called when the score panel should be updated.
    #
    # Every OpenGL API call operates on the current OpenGL context.
    # Thus, the current OpenGL context is basically a global value
    # (technically a thread-local value, since different threads
    # can have different contexts be current), which all OpenGL calls use.
    #
    # The context contains all of the state for an instance of OpenGL.
    # Contexts are usually created to be associated with a window,
    # which is what their default framebuffer represents.
    #
    # @see https://www.khronos.org/opengl/wiki/Default_Framebuffer
    #
    def paintComponent(self, clear=True):
        if self.g is None:
            return

        # Save current context.
        oldWindow = glutGetWindow()

        # Set this panel context.
        glutSetWindow(self.g)

        # Erase the window.
        glClearColor(1.0, 1.0, 1.0, 1.0)
        # with two viewports, we should only clean
        # this score panel, drawing a blank rectangle.
        if clear:
            glClear(GL_COLOR_BUFFER_BIT)

        txt = ScorePanel.SCORE_FORMAT % self.score
        size = len(txt)

        x = (self.w - size * self.fw) / 2.0
        y = (self.h - size) / 2.0

        glColor3f(0, 0, 0)
        self.drawText(x, y, txt)
        glutSwapBuffers()

        # Restore previous context.
        glutSetWindow(oldWindow)

    ## Draw a text at position (x,y).
    #
    # @param x lower left corner position.
    # @param y lower left corner position.
    # @param txt text.
    #
    def drawText(self, x, y, txt):
        glRasterPos2f(x, y)
        for c in txt:
            glutBitmapCharacter(ScorePanel.FONT, ord(c))


##
# Main class for a GUI for a Bejeweled-like game sets up a
# GamePanel instance in a frame.
#
class GameMain:
    ##
    # Number of cells in a grid row or column.
    #
    GRID_SIZE = [16, 16]

    ##
    # Number of different icons on the grid.
    # There are many types of gems in Bejeweled (series), which are:
    # - Topaz, Emerald, Garnet, Ruby, Diamond, Amethyst and Sapphire
    #   (the main icon of all Bejeweled games).
    # - Blue, Green, Orange, Pink, Red, White, Yellow
    #
    ICON_TYPES = 7

    ##
    # Cell size in pixels.
    #
    SIZE = 25

    ##
    # FPS state.
    #
    FPS = False

    ##
    # Falling icon speed.
    #
    SPEED = 50

    ##
    # Seed for the generator.
    #
    SEED = None

    ## Debugging state.
    __DEBUG__ = False

    ## Constructor.
    def __init__(self):
        ## Thread running the game.
        self.r = None

    ## Callback function called by GLUT when the main window size has changed.
    def MainReshape(self, width, height):
        if width > 32 and height > 32:
            glutSetWindow(self.scoreWindow)
            # call reshape callback from scoreWindow
            glutReshapeWindow(width // 2, height)
            glutPositionWindow(0, 0)
            # otherwise, reshape callback is not called (why??)
            glutPostRedisplay()

            glutSetWindow(self.gameWindow)
            # call reshape callback from gameWindow
            glutReshapeWindow(width // 2, height)
            glutPositionWindow(width // 2, 0)

    ## Callback function called by GLUT to render the main window content.
    def MainDisplay(self):
        oldWindow = glutGetWindow()
        glutSetWindow(self.mainWindow)
        glClearColor(*self.panel.backgroundColor)
        glClear(GL_COLOR_BUFFER_BIT)
        if GameMain.__DEBUG__:
            print('Resizing main window')
        glutSwapBuffers()
        glutSetWindow(oldWindow)

    ##
    # Helper method for instantiating the components. This
    # method should be executed in the context of the OpenGL
    # event thread only.
    #
    def create(self, argv, npanels=0):
        value = int(argv[1]) if len(argv) > 1 else -1

        ## create a game with 5 types of icons
        game = GameImpl(GameMain.GRID_SIZE[0], GameMain.GRID_SIZE[1], BasicGenerator(
            GameMain.ICON_TYPES, GameMain.SEED))

        onePanel = twoPanels = threePanels = False
        threePanels = (npanels == 3)
        twoPanels = (npanels == 2)
        onePanel = (npanels == 1)

        GameMain.FPS = (value == 0)
        GameMain.__DEBUG__ = (value == 1)
        game.debug = (value == 2)

        # arrange the two panels horizontally
        glutInit(argv)
        glutInitDisplayMode(GLUT_RGBA | GLUT_DOUBLE)
        width = game.getWidth() * GameMain.SIZE
        height = game.getHeight() * GameMain.SIZE
        glutInitWindowSize(
            2 * width if threePanels or onePanel else width, height)

        dx = dy = 100
        glutInitWindowPosition(dx, dy)
        ## Main window ID.
        self.mainWindow = glutCreateWindow(b"PIG Bejeweled")
        glutKeyboardFunc(self.keyPressed)
        if threePanels:
            glutReshapeFunc(self.MainReshape)
            glutDisplayFunc(self.MainDisplay)
            ## game panel window ID.
            self.gameWindow = glutCreateSubWindow(
                self.mainWindow, width, 0, width, height)
            glutKeyboardFunc(self.keyPressed)
            ## score panel window ID.
            self.scoreWindow = glutCreateSubWindow(
                self.mainWindow, 0, 0, width, height)
            glutKeyboardFunc(self.keyPressed)
        elif twoPanels:
            ## score panel window ID.
            self.gameWindow = self.mainWindow
            self.scoreWindow = glutCreateWindow(b"PIG Bejeweled Score")
            glutKeyboardFunc(self.keyPressed)
            glutSetWindow(self.gameWindow)
            glutPositionWindow(width + dx, dy)
            glutSetWindow(self.scoreWindow)
        elif onePanel:
            self.gameWindow = self.mainWindow
            self.scoreWindow = self.mainWindow
        else:
            self.gameWindow = self.mainWindow
            self.scoreWindow = None

        # create the two UI panels
        scorePanel = ScorePanel(self.scoreWindow)
        if self.scoreWindow is not None:
            glutDisplayFunc(scorePanel.paintComponent)
            glutReshapeFunc(scorePanel.reshape)
        ## GamePanel object.
        self.panel = GamePanel(game, self.gameWindow, scorePanel)

        # rock and roll...
        glutMainLoop()

    ## Keyboard handler.
    def keyPressed(self, key, x, y):
        ESCAPE = b'\x1b'  # 27
        if key == ESCAPE:
            glutLeaveMainLoop()
            return
            # Exception ignored on calling ctypes callback functio
            sys.exit("Game Over")

    ##
    # Entry point. Main thread passes control immediately
    # to the OpenGL event thread.
    #
    # Usage: GamePanelGL.py -t7 -c16 -r16 -s50 -v0
    #
    # @param argv command line arguments:
    # - h help
    # - t number of icon types
    # - c number of columns (grid width)
    # - r number of rows (grid height)
    # - s icon falling speed
    # - d seed for the generator.
    # - p: activate score panel.
    #   - 1: single window, two viewports.
    #   - 2: two separate windows.
    #   - 3: one main and two subwindows.
    # - v verbose level
    #   - 0: print fps and score.
    #   - 1: turn debugging on.
    #   - 2: turn GameImpl debugging on.
    #
    def main(self, argv=None):
        if argv is None:
            argv = sys.argv

        myargv = [argv[0]]
        panel = 0

        try:
            try:
                # options that require an argument should be followed by a colon (:).
                # Long options, which require an argument should be followed by an equal sign ('=').
                opts, args = getopt.getopt(argv[1:], "ht:c:r:s:d:v:p:", [
                                           "help", "types=", "width=", "height=", "speed=", "seed=", "verbose=", "panel="])
            except getopt.GetoptError as msg:
                raise ValueError(str(msg))
            # opts is an option list of pairs [(option1, argument1), (option2, argument2)]
            # args is the list of program arguments left after the option list was stripped
            # for instance, "move.py -h --help 1 2", sets opts and args to:
            # [('-h', ''), ('--help', '')] ['1', '2']
            # something such as [('-h', '')] or [('--help', '')]
            for opt, arg in opts:
                if opt in ("-h", "--help"):
                    print(
                        "Usage %s -t <icon_types> -c <grid_width> -r <grid_height> -s <speed> -d <seed> -v <level> -p <score_window>" % argv[0])
                    return 1
                elif opt in ("-c", "--width"):
                    GameMain.GRID_SIZE[0] = int(arg)
                elif opt in ("-r", "--height"):
                    GameMain.GRID_SIZE[1] = int(arg)
                elif opt in ("-t", "--types"):
                    GameMain.ICON_TYPES = int(arg)
                elif opt in ("-s", "--speed"):
                    GameMain.SPEED = int(arg)
                elif opt in ("-d", "--seed"):
                    GameMain.SEED = int(arg)
                elif opt in ("-p", "--panel"):
                    panel = int(arg)
                elif opt in ("-v", "--verbose"):
                    myargv.append(str(int(arg)))
        except ValueError as err:
            print(str(err) + "\nFor help, type: %s --help" % argv[0])
            return 2

        # GLUT can only be used from the main thread.
        self.create(myargv, panel)


if __name__ == "__main__":
    sys.exit(GameMain().main())
