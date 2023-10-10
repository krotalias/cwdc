#!/usr/bin/env python
# coding: UTF-8
#
## @package move
#
#  Move and animate two DNAStrand.
#
#  @author Paulo Roma
#  @since 25/12/2019
#  @see https://www.geeksforgeeks.org/python-tkinter-moving-objects-using-canvas-move-method/
#

# imports every file from tkinter and tkinter.ttk
from tkinter import *
from tkinter.ttk import *
from tkinter import font as tkFont
from DNAStrand import DNAStrand
import random
import getopt
import sys

## Class for creating two DNA Strands and matching them,
# by moving the second one to the right or to the left.
#
class GFG:
    ## Constructor.
    # Creates two DNA strands of the given size,
    # using random symbols in each position.
    # If a size is less than or equal 0, then a predefined
    # string is used instead.
    #
    # @param master root window.
    # @param n1 size of DNA1.
    # @param n2 size of DNA2.
    # @param debug toggle debugging mode.
    #
    def __init__(self, master=None, n1=9, n2=9, debug=False):
        ## master window.
        self.master = master

        ## displacement in the horizontal direction.
        # should be the width of a single character.
        self.delta = None

        ## displacement in the vertical direction.
        # should be the height of a single character.
        self.deltaY = None

        ## text x position into the canvas for both DNAs.
        self.posx = 400
        ## text y position into the canvas for DNA1.
        self.posy = 30
        ## text y position into the canvas for DNA2.
        self.posy2 = None
        ## Control the automatic movement.
        self.auto = False
        ## Running task.
        self.task = None

        ## canvas width.
        self.cx = 1100
        ## canvas height.
        self.cy = 200
        ## canvas.
        self.c = (0, self.cx, 0, self.cy)

        ## to take care of movement in x direction.
        self.x = 0
        ## to take care of movement in y direction.
        self.y = 0

        ## initial horizontal position in characters.
        self.dx = 0
        ## initial vertical position in characters.
        self.dy = 0

        ## debugging mode.
        self.debug = debug

        ## canvas object to create graphical shapes.
        self.canvas = Canvas(master, width=self.cx, height=self.cy)

        ## creating text using a mono spaced font (constant width).
        # self.font = tkFont.Font(font='TkFixedFont',size=80,weight="bold")
        self.font = tkFont.Font(
            family="DejaVu Sans Mono", size=40, weight="bold")

        ## text for DNA1.
        self.t1 = "TCATCGATA"
        ## text for DNA2.
        self.t2 = "AGAGCAT"

        ## text object into the canvas.
        self.text = None
        ## text2 object into the canvas.
        self.text2 = None

        ## text box object into the canvas.
        self.textBox = None
        ## text2 box object into the canvas.
        self.text2Box = None

        if n1 > 0:
            self.t1 = ''.join(random.choice(DNAStrand.symbols)
                              for _ in range(n1))
        if n2 > 0:
            self.t2 = ''.join(random.choice(DNAStrand.symbols)
                              for _ in range(n2))

        ## text for DNA1 with extra spaces between letters.
        self.tt1 = " ".join(self.t1)
        ## text for DNA2 with extra spaces between letters.
        self.tt2 = " ".join(self.t2)

        self.canvas.pack(side='left', fill=BOTH, expand=YES)

        txt = self.canvas.create_text(
            self.posx, self.posy, font=self.font, text='A ', anchor=NW, tag="t1")
        b = self.canvas.bbox(txt)
        ## hold the size of an upper letter.
        self.deltaU = b[2] - b[0]
        self.delta = self.deltaU - 2
        if self.debug:
            print("upper width = %d" % self.deltaU)

        self.deltaY = b[3] - b[1]
        self.posy2 = self.posy + self.deltaY
        if self.debug:
            print("upper height = %d" % self.deltaY)

        txt = self.canvas.create_text(
            self.posx, self.posy, font=self.font, text='a ', anchor=NW, tag="t1")
        b = self.canvas.bbox(txt)
        ## hold the size of a lower letter.
        self.deltaL = b[2] - b[0]
        if self.debug:
            print("lower width = %d" % self.deltaL)
        if self.debug:
            print("lower height = %d" % (b[3] - b[1]))
        self.canvas.delete("t1")

        ## DNA1.
        self.dna1 = DNAStrand(self.t1)
        ## DNA2.
        self.dna2 = DNAStrand(self.t2)

        if self.debug:
            print("canvas size: %s" % str(self.c))

        self.reset()

    ## This is the move() method.
    # Translates the second DNA in four directions: left, right, up or down.
    def movement(self):

        if self.x < 0:
            self.dx -= 1
        elif self.x > 0:
            self.dx += 1
        elif self.y > 0:
            self.dy += 1
        elif self.y < 0:
            self.dy -= 1

        # This moves a text and a rectangle to (x, y) coordinates
        if self.debug:
            self.canvas.move(self.text2Box, self.x, self.y)
        self.canvas.move(self.text2, self.x, self.y)

        b = self.canvas.bbox(self.text2)
        if b[0] > self.cx or b[2] < 0 or \
           b[1] > self.cy or b[3] < 0:
            if self.debug:
                print("  wrap-around: %d : %d" % (b[0], self.cx))
            self.reset()
            return

        if self.debug:
            print("  posx, posy = (%d, %d)" % (self.dx, self.dy))
        if self.dx > 0:
            n = self.dna1.countMatchesWithRightShift(self.dna2, self.dx)
            tt1 = self.dna1.findMatchesWithRightShift(self.dna2, self.dx)
            tt2 = self.dna2.findMatchesWithLeftShift(self.dna1, abs(self.dx))
        else:
            n = self.dna1.countMatchesWithLeftShift(self.dna2, abs(self.dx))
            tt1 = self.dna1.findMatchesWithLeftShift(self.dna2, abs(self.dx))
            tt2 = self.dna2.findMatchesWithRightShift(self.dna1, abs(self.dx))

        tt1 = " ".join(tt1)
        # This text is static. Does not move by pressing arrows.
        # However, some letters have changed from lower to upper and vice-versa.
        self.canvas.itemconfig(self.text, text=tt1)
        if self.debug:
            self.canvas.coords(self.textBox, *self.canvas.bbox(self.text))

        if True:
            tt2 = " ".join(tt2)
            self.canvas.itemconfig(self.text2, text=tt2)
            if self.debug:
                self.canvas.coords(
                    self.text2Box, *self.canvas.bbox(self.text2))

        self.master.title("DNA Strand with %d matches" % n)
        if self.debug:
            print("  matches = %d" % n)

        if self.auto:
            self.task = self.canvas.after(abs(self.dx) + 500, self.movement)

    ## For motion in negative x direction
    def left(self, event):
        if self.debug:
            print(event.keysym)
        self.x = -self.delta
        self.y = 0
        if not self.auto:
            self.movement()

    ## For motion in positive x direction
    def right(self, event=None):
        if self.debug and event:
            print(event.keysym)
        self.x = self.delta
        self.y = 0
        if not self.auto:
            self.movement()

    ## For motion in positive y direction
    def up(self, event):
        if self.debug:
            print(event.keysym)
        self.x = 0
        self.y = -self.deltaY
        if not self.auto:
            self.movement()

    ## For motion in negative y direction
    def down(self, event):
        if self.debug:
            print(event.keysym)
        self.x = 0
        self.y = self.deltaY
        if not self.auto:
            self.movement()

    ## Finishes this program.
    def exit(self, event):
        sys.exit()

    ## Resets the two DNAs to their initial positions.
    def reset(self, event=None):
        if self.debug and event is not None:
            print(event.keysym)
        self.dx = self.dy = 0
        self.x = self.y = 0

        if self.text is None:
            self.text = self.canvas.create_text(
                self.posx, self.posy, font=self.font, text=self.tt1, anchor=NW, tag="t1")
            if self.debug:
                self.textBox = self.canvas.create_rectangle(
                    *self.canvas.bbox(self.text), outline="black", tag="r1")
        else:
            self.canvas.coords(self.text, self.posx, self.posy)
            if self.debug:
                self.canvas.coords(self.textBox, *self.canvas.bbox(self.text))

        if self.text2 is None:
            self.text2 = self.canvas.create_text(
                self.posx, self.posy2, font=self.font, text=self.tt2, anchor=NW, tag="t2")
            if self.debug:
                self.text2Box = self.canvas.create_rectangle(
                    *self.canvas.bbox(self.text2), outline="black", tag="r2")
        else:
            self.canvas.coords(self.text2, self.posx, self.posy2)
            if self.debug:
                self.canvas.coords(
                    self.text2Box, *self.canvas.bbox(self.text2))

        if self.debug:
            print("reset")
            print("  text box: %s" % str(self.canvas.bbox(self.text)))
            print("  text2 box: %s" % str(self.canvas.bbox(self.text2)))

        if self.auto:
            if self.task is not None:
                self.canvas.after_cancel(self.task)
                self.task = None
            self.movement()
            self.right()
        else:
            self.movement()

    ## Shuffles the second DNA.
    def shuffle(self, event):
        if self.debug:
            print(event.keysym)
        l = list(self.t2)
        random.shuffle(l)
        self.t2 = ''.join(l)
        self.tt2 = ' '.join(l)
        self.dna2 = DNAStrand(self.t2)
        self.reset(event)

    ## Help.
    def help(self, event):
        print("\n")
        print("DNA Strand - T matches A and C matches G")
        print(u'\u2192'" : move right")
        print(u'\u2190'" : move left")
        print(u'\u2191'" : move up")    # up arrow
        print(u'\u2193'" : move down")  # down arrow
        print("Shift-L: shuffle")
        print("Tab: reset")
        print("Escape: exit")
        print("h: help")
        print("m: go to position of maximum matches")
        print("a: start automatic movement")
        print("s: stop automatic movement")

    ## Resize the window.
    def resize(self, event):
        self.cx = self.canvas.winfo_width()
        self.cy = self.canvas.winfo_height()
        if self.cx < 10:
            return
        b = self.canvas.bbox(self.text)
        self.posx = (self.cx - (b[2] - b[0])) / 2.0
        self.posy = (self.cy / 2.0 - (b[3] - b[1]))
        self.posy2 = self.deltaY + self.posy
        self.reset()

    ## Go to the position of the maximum number of matches.
    def maximum(self, event):
        m, pos = self.dna1.findMaxPossibleMatches(self.dna2)
        self.reset(event)
        for _ in range(abs(pos)):
            if pos >= 0:
                self.right(event)
            else:
                self.left(event)

    ## Stop the automatic movement.
    def stopmove(self, event):
        self.auto = False

    ## Start the automatic movement.
    def automove(self, event):
        if not self.auto:
            self.auto = True
            self.right()
            self.movement()

