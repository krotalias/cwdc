#!/usr/bin/env python
# coding: UTF-8
# license: GPL
#
## @package _08c_clock
#
#  A very simple analog clock.
#
#  The program transforms world coordinates into screen coordinates
#  and vice versa according to an algorithm found in:
#  "Programming principles in computer graphics" by Leendert Ammeraal.
#
#  Lightly based on the code of Anton Vredegoor (anton.vredegoor@gmail.com)
#
#  Installation:
#  - sudo -H pip3 install astral
#  - sudo -H pip3 install timezonefinder
#  - sudo -H pip3 install geopy
#
#  @author Paulo Roma
#  @since 01/05/2014
#  @see https://code.activestate.com/recipes/578875-analog-clock/?in=user-4189949
#  @see http://orion.lcg.ufrj.br/python/figuras/fluminense.png
#  @see https://www.timeanddate.com/time/zones/

import sys
import os
import getopt
import json
import pytz
from datetime import timedelta, datetime
from math import sin, cos, pi
from mapper2 import mapper2 as mapper
from astral import LocationInfo
from astral.sun import sun
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
from threading import Thread
try:
    from mtTkinter import *  # for thread safe
except:
    from tkinter import *

hasPIL = True
# we need PIL for resizing the background image
# in Fedora do: yum install python-pillow-tk
# or yum install python3-pillow-tk
try:
    from PIL import Image, ImageTk
except ImportError:
    hasPIL = False


## Class for creating a new thread.
#
class makeThread(Thread):
    """Creates a thread."""

    ## Constructor.
    #  @param func function to run on this thread.
    #
    def __init__(self, func):
        Thread.__init__(self)
        self.__action = func
        self.debug = False

    ## Destructor.
    #
    def __del__(self):
        if self.debug:
            print("Thread end")

    ## Starts this thread.
    #
    def run(self):
        if self.debug:
            print("Thread begin")
        self.__action()


