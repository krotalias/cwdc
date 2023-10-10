#!/usr/bin/env python
# coding: UTF-8
#
## @package GamePanel
#
#   Tkinter Game interface, based on a Java Swing implementation.
#   Unfortunately, tkinter is too slow for gamming, and we get only
#   one or two fps.
#
#   @author Paulo Roma
#   @since 05/04/2020
#
#   @see http://zetcode.com/tutorials/javaswingtutorial/firstprograms/
#
#   Python 2 and 3.
#
from __future__ import print_function

from Icon import Icon
from Cell import Cell
from IGame import IGame
from GameImpl import GameImpl
from BasicGenerator import BasicGenerator

import sys
from threading import Thread
from datetime import datetime
from enum import Enum
try:
    from tkinter import *         # python 3
except:
    try:
        from mtTkinter import *   # for thread safety
    except:
        from Tkinter import *     # python 2
from tkinter import font as tkFont

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
    # @param g tk object.
    # @param speed time delay.
    # @param callback function to call after a delay interval of time.
    #
    def __init__(self, g, speed, callback):
        ## Tk object.
        self.g = g
        ## Delay for the animation.
        self.speed = speed
        ## Function to call.
        self.callback = callback
        ## Running task.
        self.task = None
        ## Previous time stamp
        self.previousTimeStamp = dateNow()
        ## Number of frames per second
        self.numberOfFramesForFPS = 0

    ## Run the callback function after an interval of speed ms.
    def run(self):
        # How many times we've been here in one second.
        currentTime = dateNow()
        if (abs(currentTime - self.previousTimeStamp) >= 1000):
            print("fps = %d, delay = %d ms \r" %
                  (self.numberOfFramesForFPS, self.speed), end='')
            sys.stdout.flush()
            self.numberOfFramesForFPS = 0
            self.previousTimeStamp = currentTime
        self.numberOfFramesForFPS += 1

        self.callback()
        self.task = self.g.after(self.speed, self.run)

    ## Stop the task.
    def stop(self):
        if self.task is not None:
            self.g.after_cancel(self.task)
            self.task = None

    ## Restart the task.
    def restart(self):
        self.stop()
        self.task = self.g.after(self.speed, self.run)

    ## Set the delay interval.
    def setDelay(self, delay):
        self.speed = delay

