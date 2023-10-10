#!/usr/bin/env python
# coding: UTF-8
#
## @package _05c_sinx_x
#
#  Draws the sinc function.
#
#  @author Paulo Roma
#  @since 01/11/2010
#  @see http://en.wikipedia.org/wiki/Sinc_function
#  @see http://orion.lcg.ufrj.br/python/figuras/flulogo.gif

import sys
import os
from math import *

hasClock = True
try:
    from digitalClock import digitalClock, makeThread
except ImportError:
    hasClock = False

try:
    from mtTkinter import *    # for thread safety
except:
    from tkinter import *

hasPIL = True
try:
    from PIL import Image, ImageTk
except ImportError:
    hasPIL = False

# Draw sinc(x).
#
#  @param c canvas.
#
def p(c):
    d = []
    vx = c.winfo_width() // 2
    vy = c.winfo_height() // 2
    for i in range(-vx, vx + 1):
        # map the range -vx,vx to -15pi,15pi
        x = 15 * pi * i / vx
        y = 1.0 if x == 0 else sin(x) / x
        # map the range 0,1 to 0,-vy
        # and translate the origin to the center
        # of the window (vx,vy)
        d += [i + vx, int(-y * vy + vy)]

    c.delete(ALL)                            # erase the whole canvas
    c.create_line(*d, fill="red", width=3)   # curve
    c.create_line(d[0], d[1], d[-2], d[-1])  # x axix
    c.create_line(vx, 0, vx, vy * 2)         # y axis

# Centre the window in the screen area.
#
#  @param w Tk root.
#
def centerWindow(w):
    # Apparently a common hack to get the window size. Temporarily hide the
    # window to avoid update_idletasks() drawing the window in the wrong
    # position.
    w.withdraw()
    w.update_idletasks()       # Update "requested size" from geometry manager

    x = w.winfo_screenwidth()
    if (x > 2000):
        x /= 2    # Probably an extended desktop
    x = (x - w.winfo_reqwidth()) / 2
    y = (w.winfo_screenheight() - w.winfo_reqheight()) / 2
    w.geometry("+%d+%d" % (x, y))

    # This seems to draw the window frame immediately, so only call deiconify()
    # after setting correct window position
    w.deiconify()

# Destructor.
# Deletes the flu image.
#
def stop():
    global flu
    flu = ""
    sys.exit()

# Redraw callback.
#
#  @param event action that caused the event.
#
def resize(event):
    p(canvas)


def main():
    global canvas

    vx = 256
    vy = vx / 2

    imgPath = './images/flulogo.gif'

    top = Tk()
    top.title("sin(x)/x")
    centerWindow(top)

    canvas = Canvas(top, width=vx * 2, height=vy * 2)
    canvas.pack(side='left', expand=YES, fill=BOTH)

    canvas.bind("<Configure>", resize)
    b = Button(top, text="TERMINATE", command=stop)
    b.pack(side='bottom')

    if hasClock:
        clock = Label(top, font=('times', 20, 'bold'), bg='gray')
        clock.pack(fill=X, side='top')
        clk = digitalClock(clock)
        st = makeThread(clk.tick)
        st.start()

    if os.path.exists(imgPath):
        if not hasPIL:
            flu = PhotoImage(file=imgPath)
        else:
            flu = Image.open(imgPath)
            flu = ImageTk.PhotoImage(flu)
        label = Label(image=flu)
        label.pack(expand=1, fill=BOTH)

    mainloop()


if __name__ == '__main__':
    sys.exit(main())
