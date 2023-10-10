#!/usr/bin/env python
# coding: UTF-8
#
## @package SimulationPanel
#
#  SimulationPanel is a class for filling a rectangle with
#  non-intersecting circles representing diseases.
#
#  @author Paulo Roma Cavalcanti
#  @date 14/05/2020
#
#  @see https://bic-berkeley.github.io/psych-214-fall-2016/sys_path.html
#
from __future__ import print_function
import sys
import os
sys.path.append(os.getenv("HOME") + '/html/python/labs2')

from random import random
import getopt
from math import *
from slugify import slugify
from MyWorld import MyWorld
from mapper import mapper
from World import World
from Actor import Actor
from Disease import Disease
from IDisease import IDisease
from IWorld import IWorld
from colors import COLORS
try:
    from Tkinter import *    # python 2
    from io import BytesIO as StringIO
except ImportError:
    from tkinter import *    # python 3
    from io import StringIO

## Class for presenting the simulation in a graphical form.
class SimulationPanel:
    ## Initial window size.
    WSIZE = 720

    ## Viewport margin.
    margin = 10

    ## Constructor.
    #
    #  @param canvas drawing object.
    #  @param world Simulation environment.
    #
    def __init__(self, world, canvas):
        ## Canvas width.
        self.wsizex = SimulationPanel.WSIZE

        ## Canvas height.
        self.wsizey = SimulationPanel.WSIZE

        ## Debugging state.
        self._debug = False

        ## Simulation world.
        self.world = world

        ## Canvas for drawing.
        self.canvas = canvas

        ## Mapper for going to and from viewport.
        self.wvmap = None

        ## dictionary of circles: (xc,yc) -> r
        self.dcirc = {}

        ## color index to address COLORS table.
        self.cindex = 0

        ## animation state.
        self.running = True

    ## Return the distance between a point p given as a tuple
    #  (x,y), and the closest circle among all circles kept in
    #  the dictionary circ.
    #
    #  Each circle in circ is represented as a tuple (xc,yc) associated to r:
    #  - where x,y are the coordinates of its center
    #  - and r is its radius.
    #
    #  @param p a point.
    #  @param circ dictionary of circles.
    #  @param inTest whether to check if p is into any circle.
    #
    #  @return
    #    - (xc,yc) if p is into any circle and inTest is True, or
    #    - a big number if circ is empty, or
    #    - the minimum distance from p to any circle in circ.
    #
    def distance2Circles(self, p, circ, inTest=False):
        dist = sys.maxsize

        # is circ empty?
        if not circ:
            return dist

        for c in circ:
            # distance from p to the center of the circle.
            d = sqrt(sum([(u - v)**2 for u, v in zip(p, c)]))
            r = circ[c]
            if d <= r:
                # point p is inside circle c
                if inTest:
                    return c
                continue
            dist = min(dist, d - r)

        return dist

    ## Create the border of the self.world as a rectangle
    #  and draw all objects in it as circles.
    #
    def draw(self):

        grid = self.world.getWidth() < 20

        w = self.world.getWidth() - 1
        h = self.world.getHeight() - 1
        p = self.wvmap.windowToViewport((0, 0), (w, h))
        ox, oy = p[0]
        vx, vy = p[1]

        self.canvas.delete(ALL)
        #self.canvas.delete('circles')

        dx = float(vx - ox) / w
        if grid:  # vertical lines
            k = ox
            while k < vx:
                self.canvas.create_line(k, oy, k, vy, fill='black')
                k += dx

        kmx = ox + float(vx - ox) * 0.5
        self.canvas.create_line(kmx, oy, kmx, vy, fill='red', width=3)

        dy = float(vy - oy) / h
        if grid:  # horizontal lines
            k = oy
            while k < vy:
                self.canvas.create_line(ox, k, vx, k, fill='black')
                k += dy

        kmy = oy + float(vy - oy) * 0.5
        self.canvas.create_line(ox, kmy, vx, kmy, fill='red', width=3)

        self.canvas.create_rectangle(*p)
        for o in self.world.getObjects():
            o.act()
            if self._debug:
                print(o)
            x, y = map(
                int, *(self.wvmap.windowToViewport((o.getX(), o.getY()))))
            rmax = max(min(abs(x - kmx), abs(vx - x), abs(y - kmy), abs(vy - y), x - ox, y - oy,
                       self.distance2Circles((x, y), self.dcirc)), 4)
            if isinstance(o, IDisease):
                r = max(o.getStrength() % rmax, o.getGrowthCondition()[0])
            else:
                r = 5
            self.dcirc[(x, y)] = r
            color = COLORS[self.cindex % len(COLORS)]
            self.cindex += 1
            if self._debug:
                print(color)
            self.canvas.create_oval(
                x - r, y - r, x + r, y + r, fill=color, tag='circles')

    ## Resize window.
    def resize(self, event=None):
        self.wsizex = self.canvas.winfo_width()
        self.wsizey = self.canvas.winfo_height()

        viewport = [SimulationPanel.margin,
                    SimulationPanel.margin,
                    self.wsizex - SimulationPanel.margin,
                    self.wsizey - SimulationPanel.margin]
        # maps the world rectangle onto a viewport of wsizex X wsizey pixels.
        self.wvmap = mapper([0, 0, self.world.getWidth() - 1, self.world.getHeight() - 1],
                            viewport, False, False)

        self.dcirc = {}
        self.draw()

    ## Callback for mouse button 1 pressed.
    def mousePressed1(self, event):
        x = self.canvas.canvasx(event.x)
        y = self.canvas.canvasy(event.y)
        col, row = map(lambda x: int(x + 0.5),
                       self.wvmap.viewportToWindow(x, y))
        if col < 0 or col >= self.world.getWidth() or row < 0 or row >= self.world.getHeight():
            return
        if self._debug:
            print("(x,y) = (%d,%d)" % (x, y))
            print("(col,row) = (%d,%d)" % (col, row))

        try:
            obj = Disease() if isinstance(self.world, IWorld) else Actor()
            depth = self.world.addObject(obj, col, row)
        except (SyntaxError, ValueError) as e:
            print(e)
            return

        obj = self.world._World__grid[row][col][depth - 1]
        if self._debug:
            print('Object %d, depth = %d' % (obj.getID(), depth))
        if isinstance(obj, IDisease):
            obj.setGrowthCondition(self.world.getTemp(
                obj.getQuadrant()) - 1, self.world.getTemp(obj.getQuadrant()) + 1, 2)
        self.draw()

    ## Callback for mouse button 3 pressed.
    def mousePressed3(self, event):
        x = self.canvas.canvasx(event.x)
        y = self.canvas.canvasy(event.y)
        d = self.distance2Circles((x, y), self.dcirc, True)
        if isinstance(d, tuple):
            col, row = map(lambda x: int(x + 0.5),
                           self.wvmap.viewportToWindow(d[0], d[1]))
            obj = self.world._World__grid[row][col][0]
            if obj:
                print("(x,y,r) = (%d,%d,%d)" % (x, y, self.dcirc[d]))
                print("(col,row) = (%d,%d)" % (col, row))
                print(obj)

    ## Save simulation data onto a file.
    #
    #  @param fname file to be written.
    #
    def printData(self, fname=None):
        if not isinstance(self.world, IWorld):
            return
        if fname is None:
            f = StringIO()
        else:
            f = open(fname, 'w')
        f.write('NumDiseases=%d\n' % self.world.numberOfObjects())
        f.write('Locations=')
        objs = self.world.getObjects()
        n = len(objs) - 1
        def chend(i, j): return ';' if i < j else ''
        for i, o in enumerate(objs):
            f.write("%d,%d%s" % (o.getX(), o.getY(), chend(i, n)))
        f.write("\n")
        f.write('DiseasesGrowth=')
        for i, o in enumerate(objs):
            r, l, h = o.getGrowthCondition()
            f.write("%.1f,%.1f,%.1f%s" % (l, h, r, chend(i, n)))
        f.write("\n")
        f.write('Temperature=')
        for q in range(4):
            f.write("%d%s" % (self.world.getTemp(q), chend(q, 3)))
        if fname is None:
            return f
        else:
            f.close()

    ## Return a string representation of the simulation data.
    def __str__(self):
        f = self.printData()
        st = f.getvalue()
        f.close()
        return st

    ## Toggle animation.
    #
    #  @param p Timer controlling animation.
    #
    def animation(self, p):
        if self.running:
            self.running = False
            p.stop()
        else:
            self.running = True
            p.restart()

    ## Help.
    def help(self, event):
        print("\n")
        print("SimulationPanel - Disease Simulation")
        print("Escape: exit")
        print("h: help")
        print("p: save all diseases to file")
        print("d: print simulation data")
        print("s: stop animation")
        print("r: restart animation")
        print("<space>: toggle animation")
        print("<Button 1>: insert new disease")
        print("<Button 3>: print disease information")


