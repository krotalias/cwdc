#!/usr/bin/env python
# coding: UTF-8
#
## @package _08a_pack_circles
#
#  Packing circles is a method for filling a rectangle with 
#  non-intersecting circles of different sizes.
#
#  A simple method consists in generating random points into the
#  rectangle and computing the distance @f$d@f$ to the closest circle.
#  - The distance between two points @f$(x_1,y_1)@f$ and @f$(x_2,y_2)@f$ is: @f$d=\sqrt{(x_1-x_2)^2+(y_1-y_2)^2}@f$.
#  - If the point is inside any circle created before, it is ignored.
#  - Otherwise, it is created a circle at that position with a radius smaller than @f$d@f$.
#
#  @author Paulo Roma Cavalcanti
#  @date 25/04/2018
#

from random import random
from math import *
import sys
try:
    from tkinter import *    # python 3
except ImportError:
    from Tkinter import *    # python 2

## Canvas size.
wsize = 1000

## Drawing process.
task = None
    
def randomPoint(xmax,ymax):
    """Return a tuple (x,y) representing a random point,
    such as 0 <= x <= xmax and 0 <= y <= ymax."""

    return  (random()*xmax, random()*ymax)
    
def randomRadius (x, y, xmax, ymax, rmin, rmax):
    """Return a random radius in the range [rmin, rmax], 
    so a circle centered at (x,y) is contained into the
    rectangle given by 0 <= x <= xmax and 0 <= y <= ymax."""

    r = rmax*random()

    return max(min(r, x, y, xmax-x, ymax-y), rmin)
    
def distance2Circles(p,l):
    """Return the distance between a point p given as a tuple
    (x,y), and the closest circle among all circles kept in 
    the list l. Each circle in l is represented as a tuple 
    (x,y,r), where x,y are the coordinates of its center
    and r is the radius. 
    If p is inside a circle of radius r, this function
    returns 0. If l is empty, it returns a big number."""

    dist = 5*wsize

    # is l empty?
    if not l:
       return dist

    for c in l:
        # distance from p to the center of the circle.
        d = sqrt(sum([(u-v)**2 for u,v in zip(p,c)]))
        r = c[2]
        if d <= r:
           return 0
        dist = min(dist,d-r)

    return dist

## List of circles given as tuples (x,y,r).
circles = []

def draw():
    """Create a random circle and draw it,
    if its radius is greater than 2."""

    global canvas
    p = randomPoint(wsize,wsize)
    d = distance2Circles(p,circles)
    if d > 2:
        x,y = p[0],p[1]
        r = randomRadius(x,y,wsize,wsize,2,d)
        #print(x,y,r)
        canvas.create_oval(x-r,y-r,x+r,y+r,fill='white')
        circles.append((x,y,r))

def animation(p):
    """Toggle animation state."""

    if animation.running:
        animation.running = False
        p.stop()
    else:
        animation.running = True
        p.run()
animation.running = True
        

class Timer:
    """Keep packing (drawing) circles, after a certain time interval."""

    def __init__(self,root,callback,delay):
        self.root = root
        self.callback = callback
        self.delay = delay
        self.task = None

    def run(self):
        """"Run the callback function every delay ms."""
        self.callback()
        self.task = self.root.after(self.delay,self.run)

    def stop(self):
        """Stop the drawing process."""
        if self.task is not None: 
           self.root.after_cancel(self.task)
           self.task = None

    def restart(self):
        """Restart the drawing process."""
        self.stop()
        self.run()

def main():
    """Create a canvas and keep drawing new circles at 
    a rate of approximately 30 circles per second."""

    global canvas, root
    root = Tk()
    canvas = Canvas(root, width=wsize, height=wsize, background = 'dark grey', scrollregion=(0,0,wsize,wsize))

    # add a vertical scrollbar in case the screen is small
    vbar=Scrollbar(root,orient=VERTICAL)
    vbar.pack(side=RIGHT,fill=Y)
    vbar.config(command=canvas.yview)

    # add a horizontal scrollbar in case the screen is small
    hbar=Scrollbar(root,orient=HORIZONTAL)
    hbar.pack(side=BOTTOM,fill=X)
    hbar.config(command=canvas.xview)

    canvas.config(xscrollcommand=hbar.set,yscrollcommand=vbar.set)
    canvas.pack(side=LEFT, fill=BOTH, expand=YES)

    poll = Timer(root,draw,33)
    root.bind("<Escape>", lambda _ : root.destroy())
    root.bind("s", lambda _ : poll.stop())
    root.bind("r", lambda _ : poll.restart())
    root.bind("<space>", lambda _ : animation(poll))
    poll.run()
    root.mainloop()
    
if __name__=='__main__':
    sys.exit(main())