## Class for drawing a simple analog clock.
#  The background image may be changed by pressing key 'i'.
#  The image path is hardcoded. It should be available in directory 'images'.
#
class clock:
    ## Constructor.
    #
    #  @param root Tk root window.
    #  @param place index to get city coordinates
    #  @param sImage whether to use a background image.
    #  @param w canvas width.
    #  @param h canvas height.
    #  @param useThread whether the clock should be started or not (if using a separate thread).
    #  @param debug debugging state.
    #
    def __init__(self, root, place=0, sImage=True, w=400, h=400, useThread=False, debug=False):
        ## Default window
        self.world = [-1.45, -1.45, 1.45, 1.45]
        ## Default viewport
        self.viewport = [0, 0, w, h]
        ## Image logo path
        self.imgPath = './images/fluminense.png'  # image path
        self.bezelPath = './images/rolex_bezel.png'  # image path
        if hasPIL and os.path.exists(self.imgPath):
            self.showImage = sImage
        else:
            ## Whether to use the logo image
            self.showImage = False
        ## Debugging state
        self.debug = debug

        self.setColors()
        ## Default circle radius.
        self.circlesize = 0.09
        ## Handles' tag
        self._ALL = 'handles'
        ## tkinter root
        self.root = root
        ## Viewport margin (pad)
        self.pad = w // 10
        ## Handle width
        self.hwidth = w // 40
        ## Circle and arc border width
        self.lwidth = 3
        ## Five minutes or an hour is thirty degrees
        self.fiveMin = pi / 6
        ## One minute is six degrees
        self.oneMin = pi / 30

        if self.showImage:
            ## Logo image
            self.fluImg = Image.open(self.imgPath)
            self.bezelImg = Image.open(self.bezelPath)

        self.root.bind("<Escape>", lambda _: root.destroy())
        ## UTC offset
        self.deltahours = 0
        ## A time difference of deltahours.
        self.delta = timedelta(hours=self.deltahours)
        ## Canvas for drawing
        self.canvas = Canvas(root, width=w, height=h, background=self.bgcolor)
        ## Window to Viewport mapping
        self.T = mapper(self.world, self.viewport)
        self.root.title('Clock')
        self.canvas.bind("<Configure>", self.resize)
        self.root.bind("<KeyPress-i>", self.toggleImage)
        self.root.bind("<KeyPress-n>", self.incPlace)
        self.root.bind("<KeyPress-N>", self.decPlace)
        self.canvas.pack(fill=BOTH, expand=YES)
        ## Text font
        self.font = 'Arial 18'
        ## Text font small
        self.fontSmall = 'Arial 12'
        ## Roman numerals
        self.roman = ['XII', 'I', 'II', 'III', 'IV', 'V',
                      'VI', 'VII', ' VIII', 'IX', 'X', 'XI']
        ## Decimal numerals
        self.decimal = list(map(str, range(0, 24)))
        self.decimal[0] = "24"

        ## List of available places for the clock
        self.places = []
        try:
            f = open('./localtime.txt', 'r')
            for line in f:
                self.places.append(tuple(map(
                    float, line.split(" ")[0:2])))
            f.close()
        except IOError as e:
            try:
                f = open('./localtime.json', 'r')
                # returns JSON object as a dictionary
                data = json.load(f)
                for c in data['cities']:
                    self.places.append(
                        (c['coordinates']['latitude'], c['coordinates']['longitude']))
                f.close()
            except Exception as e:
                print(e)
                print("No localtime file available")

        # Find out the clock time zone
        self.setTimeZone(place)
        ## Current clock place index
        self.placeIndex = place

        if not useThread:
            self.poll()

    ## Sets the timezone for the clock.
    #
    #  In a unix system, this information can be obtained from:
    #  - /etc/localtime -> /usr/share/zoneinfo/America/Sao_Paulo
    #
    #  @param place an index into the places list.
    #  @see https://docs.python.org/3/library/os.path.html
    #
    def setTimeZone(self, place=0):
        if self.places:
            psize = len(self.places)
            ## Current latitude and longitude
            self.latitude, self.longitude = self.places[place % psize]

            ## Clock time zone
            self.timezone = TimezoneFinder().timezone_at(
                lat=self.latitude, lng=self.longitude)
            ## Clock region and city
            self.region, self.local = self.timezone.split("/")
        elif os.path.isfile('/etc/localtime'):
            self.timezone = '/'.join(os.path.realpath(
                '/etc/localtime').split('/')[-2:])
            self.region, self.local = self.timezone.split("/")

            geolocator = Nominatim(user_agent="_08c_clock")
            self.latitude, self.longitude = geolocator.geocode(
                self.local)[-1]
            self.places.append((self.latitude, self.longitude))
        else:
            sys.exit("No valid timezone file found")

        self.deltahours = pytz.timezone(self.timezone).utcoffset(
            datetime.now()).total_seconds() / 3600

        self.delta = timedelta(hours=self.deltahours)

        city = LocationInfo(self.local, self.region, self.timezone,
                            latitude=self.latitude, longitude=self.longitude)

        today = datetime.date(datetime.now())

        # Sun rise x sun set
        sun_data = sun(city.observer, today,
                       tzinfo=pytz.timezone(self.timezone))

        hr, mr, _ = datetime.timetuple(sun_data['sunrise'])[3:6]
        hs, ms, _ = datetime.timetuple(sun_data['sunset'])[3:6]

        def dl(h, m): return 0.5 * \
            (pi - self.fiveMin * (h + m / 60)) * 180 / pi

        ## Day light arc
        self.arc = [dl(hr, mr), dl(hs, ms)]

    ## Convert a vector from polar to cartesian coordinates.
    #
    #  - Note that 0° is at three o'clock.
    #  - For the clock, however, 0° is at twelve o'clock.
    #
    #  @param angle vector angle.
    #  @param radius vector length.
    #  @return a 2D point.
    #
    def polar2Cartesian(self, angle, radius=1):
        angle = pi / 2 - angle
        return (radius * cos(angle), radius * sin(angle))

    ## Return the canvas size.
    def imgSize(self):
        width = self.canvas.winfo_width()
        height = self.canvas.winfo_height()
        size = min(width, height)
        return (width, height, int(0.9 * size))

    ## Called when the window changes, by means of a user input.
    #
    # @param event a "<Configure>" event.
    #
    def resize(self, event):
        # erase the whole canvas
        self.canvas.delete(ALL)

        width, height, size = self.imgSize()
        self.pad = size // 10
        self.hwidth = size // 60
        self.lwidth = size // 130
        self.viewport = (self.pad, self.pad, width -
                         self.pad, height - self.pad)

        # keep aspect ratio to avoid distortions
        dvx = self.viewport[2] - self.viewport[0]
        dvy = self.viewport[3] - self.viewport[1]
        box = self.world[:]
        aspect = float(dvx) / float(dvy)
        dbx = box[2] - box[0]
        dby = box[3] - box[1]
        if aspect > 1.0:
            w = dbx * aspect
            box[0] -= (w - dbx) * 0.5
            box[2] = box[0] + w
        else:
            h = dby / aspect
            box[1] -= (h - dby) * 0.5
            box[3] = box[1] + h

        self.T = mapper(box, self.viewport)

        if self.showImage:
            flu = self.fluImg.resize(
                (int(0.65 * 0.65 * size), int(0.5 * size)), Image.LANCZOS)
            ## Resized PIL logo image.
            self.flu = ImageTk.PhotoImage(flu)
            self.canvas.create_image(width // 2, height // 2, image=self.flu)

            bezel = self.bezelImg.resize(
                (int(1.05 * size), int(1.05 * size)), Image.LANCZOS)
            ## Resized PIL logo image.
            self.bezel = ImageTk.PhotoImage(bezel)
            self.canvas.create_image(width // 2, height // 2, image=self.bezel)
        else:
            self.canvas.create_rectangle(
                [[0, 0], [width, height]], fill=self.bgcolor)

        # set font size
        self.font = 'Arial {}'.format(size // 22)
        self.fontSmall = 'Arial {}'.format(size // 44)

        # redraw the clock
        self.redraw()

    ## Sets the clock colors.
    #
    def setColors(self):
        if self.showImage:
            self.bgcolor = 'antique white'
            self.timecolor = 'dark orange'
            self.circlecolor = 'dark green'
            self.bordercolor = '#8b2439'
            self.pincolor = 'white'
        else:
            ## Default background color
            self.bgcolor = '#000000'
            ## Default handle color
            self.timecolor = '#ffffff'
            ## Default circle fill color
            self.circlecolor = '#808080'
            ## Default circle outline color
            self.bordercolor = '#8b2439'
            ## Handle origin color
            self.pincolor = 'white'

    ## Toggles the displaying of a background image, when
    #  the 'i' key is pressed.
    #
    #  @param event a key pressed event.
    #
    def toggleImage(self, event):
        if hasPIL and os.path.exists(self.imgPath):
            self.showImage = not self.showImage
            self.setColors()
            self.resize(event)

    ## Redraws the whole clock.
    #
    def redraw(self):
        # draw the inner minute ticks as circles or numbers.
        for i in range(12):
            angle = i * self.fiveMin
            x, y = self.polar2Cartesian(angle, 0.98)
            if not self.showImage:
                self.paint_circle(x, y)
            else:
                self.paint_text(x, y, self.roman[i], self.bordercolor)

        # draw the outer minute ticks as circles or numbers.
        for i in range(24):
            angle = i * self.fiveMin * 0.5
            x, y = self.polar2Cartesian(angle, 1.16)
            if not self.showImage:
                self.paint_circle(x, y)
            else:
                self.paint_text(
                    x, y, self.decimal[i], self.circlecolor, font=self.fontSmall)

        # draw the handles
        self.paint_hms()
        # draw a circle at the centre of the clock
        self.paint_circle(0, 0, color=self.pincolor)
        # draw the external circle
        self.paint_circle(0, 0, radius=1.1, color='')
        # draw UTC offset and date
        y, m, d = datetime.timetuple(datetime.utcnow() + self.delta)[0:3]
        self.paint_text(
            1.45, -1.4, "UTC {}\n{}\n{}\n{} / {} / {}".format(self.deltahours, self.region, self.local, d, m, y), font=self.fontSmall)

        # draw day light arc
        self.paint_arc(0, 0, radius=1.1, *self.arc,
                       color='', border=self.timecolor)

    ## Increment the clock place.
    #
    #  @param event a key pressed event.
    #
    def incPlace(self, event):
        self.placeIndex = (self.placeIndex + 1) % len(self.places)
        self.setTimeZone(self.placeIndex)
        self.resize(event)

    ## Decrement the clock place.
    #
    #  @param event a key pressed event.
    #
    def decPlace(self, event):
        self.placeIndex = (self.placeIndex - 1) % len(self.places)
        self.setTimeZone(self.placeIndex)
        self.resize(event)

    ## Draw a handle.
    #
    # @param angle handle angle.
    # @param len handle length.
    # @param wid handle width.
    # @param color handle color.
    #
    def draw_handle(self, angle, len, wid=None, color=None):
        if color is None:
            color = self.timecolor
        cx, cy = self.polar2Cartesian(angle, 0.05)
        x, y = self.polar2Cartesian(angle, len)
        self.canvas.create_line(self.T.windowToViewport((cx, cy), (x, y)),
                                fill=color, tag=self._ALL, width=wid, capstyle=ROUND)

    ## Draws the three handles.
    #
    def paint_hms(self):
        # delete only the handles
        self.canvas.delete(self._ALL)

        # UTC time + delta hours
        h, m, s = datetime.timetuple(datetime.utcnow() + self.delta)[3:6]
        self.root.title('%02i:%02i:%02i' % (h, m, s))

        # hour handle
        self.draw_handle(self.fiveMin * (h + m / 60.0), 0.50, self.hwidth)

        # minute handle
        self.draw_handle(self.oneMin * (m + s / 60.0), 0.90, self.hwidth)

        # second handle
        self.draw_handle(self.oneMin * s, 0.95, self.hwidth // 3)

        # 24h handle
        self.draw_handle(self.fiveMin * (h + m / 60.0) * 0.5,
                         1.1, self.hwidth // 5, self.circlecolor)

    ## Draws a text at a given point.
    #
    #  @param x,y given point.
    #  @param txt text.
    #  @param color text color.
    #  @param font text font.
    #
    def paint_text(self, x, y, txt, color=None, font=None):
        if color is None:
            color = self.circlecolor
        if font is None:
            font = self.font
        tx, ty = self.T.windowToViewport((x, y))[0]
        self.canvas.create_text(
            tx, ty, text=txt, fill=color, font=font)

    ## Draws a circle at a given point.
    #
    #  @param x,y given point.
    #  @param radius circle radius.
    #  @param color circle color.
    #  @param border border color.
    #
    def paint_circle(self, x, y, radius=None, color=None, border=None):
        if color is None:
            color = self.circlecolor
        if radius is None:
            radius = self.circlesize / 2.0
        if border is None:
            border = self.bordercolor
        _, r = self.T.windowVecToViewport(0, radius)
        cx, cy = self.T.windowToViewport((x, y))[0]
        self.canvas.create_oval(
            (cx - r, cy - r), (cx + r, cy + r), fill=color, outline=border, width=self.lwidth)

    ## Draws an arc at a given point.
    #
    #  @param x,y given point.
    #  @param t0 starting angle for the slice, in degrees, measured from +x direction.
    #  @param t1 ending angle for the slice, in degrees, measured from +x direction.
    #  @param radius arc radius.
    #  @param color arc color.
    #  @param border border color.
    #
    def paint_arc(self, x, y, t0, t1, radius=None, color=None, border=None):
        if color is None:
            color = self.circlecolor
        if radius is None:
            radius = self.circlesize / 2.0
        if border is None:
            border = self.bordercolor
        _, r = self.T.windowVecToViewport(0, radius)
        cx, cy = self.T.windowToViewport((x, y))[0]
        self.canvas.create_arc(
            (cx - r, cy - r), (cx + r, cy + r), start=t0, extent=(t1 - t0), style='arc', fill=color, outline=border, width=self.lwidth)

    ## Animates the clock, by redrawing the handles,
    #  after a certain time interval.
    #
    def poll(self):
        # we only need to redraw the handles
        self.paint_hms()
        self.root.after(200, self.poll)


## Main program for testing.
#
# @param argv command line arguments
# - h help
# - p place
# - w clock width
# - a clock height
# - i no image background
# - t whether to use a separate thread for running the clock
# - v verbose mode
#
# Usage:
#  - _08c_clock.py -p 3 -w 200 -a 200 -t
#  - _08c_clock.py --place 3 --width=200 --height=200
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    place = 0
    sImage = True
    w = h = 400
    t = False
    debug = False

    try:
        try:
            # options that require an argument should be followed by a colon (:).
            # Long options, which require an argument should be followed by an equal sign ('=').
            opts, args = getopt.getopt(
                argv[1:], "hp:w:a:itv", ["help", "place=", "width=", "height=", "image", "thread", "verbose"])
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
                    "Usage {} -p <place> -w <width> -a <height> -i -t -v".format(argv[0]))
                return 1
            elif opt in ("-p", "--place"):
                place = int(arg)
            elif opt in ("-w", "--width"):
                w = int(arg)
            elif opt in ("-a", "--height"):
                h = int(arg)
            elif opt in ("-i", "--image"):
                sImage = False
            elif opt in ("-t", "--thread"):
                t = True
            elif opt in ("-v", "--verbose"):
                debug = True
    except ValueError as err:
        print(str(err) + "\nFor help, type: %s --help" % argv[0])
        return 2

    root = Tk()
    root.geometry('+0+0')
    # place: how far are you from utc?
    # Sometimes the clock may be run from another timezone ...
    c = clock(root, place, sImage, w, h, t, debug)
    # tkinter main thread MUST be in the main loop
    if t:
        st = makeThread(c.poll)
        st.debug = debug
        st.start()

    root.mainloop()


if __name__ == '__main__':
    sys.exit(main())
