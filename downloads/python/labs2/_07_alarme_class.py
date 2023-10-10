#!/usr/bin/env python
# coding: UTF-8
#
## @package _07_alarme_class
#
#  Creates a class alarm to wake up at a given time
#  and play a song.
#
#  @see http://docs.python.org/library/time.html
#  @see http://docs.python.org/library/thread.html
#  @see http://www.mpg123.de/
#
#  @author Paulo Roma
#  @since 19/07/2009

import time
import pickle
import signal
import os
import platform
import sys
import datetime
from threading import Thread
from subprocess import Popen, call
try:                                                  # python3
    from tkinter import *
    import tkinter.filedialog as tk_FileDialog
except ImportError:
    from mtTkinter import *
    import tkFileDialog as tk_FileDialog

## Class for adjusting the environment, according to the operating system and locale:
#     bindir, tempdir, and execdir.
class location:
    def __init__(self):
        self.__os = platform.uname()[0]
        if (self.__os == "Linux"):
            self.__bindir = "/usr/bin/"
            self.__tempdir = "/tmp/"
            self.__exe = ""
        elif (self.__os == "Darwin"):
            self.__bindir = "/Applications/"
            self.__tempdir = "/tmp/"
            self.__exe = ""
        else:                                       # windows
            lc = self.getLocale()
            self.__tempdir = os.environ.get('TEMP') + self.slash()
            self.__exe = ".exe"
            if (lc[0] == "pt_BR" and os.path.exists("C:\\Arquivos de Programas")):
                self.__bindir = "C:\\Arquiv~1\\"    # short 8.3 DOS file name
            else:                                   # consider English
                self.__bindir = "C:\\Progra~1\\"

    def getLocale(self):
        """Returns the current locale (language,charcode)."""

        import locale
        locale.setlocale(locale.LC_ALL, '')
        return locale.getlocale()

    def slash(self): return os.sep
    def bindir(self): return self.__bindir
    def exe(self): return self.__exe
    def os(self): return self.__os
    def tempdir(self): return self.__tempdir