##
# Colors for icon types (types outside range 0 - 7 will display as black).
#
class Color(Enum):
    RED = 0
    GREEN = 1
    CYAN = 2
    YELLOW = 3
    ORANGE = 4
    WHITE = 5
    GRAY = 6
    GREY = 7
    BLACK = 8

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
    # @param root
    #   root window.
    # @param canvas
    #   canvas for drawing.
    # @param scorePanel
    #   panel for displaying scores associated with the game.
    #
    def __init__(self, game, root, canvas, scorePanel=None):
        ## Number of pixels each icon falls per frame when animating.
        self.fallPerFrame = 9
        ## Interval between frames when animating falling icons, in milliseconds.
        self.fallingSpeed = 20
        ## Number of times to flash when a pair is selected.
        self.numberOfFlashes = 3
        ## Interval between flashes, in milliseconds.
        self.flashingSpeed = 50
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
        ## MainPanel.
        self.root = root
        ## Canvas.
        self.g = canvas
        ## Line width.
        self.setStroke(1)

        ## Dictionary of colors.
        self.colors = {Color.GRAY: 'gray',
                       Color.GREY: 'grey',
                       Color.RED: 'red',
                       Color.GREEN: 'green2',
                       Color.CYAN: 'cyan',
                       Color.YELLOW: 'yellow',
                       Color.WHITE: 'white',
                       Color.BLACK: 'black',
                       Color.ORANGE: 'orange'}

        ## The IGame instance for which this is the UI.
        self.game = game
        ## Score panel associated with the game.
        self.scorePanel = scorePanel

        self.g.bind("<Button-1>", self.mousePressed)
        self.g.bind("<ButtonRelease-1>", self.mouseReleased)
        self.g.bind("<B1-Motion>", self.mouseDragged)

        ## Timer instance used to animate the UI.
        self.timer = Timer(self.root, self.fallingSpeed, self.TimerCallback)
        self.timer.run()

    ## Force a repaint of this panel.
    def repaint(self):
        self.paintComponent(self.g)
        self.scorePanel.paintComponent()
        self.root.update_idletasks()

    ## Fill a rectangle.
    def fillRect(self, x, y, w, h):
        self.g.create_rectangle(
            x, y, x + w, y + h, outline='black', fill=self.color)

    ## Draw a rectangle.
    def drawRect(self, x, y, w, h):
        self.g.create_rectangle(
            x, y, x + w, y + h, outline=self.color, width=self.stroke)

    ## Line width.
    def setStroke(self, w):
        self.stroke = w

    ## Set current color.
    def setColor(self, c):
        self.color = self.colors[c]

    ## Callback for mouse button pressed.
    def mousePressed(self, event):
        if (self.flashingState > 0 or self.collapsing or self.filling):
            return

        row = event.y // GameMain.SIZE
        col = event.x // GameMain.SIZE
        if GameMain.__DEBUG__:
            print("(row,col) = (%d,%d)" % (row, col))
        self.currentCell = Cell(row, col, self.game.getIcon(row, col))
        self.repaint()

    ## Callback for mouse button released.
    def mouseReleased(self, event):
        if (self.flashingState > 0 or self.collapsing or self.filling):
            return

        # If we have selected two adjacent cells, then tell the game to try
        # to swap them.
        if (self.currentCell is not None):
            if (self.nextCell is not None):
                swapped = self.game.select([self.currentCell, self.nextCell])
                if GameMain.__DEBUG__:
                    print(swapped)
                self.repaint()
                if swapped:
                    # Successful move, start up the timer
                    self.timer.setDelay(self.flashingSpeed)
                    self.timer.restart()

        self.currentCell = None
        self.nextCell = None

    ## Callback for mouse button dragged.
    def mouseDragged(self, e):
        row = e.y // GameMain.SIZE
        col = e.x // GameMain.SIZE
        if self.currentCell is not None:
            # if the cell is adjacent to the one in which mouse was pressed,
            # record it as the nextCell
            c = Cell(row, col, self.game.getIcon(row, col))
            if self.currentCell.isAdjacent(c):
                self.nextCell = c
            else:
                self.nextCell = None
            self.repaint()

    ## The paintComponent is invoked whenever the panel needs
    #  to be rendered on the screen. In this application,
    #  repainting is normally triggered by the calls to the repaint()
    #  method in the timer callback and the keyboard event handler (see below).
    #
    def paintComponent(self, g):
        # clear background
        self.setColor(GamePanel.BACKGROUND_COLOR)
        self.fillRect(0, 0, self.game.getWidth() * GameMain.GRID_SIZE,
                      self.game.getHeight() * GameMain.GRID_SIZE)

        # paint occupied cells of the grid
        for row in range(self.game.getHeight()):
            for col in range(self.game.getWidth()):
                t = self.game.getIcon(row, col)
                if t is not None:
                    self.paintOneCell(g, row, col, t)

        if self.currentCell is not None:
            self.highlightOneCell(
                g, self.currentCell.row(), self.currentCell.col())

        if self.nextCell is not None:
            self.highlightOneCell(g, self.nextCell.row(), self.nextCell.col())

        if self.flashingState > 0:
            # need to paint the cells, since they are nulled out in game
            for p in self.cellsToCollapse:
                self.paintOneCell(g, p.row(), p.col(), p.getIcon())

            # if cells are collapsing, flash them
            if self.flashingState % 2 != 0:
                self.highlightOneCell(g, p.row(), p.col())

        if self.collapsing:
            # first grey out the column where cells are moving
            # in order to match the background
            for c in self.movingCells:
                col = c.col()
                row = c.row()
                self.paintOneCellBG(g, row, col, GamePanel.BACKGROUND_COLOR)

            for c in self.movingCells:
                col = c.col()
                pixel = c.currentPixel
                self.paintOneCellByPixel(g, pixel, col, c.getIcon())

        if self.filling:
            # first grey out the column where cells are moving
            for c in self.fillingCells:
                col = c.col()
                row = c.row()
                self.paintOneCellBG(g, row, col, GamePanel.BACKGROUND_COLOR)

            for c in self.fillingCells:
                col = c.col()
                pixel = c.currentPixel
                self.paintOneCellByPixel(g, pixel, col, c.getIcon())

    ##
    # Renders a single cell of the grid.
    #
    # @param g graphics context
    # @param row y-coordinate of the cell to render
    # @param col x-coordinate of the cell to render
    # @param t the icon to render, normally used
    #   to determine the color with which to render the cell
    #
    def paintOneCell(self, g, row, col, t):
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
    # @param g graphics context
    # @param row y-coordinate of the cell to render
    # @param col x-coordinate of the cell to render
    # @param color the color to render
    #
    def paintOneCellBG(self, g, row, col, color):
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
    # @param g graphics context
    # @param rowPixel y-coordinate of pixel at which to render the cell
    # @param col x-coordinate of the cell to render
    # @param t the icon to render, normally used
    #   to determine the color with which to render the cell
    #
    def paintOneCellByPixel(self, g, rowPixel, col, t):
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
    # @param g graphics context
    # @param row y-coordinate of the cell to highlight
    # @param col x-coordinate of the cell to highlight
    #
    def highlightOneCell(self, g, row, col):
        self.setColor(Color.WHITE)
        self.setStroke(2)
        self.drawRect(col * GameMain.SIZE, row * GameMain.SIZE,
                      GameMain.SIZE, GameMain.SIZE)
        self.setStroke(1)

    ##
    # Listener for timer events.  The actionPerformed method
    # is invoked each time the timer fires and the call to
    # repaint() at the bottom of the method causes the panel
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
                if self.scorePanel is not None:
                    self.scorePanel.updateScore(self.game.getScore())
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
            self.previousRow = startRow
            self.startPixel = startRow * GameMain.SIZE
            self.currentPixel = self.startPixel
        else:
            # pixel coordinates
            self.startPixel = cell.previousRow * GameMain.SIZE
            self.currentPixel = self.startPixel

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


