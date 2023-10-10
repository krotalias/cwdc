#!/usr/bin/env python
# coding: UTF-8
#
## @package digitalClock
#
#  Creates a digital clock in a separate thread,
#  so the application using it does not stop.
#
#  @author Paulo Roma
#  @since 17/07/2012
#  @see http://eli.thegreenplace.net/2009/06/12/safely-using-destructors-in-python

import sys
import time
from distutils.util import strtobool
from threading import Thread

try:
    from mtTkinter import *   # for thread safety
except:
    from tkinter import *


## Displays in a label the current time.
#
class digitalClock:
    ## Constructor.
    #
    #  @param clock a label to display the time.
    #  @param secs number of seconds for time regressive counting.
    #  @param ent entry widget for counting down.
    #  @param time string for initializing the time. Just leave the default.
    #
    def __init__(self, clock, secs=0, ent=None, time=''):
        ## Initial number of second for the regressive chrono.
        self.nsecs = secs
        ## Not used.
        self.time1 = time
        ## Label for displaying the clock.
        self.clock = clock
        ## Entry for displaying the regressive chrono.
        self.ent = ent
        ## Chrono paused state: on of off.
        self._pause = False
        ## Chrono state: running of not running.
        self.running = False

    ##
    #  Updates the clock display.
    #
    def tick(self):
        # get the current local time from the PC
        time2 = time.strftime('%H:%M:%S')
        # if time string has changed, update it
        if time2 != self.time1:
            self.time1 = time2
            self.clock.config(text=time2)

        # Tkinter root windows have a method called "after", which can be used
        # to schedule a function to be called after a given period of time.
        # If that function, itself, calls after, you've set up an automatically
        # recurring event.

        # calls itself every 1000 milliseconds
        # to update the time display as needed
        # could use > 200ms, but display may get jerky
        self.clock.after(1000, self.tick)

    ## Pauses the regressive chrono.
    #
    def pause(self):
        self._pause = not self._pause

    ## Increments chrono time by thirty seconds.
    #
    def thirty(self):
        if not self.running:
            try:
                t = self.ent.var.get()
                t += 30  # increment time by 30s
            except Exception as e:
                print(e)
                t = 30
                #self.ent.entry.delete(0,END)
                #self.ent.entry.insert(0, str(t))
                self.ent.var.set(t)

    ## Starts a regessive chronograph by counting time backwards,
    #  from the number of seconds set, to zero.
    #
    def tickDown(self):
        if self.ent is not None:
            try:
                # get the initial time given by user
                self.nsecs = self.ent.var.get()
            except Exception as e:
                # print(e)
                self.nsecs = 0
                self.running = False

        if not self.running:
            self.running = True
            self._tickDown()

    ## Manages the process of counting time backwards.
    #
    def _tickDown(self):
        if self.ent is not None:
            if self.nsecs <= 0:  # when time left falls below zero
                self.ent.entry.delete(0, END)
                # print the message time is over in entry
                self.ent.entry.insert(0, 'Time Over')
                self.ent.entry.config({"background": "red"})
                self.running = False
            else:
                # decrement the amount of time
                if not self._pause:
                    self.nsecs -= 1

                #self.ent.entry.delete(0,END)
                #self.ent.entry.insert(0,self.nsecs)
                self.ent.var.set(self.nsecs)
                self.ent.entry.config({"background": "white"})
                # update the time left after each second
                self.ent.entry.after(1000, self._tickDown)
        else:
            # decrement the amount of time
            if not self._pause:
                self.nsecs -= 1
            self.clock.config(text=str(self.nsecs))
            # calls itself every 1 second
            # to update the time display as needed
            self.clock.after(1000, self._tickDown)


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
    #  This method may be overridden in a subclass.
    #
    def run(self):
        if (self.debug):
            print("Thread begin")
        self.__action()


## Create an entry and its associate StringVar.
class EntryWithIntVar():
    ## Constructor.
    #  @param root parent widget.
    def __init__(self, root):
        ## Var used as the textvariable of this entry.
        self.var = IntVar(root)
        ## Entry to receive the initial time of the regressive clock
        self.entry = Entry(font="times 28", width=20, background="red",
                           textvariable=self.var)
        self.entry.pack(fill=BOTH, expand=1)


## Main program for testing.
#
#  @param argv if set 'True', sets the "use thread" flag.
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    use_thread = False
    countdown = False
    if (len(argv) > 1):
        try:
            val = strtobool(argv[1])
        except ValueError:
            val = False
        finally:
            print("%sUsing thread." % ("" if val else "Not "))
        use_thread = val
        countdown = not val

    root = Tk()
    root.title("Clock")
    root.geometry('180x120+40+80')
    clock = Label(root, font=('times 28', 20, 'bold'), bg='lightgreen')
    clock.pack(fill=BOTH, expand=1)

    c = digitalClock(clock, 30)

    e1 = EntryWithIntVar(root)
    d = digitalClock(clock, 30, e1)
    # Button to start the countdown
    Button(text="Start", background="white",
           command=d.tickDown).pack(side='left')
    Button(text="Pause", background="white",
           command=d.pause).pack(side='right')
    Button(text="+30s", background="white",
           command=d.thirty).pack(side='right')

    if use_thread:
        st = makeThread(c.tick)
        st.debug = True
        st.start()
    else:
        if countdown:
            c.tickDown()
        else:
            c.tick()

    root.mainloop()


if __name__ == "__main__":
    try:
        print("Clock running")
        sys.exit(main())
    except (KeyboardInterrupt, SystemExit):
        print("Clock leaving")