## Builds an alarm for playing a music (mp3 file) at a pre-determined time.
class alarm:
    debug = False  # debugging state

    def __init__(self, loc, h=12, m=0):
        """Constructor. Sets the starting time."""

        ## it can be anything
        self.__player = "mpg123"
        ## hour to start the alarm
        self.__hour = h
        ## minute to stop the alarm
        self.__minute = m
        ## player process
        self.__pp = None
        ## process id of the running player
        self.__pid = 0
        ## thread id of the alarm
        self.__tid = 0
        ## alarm state: ON or OFF
        self.__on = True
        ## selects the threading model
        self.__useThreading = True
        ## locale information
        self.__loc = loc

        if (loc.os() == "Linux"):
            ## the root of the music directory
            self.__root = "/home/mp3/"
            self.__dplayer = {
                "audacious": ["audacious", "audacious"],
                "amarok": ["amarok", "amarok"],
                "mpg123": ["mpg123", "mpg123"],
                "gstreamer": ["gst-launch-1.0", "gstreamer"],
                "rhythmbox": ["rhythmbox", "rhythmbox"],
                "vlc": ["vlc", "vlc"],
                "smplayer": ["smplayer", "smplayer"],
                "xmms": ["xmms", "xmms"]
            }
        elif (loc.os() == "Darwin"):
            self.__root = "/Users/roma/mp3/"
            self.__dplayer = {
                "mpg123": ["../opt/local/bin/mpg123", "mpg123"],
                "vlc": ["VLC.app/Contents/MacOS/VLC", "vlc"],
                "iTunes": ["iTunes.app/Contents/MacOS/iTunes", "itunes"],
                "gstreamer": ["../opt/local/bin/gst-launch-1.0", "gstreamer"],
                "smplayer": ["SMPlayer.app/Contents/MacOS/mplayer", "mplayer"],
                "xmms": ["../opt/local/bin/xmms", "xmms"]
            }
        else:        # windows
            ## the root of the music directory
            self.__root = "W:\\"
            self.__dplayer = {
                "mpg123": ["mpg123\\mpg123", "mpg123"],
                "qcdplayer": ["Quintessential Player\\QCDPlayer", "Quintessential Player"],
                "vlc": ["VideoLAN\\VLC\\vlc", "vlc"],
                "smplayer": ["SMPlayer\\smplayer", "smplayer"],
                "mplayer2": ["Windows Media Player\\mplayerc", "Windows Media Classic"],
                "wmplayer": ["Windows Media Player\\wmplayer", "Windows Media Player"]
            }

        self.setPlayer(self.__player)

        # the following code has to be adapted for each user
        # it is supposed a music path of this form: root/artist/album/track
        artist = ""
        album = "Rock of Ages Original Broadway Cast Recording"
        track = "22 - Don't Stop Believin'.mp3"
        song = self.getInitialDir() + artist + loc.slash() + \
            album + loc.slash() + track
        if (not os.path.exists(song)):
            song = "http://dl.lcg.ufrj.br/python/videos/01 - Minha Musica.mp3"
            song.replace(" ", "%20")

        self.setSong(song)

    def __del__(self):
        """Destructor. Stops the music, before quitting."""

        self.stop()

    def setTime(self, h=12, m=0):
        """Sets a new starting time."""

        self.__hour = h
        self.__minute = m

    def getTime(self):
        """Returns the current time: hour and minute."""

        dt = list(time.localtime(time.time()))
        return (int(dt[3]), int(dt[4]), int(dt[5]))

    def __start__(self):
        """Triggers the alarm."""

        while (self.__on):
            if (alarm.debug):
                print(self.__on)
            h, m, s = self.getTime()

            # print how much time left for starting the alarm
            # dt = ("%2d:%2d:%2d" % (h,m,s)).replace (" ","0")
            at = datetime.datetime(1, 1, 1, self.__hour, self.__minute, 0)
            ct = datetime.datetime(1, 1, 1, h, m, s)
            dt = str(at - ct).split()
            root.title(dt[-1])

            if self.__hour == h and self.__minute == m:
                if (not self.__pid):
                    self.play()
                    root.title("Alarm")
                #return      # in case someone wants to finish the alarm thread now
            # Suspend execution for the given number of seconds
            time.sleep(1.0)
        # if we get here, the thread is finished
        self.__tid = 0

    ## Class for creating a new thread.
    #
    class makeThread (Thread):
        """Creates a thread."""

        ## Constructor.
        #
        #  @param func function to run on this thread.
        #
        def __init__(self, func):
            Thread.__init__(self)
            self.__action = func

        ## Object destructor.
        #  In Python, destructors are needed much less, because Python has
        #  a garbage collector that handles memory management.
        #  However, there are other resources to be dealt with, such as:
        #  sockets and database connections to be closed,
        #  files, buffers and caches to be flushed.
        #
        def __del__(self):
            if (alarm.debug):
                print("Thread end")

        ## Starts this thread.
        # Method representing the thread's activity.
        #  This method may be overriden in a subclass.
        #
        def run(self):
            if (alarm.debug):
                print("Thread begin")
            self.__action()

    ## Creates a thread to run the alarm.
    def trigger(self):
        """Creates a thread to run the alarm."""

        self.__on = True
        if (self.__tid == 0):
            if (self.__useThreading):
                st = self.makeThread(self.__start__)
                st.start()
                self.__tid = 1
            else:
                self.__tid = thread.start_new_thread(self.__start__, ())

    def off(self):
        """Turms the alarm off, by killing the thread."""

        self.__on = False
        self.__tid = 0

    def play(self):
        """Plays the current song, in its own process."""

        if (alarm.debug):
            print(self.__fplayer)
            print(self.__song)

        if (self.__pid > 0):
            self.stop()
            self.__pid = 0

        if (self.__pid == 0):
            lparam = [self.__fplayer]
            if ("mpg123" in self.__fplayer):
                if (self.__loc.os() == "Linux"):
                    lparam.extend(['-C'])
                ext = os.path.splitext(self.__song)[1]
                if (".m3u" in ext):
                    lparam.extend(['-@'])

            if ("gst" in self.__fplayer):
                lparam.extend(['playbin', 'uri=file:///' +
                              self.__song.replace(" ", "%20")])
            elif ("iTunes" in self.__fplayer):
                lparam = ["/usr/bin/osascript", "-e",
                          'tell application "iTunes" to play']
            else:
                lparam.extend([self.__song])
            if (self.__loc.os() == "Windows"):
                if ("wmplayer" in self.__fplayer):
                    lparam[0] = " "
                self.__pid = os.spawnv(os.P_NOWAIT, self.__fplayer, lparam)
            else:
                self.__pp = Popen(lparam)
                self.__pid = self.__pp.pid

    def __kill__(self, pid):
        """kill function for Win32"""

        import ctypes
        ctypes.windll.kernel32.TerminateProcess(int(pid), -1)

    def stop(self):
        """Stops the song, by killing the player process."""

        self.__tid = 0
        if (self.__pid):
            if (self.__loc.os() == "Windows"):
                self.__kill__(self.__pid)
            else:
                if ("smplayer" in self.__fplayer):
                    # kills mplayer called by smplayer
                    call([self.__fplayer, '-send-action quit'])
                elif ("iTunes" in self.__fplayer):
                    os.system(
                        "/usr/bin/osascript -e 'tell application \"iTunes\" to stop'")
                if (sys.hexversion < 0x02050000):  # python 2.4
                    os.kill(self.__pid, signal.SIGTERM)
                else:
                    self.__pp.terminate()

            self.__pid = 0

    def setSong(self, file):
        """Selects the music to be played."""

        self.__song = file
        if (self.__loc.os() == "Windows"):
            self.__song = "\"" + self.__song + "\""

    def getInitialDir(self):
        """Returns an initial directory for searching songs."""

        return self.__root

    def getPlayer(self):
        """Returns an appropriate player based on the OS."""

        return self.__player

    def getdPlayer(self):
        """Returns the player dictionary."""

        return self.__dplayer

    def setPlayer(self, plid):
        """Sets the player to be used."""

        self.__fplayer = self.__loc.bindir(
        ) + self.__dplayer[plid][0] + self.__loc.exe()

