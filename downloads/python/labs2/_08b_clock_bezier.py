#!/usr/bin/env python
# coding: UTF-8
#
## @package _08b_clock_bezier
#
# This most entertaining program was written in Tcl/Tk by Scott Hess
# (shess@winternet.com).  It's a clock that uses a bezier curve anchored
# at four points - the hour position, the minute position, the second
# position and the center of the clock - to show the time.
#
# Mouse <Button-1> switches between display modes, and mouse <Button-2>
# switches between line thicknesses.
#
# This program needs a tcl compiled with threads enabled,
# or alternatively, to replace Tkinter for mtTkinter.
#
# @author Paulo Roma
# @since 2009/08/06
# @see http://www.tcl.tk/software/plugin/bclock.html


import sys
import time
from threading import Thread
from math import pi, sin, cos

try:
    from tkinter import *      # pyhton3
except ImportError:
    try:
        from mtTkinter import *
    except ImportError as msg:
        print(msg)
        sys.exit("mtTkinter not found: http://tkinter.unpythonic.net/wiki/mtTkinter")

# hand types
types = ["normal", "curve", "angle", "bezier"]

## Holds clock handles shape and size.
class _hand:
    def __init__(self, zero=0.0, h=0.40, m=0.75, s=0.85):
        """Constructor."""

        self.__hour = h
        self.__minute = m
        self.__second = s
        self.___0 = zero

        self.__intick = 0.95
        self.__outtick = 1.00
        self.__width = 0.05
        self.__scale = 100
        self.__type = "bezier"
        self.__tindx = 3

    def getWidth(self):
        return self.__width

    def getScale(self):
        return self.__scale

    def getTindx(self):
        return self.__tindx

    def getType(self):
        return self.__type

    def setType(self, t):
        self.__type = t

    def setTindx(self, t):
        self.__tindx = t

    def setWidth(self, w):
        self.__width = w

    def setScale(self, s):
        self.__scale = s

    def setInTick(self, i):
        self.__intick = i

    def setOutTick(self, o):
        self.__outtick = o

    def getCurveData(self, type):
        """Returns the data for each type of clock."""

        if (type == "normal"):
            return [self.__minute, self.___0, self.___0, self.__second, self.___0,
                    self.___0, self.__hour, self.___0, self.___0, self.__minute]
        elif (type == "curve"):
            return [self.__minute, self.___0, self.__second, self.___0, self.__hour,
                    self.___0, self.__minute]
        elif (type == "angle"):
            return [self.__minute, self.__second, self.__second, self.__hour]
        elif (type == "bezier"):
            return [self.__minute, self.__second, self.___0, self.__hour]
        elif (type == "tick"):
            return [self.__intick, self.__outtick]
        else:
            return []


pi180 = pi / 180.0
resize = True
mw = Tk()
mw.title("Clock Bezier")
mw.geometry('+0+0')
clock = Canvas()
hand = _hand()
clock_on = True

def buildClock(e):
    """Build the clock. Puts tickmarks every 30 degrees, tagged
       "ticks", and prefills the "hands" line.
    """

    global resize

    clock.delete("marks")
    clock.update()
    if (resize and e):
        if (e.width > e.height):
            w = str(e.height)
        else:
            w = str(e.width)
    else:
        w = clock.cget("width")
    mw.geometry(w + "x" + w)    # ensure clock is square
    hand.setScale(int(w) / 2.0)

    # This is a horrid hack. Use the hands( ) procedure to
    # calculate the tickmark positions by temporarily changing
    # the clock type.

    type = hand.getType()
    hand.setType('tick')
    angles = _hand()
    for i in range(0, 12):
        j = i * 30 * pi180
        angles.setInTick(j)
        angles.setOutTick(j)
        clock.create_line(hands(angles), tags=("ticks", "marks"))
    hand.setType(type)

    clock.create_line(0, 0, 0, 0, smooth=True, tags=("hands", "marks"))
    clock.itemconfigure("marks", capstyle="round",
                        width=hand.getWidth() * hand.getScale())

def hands(aa):
    """Calculate the set of points for the current hand type and
       the angles in the passed array.
    """

    global hand
    ss = hand.getScale()
    points = []
    la = aa.getCurveData(hand.getType())
    lh = hand.getCurveData(hand.getType())

    for desc in range(0, len(lh)):
        points.append(sin(la[desc]) * lh[desc] * ss + ss)
        points.append(ss - cos(la[desc]) * lh[desc] * ss)
    return points

def incrType(e):
    """Goes to the next clock type."""

    global hand
    hand.setTindx(hand.getTindx() + 1)
    hand.setType(types[hand.getTindx() % len(types)])

def incrWidth(e):
    """Goes to the next clock width."""

    global hand
    w = hand.getWidth() + 0.05
    if w > 0.25:
        hand.setWidth(0)
    else:
        hand.setWidth(w)
    clock.itemconfigure("marks", width=hand.getWidth() * hand.getScale())

def setClock(hour, minute, second):
    """Calculate the angles for the second, minute, and hour hands,
       and then update the clock hands to match.
    """

    k = 6 * pi180
    second *= k
    minute *= k
    angles = _hand(0.0, hour * 5 * k + minute / 12, minute, second)

    sector = int(second + 0.5)
    colors = ["cyan", "green", "blue", "purple", "red", "yellow", "orange"]
    clock.itemconfigure("hands", fill=colors[sector])

    clock.coords("hands", *hands(angles))

def getTime():
    """Returns the current time: hours, minutes and seconds."""

    t = list(time.localtime(time.time()))
    return (t[3], t[4], t[5])

def updateClock():
    """Updates the hands of the clock each second."""

    while clock_on:
        h, m, s = getTime()
        setClock(h, m, s)
        mw.title("%d:%02d:%02d" % (h, m, s))
        time.sleep(1.0)

def stopClock():
    global clock_on

    clock_on = False

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

    ## Method representing the thread's activity.
    #  This method may be overriden in a subclass.
    #
    def run(self):
        if (self.debug):
            print("Thread begin")
        self.__action()

## Creates a thread for the clock.
def trigger():
    """Creates a thread for the clock."""

    #thread.start_new_thread ( updateClock, () )
    st = makeThread(updateClock)
    st.start()

def main():
    """Main program."""

    clock.config(width=200, height=200)
    clock.pack(expand=YES, fill=BOTH)
    clock.bind("<Configure>", buildClock)
    clock.bind("<Button-1>", incrType)     # mouse left button
    clock.bind("<Button-2>", incrWidth)    # mouse middle button
    clock.pack()
    buildClock(None)

    trigger()

    clock.mainloop()


try:
    if __name__ == "__main__":
        sys.exit(main())
except (KeyboardInterrupt, SystemExit) as msg:
    stopClock()
    #quit("Stopping the clock")
    sys.exit(0)
