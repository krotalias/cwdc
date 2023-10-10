#!/usr/bin/env python
#
## @package _06_ping
#
# Let's say that you want to check the availability of many computers on a
# network ... you'll use ping. But there's a problem - if you "ping" a host
# that's not running, it takes a while to timeout. Therefore, when you check
# through a whole lot of systems that aren't responding,
# (the very time a quick response is probably needed),
# it can take an age.
#
# We're going to run code concurrently to ping each host computer and
# (being Python), we create an object for each of the concurrent tests
# (threads) we wish to run.
# Each of these objects inherits from the Thread class, so that we can use
# all of the logic already written in Python to provide our parallelism.
#
# Although the constructor builds the thread, it does not start it; rather,
# it leaves the thread based object at the starting gate. The start method on
# the testit object actually triggers it off - internally, by triggering the
# run method of the testit class, and then returning to the calling code.
# In other words, this is the point at which the parallel processing
# actually starts, and the run method is called indirectly
# (via a callback, in a similar way to sort and map make callbacks).
#
# Once parallel processes have started, you'll want some way to bring the
# responses back together at the end, and in this first simple example,
# it is used a join.
#
# @author Paulo Roma
# @since 22/07/2009
# @see http://www.wellho.net/solutions/python-python-threads-a-first-example.html

import os
import re
import time
import sys
import platform
from threading import Thread
from tkinter import *

## Class for pinging a given IP, in its own thread.
class testit (Thread):
    """Class for pinging a given IP, in its own thread."""

    def __init__(self, ip):
        """Constructor."""

        Thread.__init__(self)
        self.ip = ip
        self.status = -1
        if (platform.uname()[0] == "Linux"):
            # Stop after sending 2 packets.
            self.pingaling = os.popen("ping -q -c2 " + self.ip, "r")
            self.lifeline = re.compile(r"(\d) received")  # raw string
        elif (platform.uname()[0] == "Darwin"):
            # Stop after sending 2 packets.
            self.pingaling = os.popen("ping -q -c2 " + self.ip, "r")
            self.lifeline = re.compile(r"(\d) packets received")  # raw string
        else:
            # Stop after sending 2 packets.
            self.pingaling = os.popen("ping -n 2 " + self.ip, "r")
            loc = self.getLocale()
            if loc[0] == "pt_BR" and os.path.exists("C:\\Arquivos de Programas"):
                # matches a decimal integer
                self.lifeline = re.compile(r"Recebidos = (\d)")
            elif loc[0] == "en_US" or loc[0] == "English_United States":
                self.lifeline = re.compile(r"Received = (\d)")
            else:
                self.lifeline = None

    def getLocale(self):
        """Returns the current locale (language,charcode)."""

        import locale
        locale.setlocale(locale.LC_ALL, '')
        return locale.getlocale()

    def run(self):
        """Returns the status of the pinged IP."""

        while True:
            line = self.pingaling.readline()
            if not line:
                break

            # ['0'], ['2'] or []
            igot = re.findall(self.lifeline, line)

            if igot:
                self.status = int(igot[0])

def main(argv=None):
    if argv is None:
        argv = sys.argv

    if len(argv) < 4:
        bound = [1, 254]
        address = "192.168.0."
    else:
        address = argv[1]
        bound = []
        bound.append(int(argv[2]))
        bound.append(int(argv[3]))

    ladd = address.split(".")

    report = ("No response", "Partial Response", "Alive")
    pinglist = []

    def doPing():
        """Pings all hosts in the given range."""

        address = e1.get() + "." + e2.get() + "." + e3.get() + "."
        bound[0] = int(e4.get())
        bound[1] = int(e5.get())

        t0 = time.time()
        pingAll(address, bound, pinglist)
        printPing(pinglist)
        text.insert(END, "\nTime = " + str(time.time() - t0) + "s\n",)

    def pingAll(address, bound, pinglist):
        """Creates a thread for each host to be pinged."""

        for host in range(bound[0], bound[1] + 1):
            ip = address + str(host)
            current = testit(ip)
            pinglist.append(current)
            current.start()

    def printPing(pinglist):
        """Loops through all reports in pinglist and print its status."""

        for pingle in pinglist:
            # Wait until the thread terminates.
            # This blocks the calling thread until the thread whose
            # join() method is called terminates
            # - either normally or through an unhandled exception
            # - or until the optional timeout occurs.
            pingle.join()
            stat = report[pingle.status]
            if ("Alive" in stat):
                text.insert(END, "Status from " + pingle.ip +
                            " is " + stat + "\n", 'color')
            else:
                text.insert(END, "Status from " +
                            pingle.ip + " is " + stat + "\n")

    def clear():
        """Clears the text area and deletes pinglist."""

        text.delete(0.0, END)
        del pinglist[:]

    root = Tk()
    root.resizable(False, False)
    root.title('Pingador')
    root.geometry('+0+0')
    text = Text(root, height=26, width=60)
    scroll = Scrollbar(root, command=text.yview)

    text.configure(yscrollcommand=scroll.set)

    text.tag_configure('bold_italics', font=('Verdana', 12, 'bold', 'italic'))

    text.tag_configure('big', font=('Verdana', 24, 'bold'))

    text.tag_configure('color', foreground='blue',
                       font=('Tempus Sans ITC', 14))

    text.tag_configure('groove', relief=GROOVE, borderwidth=2)

    top = Frame()
    top.pack()
    bot = Frame()
    bot.pack()

    e1 = Entry(top, font="Arial 24", width=3)
    e1.insert(0, ladd[0])
    e1.pack(side="left")

    Label(top, font="Arial 24", text=".").pack(side="left")

    e2 = Entry(top, font="Arial 24", width=3)
    e2.insert(0, ladd[1])
    e2.pack(side="left")

    Label(top, font="Arial 24", text=".").pack(side="left")

    e3 = Entry(top, font="Arial 24", width=3)
    e3.insert(0, ladd[2])
    e3.pack(side="left")

    Label(top, font="Arial 24", text=".").pack(side="left")

    e4 = Entry(top, font="Arial 24", width=3)
    e4.insert(0, bound[0])
    e4.pack(side="left")

    Label(top, font="Arial 24", text="-").pack(side="left")

    e5 = Entry(top, font="Arial 24", width=3)
    e5.insert(0, bound[1])
    e5.pack(side="left")

    Button(bot, text="Ping", command=doPing).pack(side="left")
    Button(bot, text="Clear", command=clear).pack(side="right")

    text.pack(side=LEFT)
    scroll.pack(side=RIGHT, fill=Y)

    root.mainloop()


if __name__ == "__main__":
    sys.exit(main())