## Class for setting parameters related to the volume control:
#     mixer, channel, card, volume level, and a scale.
#
#  The behaviour is adjusted according to the operating system.
#
class volume:
    def __init__(self, s, loc, intialvol):
        self.__mixer = loc.bindir()
        self.__gmixer = loc.bindir()
        self.__scale = s
        self.__loc = loc
        self.__channel = "Master"
        self.__card = "-D hw:PCH"
        self.__grep = "/bin/grep"  # grep
        self.__scale.config(command=self.on_move)
        self.__ivol = intialvol
        if (loc.os() == "Windows"):
            self.__mixer += "nircmd\\nircmd.exe setsysvolume "
        elif (loc.os() == "Linux"):
            self.__mixer += "amixer -q " + self.__card + " set " + self.__channel + " "
            self.__gmixer += "amixer " + self.__card + " get " + self.__channel + " "
        else:  # Mac OS
            self.__mixer = "/usr/bin/osascript -e 'set volume '"
        self.__scale.set(intialvol)

    def setVolume(self, v):
        """Sets the volume to level v."""

        if (self.__loc.os() == "Linux"):
            os.system(self.__mixer + str(v) + "%")
        elif (self.__loc.os() == "Darwin"):
            os.system(self.__mixer + str(7 * v / 100.0))
        else:
            os.system(self.__mixer + str(v * 655))

    def getVolume(self):
        if (self.__loc.os() == "Linux"):
            vol = os.popen(self.__gmixer + " | " +
                           self.__grep + " -E \"%\"").readline()
            i = str.find(vol, "%")
            j = str.find(vol, "[", 0, i)
            return int(vol[j + 1:i])
        else:
            return self.__ivol

    def getChannel(self):
        return self.__channel

    def setChannel(self, channel):
        if (self.__loc.os() == "Linux"):
            self.__channel = channel
            self.__mixer = self.__loc.bindir() + "amixer -q " + self.__card + \
                " set " + self.__channel + " "
            self.__gmixer = self.__loc.bindir() + "amixer " + self.__card + \
                " get " + self.__channel + " "

    def on_move(self, value=0):
        """Use slider position to set the volume."""

        self.setVolume(self.__scale.get())

    def volup(self):
        """Increase the volume."""

        v = self.__scale.get() + 5
        if (v > 100):
            v = 100
        self.__scale.set(v)
        self.setVolume(v)

    def voldown(self):
        """Decrease the volume."""

        v = self.__scale.get() - 5
        if (v < 0):
            v = 0
        self.__scale.set(v)
        self.setVolume(v)

    def mouse_wheel(self, event):
        """Respond to mouse wheel events."""

        if event.num == 5 or event.delta == -120:
            self.voldown()
        if event.num == 4 or event.delta == 120:
            self.volup()