## Creates a new thread.
#
class makeThread (Thread):
    """Creates a thread."""

    ## Constructor.
    #
    #  @param func function to be executed in this thread.
    #
    def __init__(self, func):
        Thread.__init__(self)
        self.__action = func
        self.debug = False
        self.__on = True

    ## Object destructor.
    #  In Python, destructors are needed much less, because Python has
    #  a garbage collector that handles memory management.
    #  However, there are other resources to be dealt with, such as:
    #  sockets and database connections to be closed,
    #  files, buffers and caches to be flushed.
    #
    def __del__(self):
        if (self.debug):
            print("Thread end")

    ## Kills this thread.
    #
    def stop(self):
        if (self.debug):
            print("Thread stop")
        self.__on = False

    ## Method representing the thread's activity.
    #  This method may be overridden in a subclass.
    #
    def run(self):
        if (self.debug):
            print("Thread begin")
        while self.__on:
            self.__action()


##
# Panel for displaying the score in a simple video game.
#
class ScorePanel:

    ##
    # Format string for displaying score.
    #
    __SCORE_FORMAT = "Score: %d"

    ## Constructor.
    def __init__(self, g):
        ## Current score.
        self.__score = 0
        ## Text object holding score.
        self.txt = None
        ## Canvas object for rendering this panel.
        self.g = g

    ##
    # Sets the score to be displayed in this panel.
    # @param newScore
    #   score to be displayed
    #
    def updateScore(self, newScore):
        ## Score to be displayed.
        self.__score = newScore
        print("\n" + ScorePanel.__SCORE_FORMAT % self.__score)

    ## Called when the score panel should be updated.
    def paintComponent(self):
        w = int(self.g.cget("width"))
        h = int(self.g.cget("height"))
        font = tkFont.Font(family="DejaVu Sans Mono", size=20, weight="bold")
        txt = ScorePanel.__SCORE_FORMAT % self.__score
        temp = self.g.create_text(
            0, 0, font=font, anchor=NW, text=txt, tag="t1")
        b = self.g.bbox(temp)
        # size of temp.
        width = b[2] - b[0]
        height = b[3] - b[1]
        x = abs(w - width) // 2
        y = abs(h - height) // 2

        self.g.delete("t1")
        if self.txt is not None:
            self.g.itemconfig(self.txt, text=txt)
        else:
            self.txt = self.g.create_text(x, y, text=txt, anchor=NW, font=font)


##
# Main class for a GUI for a Bejeweled-like game sets up a
# GamePanel instance in a frame.
#
class GameMain:
    ##
    # Number of cells in a grid row or column.
    #
    GRID_SIZE = 16

    ##
    # Number of different icons on the grid.
    #
    ICON_TYPES = 5

    ##
    # Cell size in pixels.
    #
    SIZE = 25

    ##
    # Font size for displaying score.
    #
    SCORE_FONT = 24

    ## Debugging state.
    __DEBUG__ = False

    ## Constructor.
    def __init__(self):
        ## Thread running the game.
        self.r = None

    ##
    # Helper method for instantiating the components.  This
    # method should be executed in the context of the tkinter
    # event thread only.
    #
    def create(self):

        ## create a game with 5 types of icons
        game = GameImpl(GameMain.GRID_SIZE, GameMain.GRID_SIZE,
                        BasicGenerator(GameMain.ICON_TYPES))
        if (GameMain.__DEBUG__):
            game.debug = True

        # arrange the two panels horizontally
        mainPanel = Tk()
        canvas = Canvas(mainPanel, width=game.getWidth() * GameMain.SIZE,
                        height=game.getHeight() * GameMain.SIZE, background='dark grey')
        canvas.pack(side=RIGHT, fill=BOTH, expand=YES)
        canvas2 = Canvas(mainPanel, width=game.getWidth(
        ) * GameMain.SIZE, height=game.getHeight() * GameMain.SIZE, background='white')
        canvas2.pack(side=LEFT, fill=BOTH, expand=YES)

        mainPanel.title("PIG Jewels Game")
        mainPanel.bind("<Escape>", lambda _: self.exit(mainPanel))
        mainPanel.protocol("WM_DELETE_WINDOW", self.exit)

        # create the two UI panels
        scorePanel = ScorePanel(canvas2)
        panel = GamePanel(game, mainPanel, canvas, scorePanel)

        # rock and roll...
        mainPanel.mainloop()

    ## End this program.
    def exit(self, root=None):
        if self.r:
            print("See you later alligator.")
            self.r.stop()
        sys.exit()

    ##
    # Entry point. Main thread passed control immediately
    # to the tkinter event thread.
    # @param args not used
    #
    def main(self, args=None):
        if args is None:
            args = sys.argv

        if (len(args) > 1):
            GameMain.__DEBUG__ = True

        if True:
            self.r = makeThread(self.create)
            self.r.start()
        else:
            self.create()


if __name__ == "__main__":
    sys.exit(GameMain().main())
