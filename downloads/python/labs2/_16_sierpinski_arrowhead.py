#!/usr/bin/env python
# coding: UTF-8
#
## @package _16_sierpinski_arrowhead
#
# Draws a Sierpinski arrowhead curve.
#
# Usage: _16_sierpinski_arrowhead [number_of_divisions]
#
# @author Paulo Roma Cavalcanti
# @since 22/01/2017
# @see http://paulbourke.net/fractals/gasket/
# @see https://en.wikipedia.org/wiki/Sierpinski_triangle
# @see http://ecademy.agnesscott.edu/~lriddle/ifs/siertri/siertri.htm
# @see http://www.oftenpaper.net/sierpinski.htm
# @see https://code.activestate.com/recipes/580614-sierpinski-gasket/

import sys
import math
try:
    from tkinter import *  # python 3
except ImportError:
    from Tkinter import *  # python 2

##  Creates a Sierpinski Arrowhead curve, by recursively breaking
   #  an initial line, starting at a given point, into three new segments.
   #
   #  - There will be:
   #    - @f$3^{n}@f$ red triangles or
   #    - @f$4^{n}@f$ if the fourth triangle is drawn.
   #
   #  - The number of white triangles is a Geometric Progression, starting at 1 and with ratio 3, given by:
   #     - P(0) = 0
   #     - P(n) = 3 * P(n-1) + 1
   #     - P(n) = @f$\frac{(3^n-1)}{2}.@f$
   #
   #  @param order recursion depth.
   #  @param length initial segment size.
   #
def Sierpinski_arrowhead_curve(order, length):
    global turnAngle
    global sttpt

    ## list of points (a set of lines).
    points = []

    # segment direction
    turnAngle = 0

    # curve starting point
    sttpt = [-1, -1]

    points.append(sttpt)

    ## Pushes the next point of the polyline.
    def draw_line(length):
        global sttpt
        t = math.pi * turnAngle / 180.0
        endpt = [sttpt[0] + length *
                 math.cos(t), sttpt[1] + length * math.sin(t)]
        points.append(endpt)
        sttpt = endpt

    ## Breaks a line into three new segments.
    #
    #  @param length line size.
    #  @param angle new segments make turns given by angle.
    #
    def curve(order, length, angle):
        if (0 == order):
            draw_line(length)
        else:
            order -= 1
            length /= 2
            curve(order, length, - angle)
            turn(+angle)
            curve(order, length, + angle)
            turn(+angle)
            curve(order, length, - angle)

    ## Current segment turn.
    def turn(angle):
        global turnAngle
        turnAngle += angle

    # If order is even we can just draw the curve.
    if (1 == (order & 1)):  # odd
        turn(+60)
    curve(order, length, -60)

    return points

## Draw lines, given in points, on canvas c.
def draw(c, points, contour=False):
    w = c.winfo_width() // 2
    h = c.winfo_height() // 2
    centerx = w - 2
    centery = h - 2
    #c.delete(ALL)
    for i in range(0, len(points) - 1):
        c.create_line(centerx + w * points[i][0], centery - h * points[i][1],
                      centerx + w * points[i + 1][0], centery - h * points[i + 1][1], fill='gold', width=4)

## Main program.
def main(argv=None):

    ## Resize the graphics when the window changes.
    def resize(event=None):
        global pts
        canvas.delete(ALL)
        draw(canvas, pts, cntVar.get() == 'ON')

    ## Redraw the graphics when the scale changes
    def redraw(event=None):
        global pts

        def pg(n): return (3**n - 1) // 2
        ndiv = slider.get()
        pts = Sierpinski_arrowhead_curve(ndiv, 2.0)
        lr.configure(text="Red Triangles = %d     " % (len(pts) // 3))
        la.configure(text="   White Triangles = %d" % (pg(ndiv)))
        resize(event)

    ndiv = 2

    if argv is None:
        argv = sys.argv
    if len(argv) > 1:
        try:
            ndiv = abs(int(argv[1]))
        except:
            ndiv = 3

    root = Tk()
    root.title("Sierpinski Arrowhead")
    bot = Frame(root)
    bot.pack(side=BOTTOM)
    top = Frame(root)
    top.pack(side=TOP)
    canvas = Canvas(root, width=400, height=400)
    canvas.bind("<Configure>", resize)
    canvas.pack(expand=YES, fill=BOTH)

    slider = Scale(bot, from_=0, to=8, command=redraw, orient=HORIZONTAL)
    slider.set(ndiv)
    slider.pack(side=LEFT, anchor=W)

    cntVar = StringVar()  # create a checkbutton for the drawing style
    cntVar.set("OFF")
    c = Checkbutton(bot, text="Contour", variable=cntVar,
                    onvalue="ON", offvalue="OFF", command=resize)
    c.pack(side=BOTTOM)

    fillVar = StringVar()  # create another checkbutton for the number of triangles
    fillVar.set("OFF")
    c = Checkbutton(bot, text="Fill", variable=fillVar,
                    onvalue="ON", offvalue="OFF", command=redraw)
    c.pack(side=LEFT)

    lr = Label(top, text="")
    lr.pack(side=LEFT, anchor=W)
    la = Label(top, text="")
    la.pack(side=RIGHT, anchor=E)

    redraw(None)

    mainloop()


if __name__ == '__main__':
    sys.exit(main())