## Retrives the process identification (pid), given the process name.
#  Used for getting pulseaudio id, for instance.
#
class pid:
    def __init__(self):
        # macos or sysvinit-tools
        self.__PIDOF = "/opt/local/bin/pidof" if location().os() == "Darwin" else "/sbin/pidof"

    def str2num(self, datum):
        """A conversion function that "guesses" the best conversion."""

        try:
            return int(datum)
        except:
            try:
                return float(datum)
            except:
                return datum

    def getpid(self, proc):
        """Return the ID of the given process."""

        aid = os.popen(self.__PIDOF + ' ' + proc).readline()
        aid = aid.replace('\n', '')
        return self.str2num(aid)

## Holds the state of the clock (used for persistency).
#
class clockState:
    """Holds the state of the clock (used for persistency)."""

    def __init__(self):
        self.volume = 100
        self.player = "mpg123"
        self.on = False
        self.song = ""
        self.hour = ""
        self.min = ""
        self.pos = ""

    def __str__(self):
        return " Volume = %s\n Player = %s\n On = %d\n Song = %s\n Hour = %s\n Min = %s\n Pos = %s\n" % \
            (self.volume, self.player, self.on,
             self.song, self.hour, self.min, self.pos)

def fini():
    """Stops the song and the alarm."""

    al.stop()
    al.off()
    os._exit(0)