class Timer:
    """Keep packing (drawing) circles, after a certain time interval."""

    def __init__(self, root, callback, delay):
        self.root = root
        self.callback = callback
        self.delay = delay
        self.task = None

    def run(self):
        """"Run the callback function every delay ms."""
        self.callback()
        self.task = self.root.after(self.delay, self.run)

    def stop(self):
        """Stop the drawing process."""
        if self.task is not None:
            self.root.after_cancel(self.task)
            self.task = None

    def restart(self):
        """Restart the drawing process."""
        self.stop()
        self.run()

## Create a canvas and keep iterating at
#  a rate of approximately 30 circles per second.
#
#  @param argv command line arguments:
#  - h help
#  - w width of the grid
#  - h height of the grid.
#  - v verbose mode
#
#  Usage:
#  - SimulationPanel.py -w 6 -h 7 -v or
#  - SimulationPanel.py --width=6 --height=7 -v or
#  - SimulationPanel.py --help
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    n1 = n2 = 0
    f = 'simulation.config.saved'
    debug = False

    try:
        try:
            # options that require an argument should be followed by a colon (:).
            # Long options, which require an argument should be followed by an equal sign ('=').
            opts, args = getopt.getopt(argv[1:], "hx:y:f:v", [
                                       "help", "width=", "height=", "file=", "verbose"])
        except getopt.GetoptError as msg:
            raise ValueError(str(msg))
        # opts is an option list of pairs [(option1, argument1), (option2, argument2)]
        # args is the list of program arguments left after the option list was stripped
        # for instance, "move.py -h --help 1 2", sets opts and args to:
        # [('-h', ''), ('--help', '')] ['1', '2']
        # something such as [('-h', '')] or [('--help', '')]
        for opt, arg in opts:
            if opt in ("-h", "--help"):
                print("Usage SimulationPanel.py -x <width> -y <height> -v")
                return 1
            elif opt in ("-x", "--width"):
                n1 = max(int(arg), 2)
                if n2 == 0:
                    n2 = n1
            elif opt in ("-y", "--height"):
                n2 = max(int(arg), 2)
                if n1 == 0:
                    n1 = n2
            elif opt in ("-f", "--file"):
                f = slugify(arg)
            elif opt in ("-v", "--verbose"):
                debug = True
    except ValueError as err:
        print(str(err) + "\nFor help, type: %s --help" % argv[0])
        return 2

    if (n1 + n2) > 0:
        world = World(n1, n2)
    else:
        world = MyWorld()

    root = Tk()
    canvas = Canvas(root, width=SimulationPanel.WSIZE, height=SimulationPanel.WSIZE, background='dark grey',
                    scrollregion=(0, 0, SimulationPanel.WSIZE, SimulationPanel.WSIZE))
    root.title("Simulador de Doenças")

    # add a vertical scrollbar in case the screen is small
    vbar = Scrollbar(root, orient=VERTICAL)
    vbar.pack(side=RIGHT, fill=Y)
    vbar.config(command=canvas.yview)

    # add a horizontal scrollbar in case the screen is small
    hbar = Scrollbar(root, orient=HORIZONTAL)
    hbar.pack(side=BOTTOM, fill=X)
    hbar.config(command=canvas.xview)

    canvas.config(xscrollcommand=hbar.set, yscrollcommand=vbar.set)
    canvas.pack(side=LEFT, fill=BOTH, expand=YES)

    sp = SimulationPanel(world, canvas)
    sp._debug = debug
    poll = Timer(root, sp.draw, 500)
    canvas.bind("<Configure>", sp.resize)
    root.bind("<Escape>", lambda _: root.destroy())
    root.bind("s", lambda _: poll.stop())
    root.bind("r", lambda _: poll.restart())
    root.bind("p", lambda _: sp.printData(f))
    root.bind("h", lambda e: sp.help(e))
    root.bind("d", lambda _: print(sp))
    root.bind("<space>", lambda _: sp.animation(poll))
    root.bind("<Button-1>", lambda e: sp.mousePressed1(e))
    root.bind("<Button-3>", lambda e: sp.mousePressed3(e))
    sp.resize()
    poll.run()
    root.mainloop()


if __name__ == '__main__':
    sys.exit(main())