##
# Instantiates an object of class Tk, responsible for creating
# a tkinter toplevel window. Accepts, in the command line,
# four arguments:
#
# @param argv command line arguments
# - h help
# - n DNA1 size
# - m DNA2 size
# - v verbose mode
#
# Usage:
# - move.py -n 6 -m 7 -v or
# - move.py --dna1=6 --dna2=7 -v or
# - move.py --help
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    n1 = n2 = 0
    debug = False

    try:
        try:
            # options that require an argument should be followed by a colon (:).
            # Long options, which require an argument should be followed by an equal sign ('=').
            opts, args = getopt.getopt(
                argv[1:], "hn:m:v", ["help", "dna1=", "dna2=", "verbose"])
        except getopt.GetoptError as msg:
            raise ValueError(str(msg))
        # opts is an option list of pairs [(option1, argument1), (option2, argument2)]
        # args is the list of program arguments left after the option list was stripped
        # for instance, "move.py -h --help 1 2", sets opts and args to:
        # [('-h', ''), ('--help', '')] ['1', '2']
        # something such as [('-h', '')] or [('--help', '')]
        for opt, arg in opts:
            if opt in ("-h", "--help"):
                print("Usage move.py -n1 <DNA1_length> -n2 <DNA2_length> -v")
                return 1
            elif opt in ("-n", "--dna1"):
                n1 = int(arg)
            elif opt in ("-m", "--dna2"):
                n2 = int(arg)
            elif opt in ("-v", "--verbose"):
                debug = True
    except ValueError as err:
        print(str(err) + "\nFor help, type: %s --help" % argv[0])
        return 2

    master = Tk()
    master.title("DNA Strand")
    gfg = GFG(master, n1, n2, debug)

    # This will bind arrow keys to the tkinter
    # toplevel which will navigate the image or drawing
    master.bind("<KeyPress-Left>", lambda e: gfg.left(e))
    master.bind("<KeyPress-Right>", lambda e: gfg.right(e))
    master.bind("<KeyPress-Up>", lambda e: gfg.up(e))
    master.bind("<KeyPress-Down>", lambda e: gfg.down(e))
    master.bind("<Escape>", lambda e: gfg.exit(e))
    master.bind("<Tab>", lambda e: gfg.reset(e))
    master.bind("<Shift_L>", lambda e: gfg.shuffle(e))
    master.bind("<Configure>", lambda e: gfg.resize(e))
    master.bind("h", lambda e: gfg.help(e))
    master.bind("m", lambda e: gfg.maximum(e))
    master.bind("a", lambda e: gfg.automove(e))
    master.bind("s", lambda e: gfg.stopmove(e))

    # Infinite loop breaks only by interrupt
    mainloop()


if __name__ == "__main__":
    sys.exit(main())