def main(argv=None):
    """Main program."""

    global root, al
    if argv is None:
        argv = sys.argv

    song = ""
    RGIF = "/usr/share/pixmaps/alarm.gif"
    RPNG = "/usr/share/pixmaps/alarm.png"
    nparam = len(argv)
    if nparam > 2:                       # guessing it is a file name with blanks
        # windows do that, even passing arguments
        song = argv[1] + " "
        for i in range(2, nparam - 1):   # between quotes
            song += argv[i] + " "
        song += argv[nparam - 1]
    elif nparam == 2:
        song = (argv[1])                 # file name

    loc = location()
    al = alarm(loc)                      # creates an object alarm

    path = os.environ.get("HOME")
    statfile = path + loc.slash() + '.tkalarm'
    if (sys.hexversion > 0x03000000):
        statfile += '3'
    if (not os.path.exists(statfile)):
        savedState = clockState()
    else:
        pf = open(statfile, 'rb')
        savedState = pickle.load(pf)
        pf.close()
        song = savedState.song
        h = savedState.hour
        m = savedState.min

    if (song):
        al.setSong(song)

    root = Tk()
    top = Frame()
    top.pack()
    bot = Frame()
    bot.pack()

    # do not resize the clock
    root.resizable(False, False)

    root.title("Alarm")

    p = pid()

    scale = Scale(top, from_=0, to=100, orient=HORIZONTAL, bd=0,
                  sliderlength=10, width=5, showvalue=0)
    scale.pack(side='top')

    v = volume(scale, loc, savedState.volume)
    if (p.getpid('pulseaudio')):
        Label(top, text='pulse: ' + v.getChannel()).pack()
    else:
        if (loc.os() == "Linux"):
            Label(top, text='alsa: ' + v.getChannel()).pack()
        elif (loc.os() == "Windows"):
            Label(top, text='windows: ' + v.getChannel()).pack()
        else:
            Label(top, text='mac: ' + v.getChannel()).pack()

    # mouse wheel control
    root.bind("<Button-4>", v.mouse_wheel)
    root.bind("<Button-5>", v.mouse_wheel)

    if (not savedState.hour):
        h, m, s = al.getTime()

    h = "%02d" % h
    # creates a text entry for the hour
    hora = Entry(top, font="Arial 28", width=2, justify=CENTER)
    hora.insert(0, h)
    hora.pack(side="left")

    Label(top, font="Arial 32", text=":").pack(side="left")

    m = "%02d" % m
    # creates a text entry for the minute
    minu = Entry(top, font="Arial 28", width=2, justify=CENTER)
    minu.insert(0, m)
    minu.pack(side="right")

    def state():
        """Defines the state of the alarm: ON or OFF."""
        if (var.get() == "ON"):
            h = min(max(int(hora.get()), 0), 23)
            m = min(max(int(minu.get()), 0), 59)
            al.setTime(h, m)
            savedState.hour = h
            savedState.min = m
            savedState.on = True
            h = "%02d" % h
            m = "%02d" % m
            hora.delete(0, END)
            minu.delete(0, END)
            hora.insert(0, h)
            minu.insert(0, m)
            al.trigger()
        else:
            al.off()
            savedState.on = False
            savedState.hour = ""
            savedState.min = ""
            root.title("Alarm")

    var = StringVar()                        # creates a checkbutton for the alarm state
    if (savedState.on):
        var.set("ON")
        state()
    else:
        var.set("OFF")
    Checkbutton(bot, text="Alarm On", variable=var, onvalue="ON",
                offvalue="OFF", command=state).pack()
    # creates two buttons for playing and stopping the music
    Button(bot, text="Play", command=al.play).pack(side="left")
    Button(bot, text="Stop", command=al.stop).pack(side="right")

    player = StringVar()
    player.set(savedState.player)
    al.setPlayer(savedState.player)

    def getPlayer():
        """Selects the player to be used."""

        al.setPlayer(player.get())

    def selectFile():
        """Creates a tkFileDialog for selecting a song."""

        file = tk_FileDialog.askopenfilename(
            filetypes=[("all files", "*"), ("mp3", "*.mp3")],
            initialdir=al.getInitialDir())
        if file:
            file = file.replace("/", loc.slash())
            savedState.song = file
            al.setSong(file)

    # creates a button for selecting the song
    Button(text="Select Song", command=selectFile).pack()

    # creates some radiobuttons for selecting the player
    for val, txt in al.getdPlayer().items():
        Radiobutton(text=txt[1], value=val, variable=player,
                    command=getPlayer).pack(anchor=W)

    # set an icon for the window
    if (os.path.exists(RGIF)):
        icon_file = RGIF
    else:
        icon_file = "./images/alarm.gif"
    icon_img = PhotoImage(file=icon_file)
    root.tk.call('wm', 'iconphoto', root._w, icon_img)

    def cleanup():
        savedState.volume = scale.get()
        savedState.player = player.get()
        savedState.pos = root.geometry()
        pf = open(statfile, 'wb')
        pickle.dump(savedState, pf)
        pf.close()
        # print ( savedState )
        raise SystemExit

    root.protocol("WM_DELETE_WINDOW", cleanup)

    if (savedState.pos):
        root.geometry(savedState.pos)

    top.mainloop()  # give control to the interface


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (KeyboardInterrupt, SystemExit):
        fini()
