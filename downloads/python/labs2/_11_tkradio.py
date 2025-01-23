#!/usr/bin/env python
# coding: UTF-8
#
## @package _11_tkradio
#
#  A simple tkinter interface for fmtools,
#  with lirc and recording support.
#  The radio is turned off on exit.
#
#  @author Paulo Roma
#  @since 23/12/2009

# from __future__ import print_function
import codecs
import os
import sys
import string
import pickle
import math
import datetime
import time
import signal
import platform
import glob
from threading import Thread
from subprocess import Popen, PIPE
from PIL import Image, ImageTk

try:
    from tkinter import *    # python3
    from tktooltip import ToolTip
    try:
        import tkinter.tix as Tix
    except ImportError:
        import tkinter.ttk as Tix
except ImportError:
    try:
        from mtTkinter import *
    except ImportError:
        from Tkinter import *
        print("mtTkinter not found: http://tkinter.unpythonic.net/wiki/mtTkinter")
        print("Remote control will not work!!")
    try:
        import Tix
    except ImportError:
        print("Tix not found: http://tix.sourceforge.net")

sys.path.append("/usr/bin")                 # to find tkalarm
sys.path.append("/usr/share/tkmpg123")      # to find digitalClock
sys.path.append("/home/html/python/labs2")  # to find digitalClock
from digitalClock import digitalClock, makeThread
try:
    from tkalarm import volume, location
except:
    from _07_alarme_class import volume, location

try:
    import pylirc
    use_lirc = True
except ImportError:
    use_lirc = False
    print("pylirc not found: http://pylirc.mccabe.nu/")
    print("Remote control will not work!!")

try:
    import pynotify
    if pynotify.init("tkradio"):
        use_notify = True
        use_Notify = False
    else:
        use_notify = False
        print("pynotify module initialization failed")
except:
    try:
        from notifypy import Notify
        use_notify = False
        use_Notify = True
        notification = Notify()
    except:
        use_notify = False
        use_Notify = False
        print("notify-python not found: http://www.galago-project.org/downloads.php")

# These are stations in the Rio de Janeiro area.
# Customize for your own locale. They can be set
# in file ~/.fmrc or ~/.radiostations:
# station name, frequency and volume.

stations = [["Rádio Mundial", "1180 100",
             "http://stm7.srvstm.com:9836/stream"],
            ["Band_News_RJ", "90.3 100",
                "https://evpp.mm.uol.com.br/band/bandnewsfm_rj/playlist.m3u8"],
            ["CBN", "92.5 100",
                "http://playerservices.streamtheworld.com/api/livestream-redirect/CBN_RJ_ADP"],
            ["Paradiso", "95.7 100",
                "http://playerservices.streamtheworld.com/api/livestream-redirect/SULAMERICA"],
            ["Band News SP", "96.9 100",
                "http://playerservices.streamtheworld.com/api/livestream-redirect/BANDNEWSFM_SPAAC.m3u8"],
            ["Tupi", "96.5 100",
                "http://8923.brasilstream.com.br/stream"],
            ["Globo FM", "98.1 100",
                "http://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_GLOBO_RJAAC.aac"],
            ["MEC", "98.9 100",
                "http://radiomecfm-stream.ebc.com.br/index.m3u8"],
            ["JB FM", "99.7 100",
                "http://playerservices.streamtheworld.com/api/livestream-redirect/JBFMAAC"],
            ["O Dia", "100.5 100",
                "http://streaming.livespanel.com:20000/live"],
            ["Transamerica", "101.3 100",
                "http://playerservices.streamtheworld.com/api/livestream-redirect/RT_RJAAC.aac"],
            ["Mix", "102.1 100",
                "http://playerservices.streamtheworld.com/api/livestream-redirect/MIXRIO"],
            ["Cidade", "102.9 100",
                "http://playerservices.streamtheworld.com/api/livestream-redirect/RADIOCIDADEAAC"],
            ["Antena1_Lite_FM", "103.7 100",
                "http://a1rj.streams.com.br:7801/stream"]]

radbut = stations[4][1]  # default radio frequency
ivolume = 100            # initial volume [0,100]
state = False            # keep track of mutting/unmutting
blocking = 0             # lirc blocking control
tid = 0                  # recorder thread id
lid = 0                  # loopback process id
fmrec = None             # recorder thread variable
irrec = None             # lirc thread variable
mpid = 0                 # player process id
message = 0              # label for help messages

def init(loc, player='mplayer'):
    "Initialize global variables."""

    global PLATF, PLAYER, MIXER, TEMPDIR, FM, REC, OGG, GREP, PIDOF, PS, RPNG, RGIF, RICNS, RICO

    # external programs used

    PLATF = loc.os()
    FM = ""
    REC = ""
    OGG = ""
    PIDOF = ""
    TEMPDIR = loc.tempdir()
    if (PLATF == "Darwin"):
        PLAYER = "/opt/local/bin/mplayer"           # mplayer
        # PLAYER = "/Applications/SMPlayer.app/Contents/MacOS/mplayer" # mplayer
        OGG = "/opt/local/bin/oggenc"               # vorbis-tools
        if (not os.path.exists(PLAYER) or player == 'gstreamer'):
            # gstreamer (for mms play: gst-ffmpeg or gstreamer1-gst-libav)
            PLAYER = "/opt/local/bin/gst-launch-1.0"
        elif (player == 'vlc' or player == 'snap'):
            PLAYER = "/Applications/VLC.app/Contents/MacOS/VLC"
        GREP = "/usr/bin/grep"                      # macos
        PIDOF = "/opt/local/bin/pidof"              # macos
    elif (PLATF == "Linux"):
        PLAYER = loc.bindir() + "mplayer"           # mplayer
        OGG = loc.bindir() + "oggenc"               # vorbis-tools
        if (not os.path.exists(PLAYER) or player == 'gstreamer'):
            # gstreamer-tools (for mms play: gstreamer-ffmpeg or gstreamer1.0-libav)
            PLAYER = loc.bindir() + "gst-launch-1.0"
        elif (player == 'vlc'):
            PLAYER = loc.bindir() + "vlc"
        elif (player == 'snap'):
            PLAYER = "/snap/bin/vlc"
        GREP = "/bin/grep"                           # grep
        devradio = False
        if (os.path.exists(loc.bindir() + "fm")):
            devradio = glob.glob(os.path.join(".", "/dev/radio*"))
        if (devradio):
            FM = loc.bindir() + "fm"                 # fmtools
        PIDOF = "/sbin/pidof"                        # sysvinit-tools
        if (not os.path.exists(PIDOF)):
            PIDOF = "/bin/pidof"
    else:
        PLAYER = loc.bindir() + "SMPlayer\\mplayer\\mplayer.exe"  # mplayer
        if (player == 'vlc'):
            PLAYER = loc.bindir() + "VideoLAN\\VLC\\vlc"

        GREP = "C:\\msys\\1.0\\bin\\grep.exe"        # msys

    PS = "/bin/ps"                                   # procps or msys (windows)

    RPNG = "/usr/share/pixmaps/radio.png"
    RGIF = "/usr/share/fmtools/radio.gif"
    RICNS = "/usr/share/fmtools/radio.gif"
    if (not os.path.exists(RPNG)):
        RPNG = "./images/radio.png"
        RGIF = "./images/radio.gif"
        RICNS = "./images/radio.icns"
        RICO = "./images/radio.ico"

def killProc(pid):
    """Kill the given process."""

    if (pid):
        if (PLATF == "Windows"):
            import ctypes
            ctypes.windll.kernel32.TerminateProcess(int(pid), -1)
        else:
            os.kill(pid, signal.SIGTERM)
    return 0

class IRRec(Thread):
    """Class for interacting with lirc."""

    def __init__(self, lirc_handle):
        """Constructor."""

        Thread.__init__(self)
        self.lirc_handle = lirc_handle
        self.__on = True

    def stop(self):
        """Kills this thread."""

        self.__on = False

    def run(self):
        """Run the thread code."""

        code = {"config": ""}

        while (self.__on):
            # Delay...
            time.sleep(1)

            s = pylirc.nextcode(1)
            while (s):
                for code in s:
                    if (code["config"] == "next"):
                        next()
                    elif (code["config"] == "previous"):
                        previous()
                    elif (code["config"] == "off"):
                        mute()
                    elif (code["config"] == "on"):
                        radio("on")
                    elif (code["config"] == "volup"):
                        vol.volup()
                    elif (code["config"] == "voldown"):
                        vol.voldown()
                    elif (code["config"] in "0123456789"):
                        time.sleep(1)
                        b = pylirc.nextcode()
                        if (b and b[0] in "0123456789"):
                            code["config"] += b[0]
                        setStation(int(code["config"]))
                    elif (code["config"] == "rec"):
                        rec_on()
                    elif (code["config"] == "stop"):
                        rec_off()
                    elif (code["config"] == "loop"):
                        loopon()
                    elif (code["config"] == "quit"):
                        fini()
                    else:
                        # Print all the configs...
                        print("Command: %s, Repeat: %d" %
                              (code["config"], code["repeat"]))
                if (not blocking):
                    s = pylirc.nextcode(1)
                else:
                    s = []

        # if we get here, the thread is over, so clean up lirc
        pylirc.exit()

class FMRec(Thread):
    """Class for controlling the recording process."""

    def __init__(self):
        """Constructor."""

        Thread.__init__(self)
        self.__pid = 0      # arecord process id
        self.__on = True    # for implementing a thread stop,
        # which python does not have

    def __del__(self):
        """Destructor. Stops the recording, before quitting."""

        self.stop()

    def stop(self):
        """Stops the recording, by killing the recorder process."""

        global tid

        tid = 0

        self.__pid = killProc(self.__pid)
        self.__on = False

    def run(self):
        """Start the thread."""

        while (self.__on):
            if (not self.__pid):
                data = str(datetime.date.today())
                hora = list(time.localtime(time.time()))
                hora = '.'.join(str(x) for x in hora[3:6])
                rec_file = TEMPDIR + 'tkradio-' + \
                    fmstations[cur_station][0] + "-" + data + "-" + hora
                if use_notify:
                    n = pynotify.Notification(
                        "tkradio recording on file:", rec_file, RPNG)
                    n.show()
                elif use_Notify:
                    notification.title = "tkradio"
                    notification.message = "tkradio recording on file: {}".format(
                        rec_file)
                    notification.icon = RPNG
                    notification.send()
                if (loopvar.get() == "ON"):
                    ogge_param[-1] = rec_file + '.ogg'
                    p1 = Popen(brec_param, stdout=PIPE)
                    p2 = Popen(ogge_param, stdin=p1.stdout)
                    self.__pid = p1.pid
                else:
                    fmurl = fmstations[cur_station][2]
                    if ("gst" in PLAYER):
                        if (fmurl[0:3] == "mms"):
                            type = 'mmssrc'
                        else:
                            type = 'souphttpsrc'
                        param = ['gst-launch-1.0', type, 'location=' + fmurl,
                                 '!', 'filesink', 'location=' + rec_file + '.dump']
                    elif ("vlc" in PLAYER or "VLC" in PLAYER):
                        param = ['vlc', '-Idummy', '--sout',
                                 '#std{access=file,mux=ogg,dst="' + rec_file + '.dump"}', fmurl]
                    else:
                        param = ['mplayer', '-dumpstream',
                                 '-dumpfile', rec_file + '.dump', fmurl]
                    self.__pid = os.spawnv(os.P_NOWAIT, PLAYER, param)

            # Suspend execution for the given number of seconds
            time.sleep(1.0)

        # if we get here, the thread is finished
        self.stop()

def start_irrec():
    """Start the IRRec thread if lircd is running."""

    global irrec

    lircid = getpid('lircd')
    if (lircid):  # is lirc running?
        # handle lirc events
        path = os.environ.get("HOME")
        fname = path + "/.fmlircrc"
        if (not os.path.exists(fname)):
            fname = "/usr/share/fmtools/fmlircrc"
        lirc_handle = pylirc.init("tkradio", fname, blocking)
        if (lirc_handle):
            if (use_notify):
                n = pynotify.Notification(
                    "tkradio", "Successfully opened lirc. Handle is " + str(lirc_handle), RPNG)
                n.set_timeout(2000)
                n.show()
            elif (use_Notify):
                notification.title = "tkradio"
                notification.message = "Successfully opened lirc. Handle is " + \
                    str(lirc_handle)
                notification.icon = RPNG
                notification.send()

            irrec = IRRec(lirc_handle)
            irrec.start()

def set_rec_type():
    """Set recording based on alsa or pulseaudio."""

    global REC           # program for recording
    global PLAY          # program for playing
    global arec_param    # recording parameters
    global apla_param    # playing parameters
    global brec_param    # recording parameters for encoding
    global ogge_param    # encoding parameters

    pulseaudio = getpid('pulseaudio')
    if (pulseaudio):  # is pulseaudio running?
        REC = "/usr/bin/parec"    # pulseaudio-utils
        PLAY = "/usr/bin/pacat"   # pulseaudio-utils
        arec_param = [REC]
        brec_param = [REC]
        apla_param = [PLAY]
        ogge_param = [OGG, '-', '-r', '-Q', '-o', ""]
    else:
        REC = "/usr/bin/arecord"  # alsa-utils
        PLAY = "/usr/bin/aplay"   # alsa-utils
        arec_param = [REC, '-D', 'default', '-d', '0', '-f', 'cd']
        brec_param = [REC, '-D', 'default', '-d', '0', '-f', 'cd', '-']
        apla_param = [PLAY, '-f', 'cd', '-D', 'default']
        ogge_param = [OGG, '-', '-Q', '-o', ""]

    return pulseaudio

def execmd(cmd):
    """Execute the given command."""

    if (FM):
        os.system(FM + " " + cmd)

def radio(cmd):
    """Send the given command to the radio."""

    global mpid
    execmd(cmd)
    if (cmd == "off"):
        mpid = killProc(mpid)
    elif (cmd == "on"):
        setstation()

def getStation(frequency):
    """Return the frequency index."""

    ind = 0
    f = frequency.split()[0]
    for st in fmstations:
        if (st[1].split()[0] == f):
            break
        ind += 1
    return ind

def setCurStation(frequency):
    """Update the current station."""

    global cur_station

    cur_station = getStation(frequency)

def internetRadio(freq):
    """ Set the internet radio """

    global mpid
    if (netvar.get() == "ON"):
        mms = ""
        for f in fmstations:
            if f[1] == freq:
                mms = f[2]
        if (mms):
            if ("gst" in PLAYER):
                param = ['gst-launch-1.0']
                param += ['playbin']
                param += ['uri=' + mms]
            elif ("vlc" in PLAYER or "VLC" in PLAYER):
                param = ['vlc']
                param += ['-Idummy']
                param += [mms]
            else:
                param = ['mplayer']
                param += ['-really-quiet']
                param += [mms]
            killProc(mpid)
            mpid = os.spawnv(os.P_NOWAIT, PLAYER, param)

def setstation():
    """Set the station chosen via Radio Button."""

    freq = station.get()
    changeStation(freq)
    setCurStation(freq)

def setStation(ind):
    """Set the station to ind."""

    if (ind >= 0 and ind < ns):
        freq = fmstations[ind][1]
        changeStation(freq)
        setCurStation(freq)

def changeStation(st):
    """Set the station to the given station."""

    radio(st)
    freq.delete(0, END)
    freq.insert(0, st.split()[0])
    station.set(st)
    internetRadio(st)

def fini():
    """Quit the radio."""

    radio("off")
    # kill all threads
    if (fmrec):
        fmrec.stop()
    if (irrec):
        irrec.stop()
    killProc(lid)
    killProc(mpid)

    os._exit(0)

def mute():
    """Mute/Unmute the radio."""

    global state

    if (not state):
        radio("off")
        state = True
        btmute.set("On")
        btm.config(state=ACTIVE)
    else:
        radio("on")
        state = False
        btmute.set("Off")
        btm.config(state=NORMAL)

def enter():
    "Enter a new frequency."""

    f = freq.get()
    vol = fmstations[getStation(f)][1].split()[1]
    f += " " + vol
    changeStation(f)
    setCurStation(f)

def readStations():
    """Read the preset station file."""

    path = os.environ.get("HOME")
    fname = path + "/.radiostations"
    if (not os.path.exists(fname)):
        fname = path + "/.fmrc"

    lst = []
    if (os.path.exists(fname)):
        if (sys.hexversion > 0x03000000):
            textf = open(fname, 'r')
        else:
            textf = codecs.open(fname, 'r', 'utf-8')

        for line in textf:
            l = line.split(None)
            st = [l[0].replace("_", " "), l[1] + " " + l[2]]
            if (len(l) == 4):
                st.append(l[3])
            else:
                st.append("")
            lst.append(st)
        textf.close()
    return lst

def next(e=None):
    "Go to the next station."""

    global cur_station
    cur_station = (cur_station + 1) % ns
    changeStation(fmstations[cur_station][1])

def previous(e=None):
    "Go to the previous station."""

    global cur_station
    cur_station = (cur_station - 1) % ns
    changeStation(fmstations[cur_station][1])

def trigger():
    """Create a thread for recording."""

    global tid, fmrec

    if (not tid):
        fmrec = FMRec()
        fmrec.start()
        tid = 1

def net():
    """Activate the internet radio."""

    global lid, mpid

    if (netvar.get() == "ON"):
        lid = killProc(lid)
        if (not state):  # not mutted
            internetRadio(fmstations[cur_station][1])
        execmd("off")   # turn off analog radio
    else:
        mpid = killProc(mpid)
        execmd("on")    # turn on analog radio
        loop()


def loop():
    """Route the capture sources on the sound card back in as PCM audio."""

    global lid, state

    if (loopvar.get() == "ON"):
        if (not FM):
            if (PLATF != "Linux"):  # linux can, at least, record from Mic, in this case
                if (use_notify):
                    n = pynotify.Notification("tkradio", "No radio card found or fmtools is not installed",
                                              RPNG)
                    n.set_timeout(2000)
                    n.show()
                elif (use_Notify):
                    notification.title = "tkradio"
                    notification.message = "No radio card found or fmtools is not installed"
                    notification.icon = RPNG
                    notification.send()
                return

        if (not lid):
            p1 = Popen(arec_param, stdout=PIPE)
            p2 = Popen(apla_param, stdin=p1.stdout)
            lid = p1.pid
            if (use_notify):
                n = pynotify.Notification("tkradio", "Software Loop Back activated",
                                          RPNG)
                n.set_timeout(2000)
                n.show()
            elif (use_Notify):
                notification.title = "tkradio"
                notification.message = "Software Loop Back activated"
                notification.icon = RPNG
                notification.send()
    else:
        lid = killProc(lid)


def loopon():
    """Toggle the loop variable."""

    if (loopvar.get() == "ON"):
        loopvar.set("OFF")
    else:
        loopvar.set("ON")
    loop()

def chn():
    """Set the sound channel."""

    if (chnvar.get() == "ON"):
        vol.setChannel("Line")
    else:
        vol.setChannel("Master")
    chnbut.config(text=soundid + vol.getChannel())

def rec():
    """Record the current station."""

    if (recvar.get() == "ON"):
        rec_on()
    else:
        rec_off()

def rec_on():
    """Turn the recorder on."""

    recvar.set("ON")
    trigger()

def rec_off():
    """Turn the recorder off."""

    recvar.set("OFF")
    if (fmrec):
        fmrec.stop()

def getFreq(s):
    """Returns the frequency of a station."""

    try:
        float(s)
    except:
        return ""

    if (s.find(".") >= 0):
        freq = 'FM ' + s + ' MHz'
    else:
        freq = 'AM ' + s + ' KHz'
    return freq

def mouse_leave(event):
    """Respond to mouse leave events."""

    ballmess.config(text=getFreq(station.get().split()[0]))

def mouse_enter(event):
    """Respond to mouse enter events."""

    if (event.type != "7"):
        return

    try:
        e = event.widget.cget("text")
    except:
        return

    def showCommand(s, f="\r%-*s", t=""):
        global message
        global balloon

        if (t):
            f = f % (s, 80, t)
        else:
            f = f % (80, s)

        msg = s
        if (t):
            msg += " - " + t
        try:
            balloon.bind_widget(
                event.widget, balloonmsg=msg, statusmsg=getFreq(s))
        except:
            balloon = ToolTip(event.widget, msg=msg, delay=0,
                              fg="black", bg="yellow")

        if (message):
            message.config(text=msg, width=60)
        else:
            if (False):
                sys.stdout.write(f)  # print f, or print ( f, end=" " )
                if (sys.hexversion < 0x03000000):
                    sys.stdout.flush()

    if (e == "<"):
        showCommand("Previous station")
    elif (e == ">"):
        showCommand("Next station")
    elif (e == "On"):
        showCommand("Turn on the radio")
    elif (e == "Off"):
        showCommand("Turn off the radio")
    elif (e == "Exit"):
        showCommand("Exit the radio")
    elif (e == "Enter"):
        showCommand("Tune in the above frequency")
    elif (e == "Net"):
        showCommand("Select internet radio")
    elif (e == "Loop"):
        showCommand("Turn on loopback")
    elif (e == "Rec"):
        showCommand("Record in", "\r%s %-*s", TEMPDIR)
    elif ("pulse" in e):
        showCommand("Toggle Line/Master")
    else:
        for f in fmstations:
            if (e == f[0]):
                showCommand(f[1].split()[0], "\r%5s - %-*s", f[2])

def str2num(datum):
    """A conversion function that "guesses" the best conversion."""

    try:
        return int(datum)
    except:
        try:
            return float(datum)
        except:
            return datum

def getpid(proc):
    """Return the ID of the given process."""

    aid = os.popen(PIDOF + ' ' + proc).readline()
    aid = aid.replace('\n', '')
    return str2num(aid)

class radioState:
    """Holds the state of the radio (used for persistency)."""

    def __init__(self, intial_station):
        self.volume = ivolume
        self.loop = "OFF"
        self.net = "OFF"
        self.chn = "OFF"
        self.mute = False
        self.station = intial_station
        self.pos = ""

    def __str__(self):
        return " Volume = %s\n Loop = %s\n Net = %s\n Chn = %s\n Mute = %d\n Station = %s\n Pos = %s\n" % \
            (self.volume, self.loop, self.net, self.chn,
             self.mute, self.station, self.pos)

def help(e=None):
    """Enters a given URL for being played."""

    global message, mw2

    def ok():
        global message
        mw2.destroy()
        message = 0

    if (e == None):
        if (message):
            ok()
        return

    if (message):
        return
    mw2 = Tk()
    mw2.title("HELP")
    if (PLATF != "Windows"):
        mw2.tk_setPalette("grey")
    # creates a text entry for the url
    message = Label(mw2, text="", font="Arial 14", width=60)
    message.pack(side="left")
    Button(mw2, text="OK", command=ok).pack(pady=5)
    mw2.wait_window()

def main(argv=None):
    """Main program."""

    global scale         # volume scale
    global state         # toggle mute/umute
    global station       # variable for the station radio buttons
    global btmute        # variable for the text in the mute button
    global btm           # mute button
    global freq          # variable for manually entering a frequency
    global fmstations    # preset fm stations
    global cur_station   # current station
    global ns            # number of preset fm stations
    global chnvar        # variable for setting the channel
    global recvar        # variable for setting record on/off
    global loopvar       # variable for setting loopback on/off
    global netvar        # variable for setting internet on/off
    global lid           # loopback process id
    global mpid          # player process id
    global balloon       # Tix balloon
    global ballmess      # balloon status message
    global chnbut        # channel label
    global soundid       # sound system identifier
    global vol           # volume object

    def cleanup(e=None):
        savedState.volume = scale.get()
        savedState.loop = loopvar.get()
        savedState.net = netvar.get()
        savedState.chn = chnvar.get()
        savedState.mute = state
        savedState.station = station.get()
        savedState.pos = mw.geometry()
        pf = open(statfile, 'wb')
        pickle.dump(savedState, pf)
        pf.close()
        # print ( savedState )
        help()
        raise SystemExit

    player = 'mplayer'
    if argv is None:
        argv = sys.argv
        if (len(argv) > 1 and argv[1] == 'gst'):
            player = 'gstreamer'
        elif (len(argv) > 1 and argv[1] == 'vlc'):
            player = 'vlc'
        elif (len(argv) > 1 and argv[1] == 'snap'):
            player = 'snap'

    loc = location()
    init(loc, player)

    pyversion = sys.version.split()[0]
    print("Python Version: %s" % pyversion)

    # check whether tkradio is already running
    pynumber = pyversion[0]  # pyversion[0:3]

    stat = os.popen(PS + " aux | " + GREP + " -E \"python(" +
                    pynumber + ")? " + argv[0] + "\"").readline()
    cid = os.getpid()
    if (stat):
        pid = stat.split()[1]
        if (cid != int(pid)):
            sys.exit("%s is already running: pid = %s" % (argv[0], pid))

    path = os.environ.get("HOME")
    statfile = path + '/.tkradio'
    if (sys.hexversion > 0x03000000):
        statfile += '3'
    if (not os.path.exists(statfile)):
        savedState = radioState(radbut)
    else:
        pf = open(statfile, 'rb')
        savedState = pickle.load(pf)
        pf.close()

    try:
        mw = Tix.Tk()
        # balloon help
        use_tix = True
        balloon = 1
    except:
        mw = Tk()
        use_tix = False
        balloon = 0

    # do not resize the radio in x
    mw.resizable(False, True)

    station = StringVar()
    station.set(savedState.station)

    btmute = StringVar()
    state = not savedState.mute
    btmute.set("OFF")

    top = Frame()
    top.pack()
    bbt = Frame()
    bbt.pack()
    bot = Frame()
    bot.pack()
    mw.title("tkradio")

    fmstations = readStations()
    if (not fmstations):
        fmstations = stations
    ns = len(fmstations)
    cur_station = -1

    f = Frame(top, relief=SUNKEN, borderwidth=3)
    f.pack()
    clock = Label(f, font=('times', 20, 'bold'), bg='gray')
    clock.pack(fill=BOTH, expand=1)

    c = digitalClock(clock)
    st = makeThread(c.tick)
    st.start()

    scale = Scale(top, from_=0, to=100, orient=HORIZONTAL, bd=0,
                  sliderlength=10, width=5, showvalue=0)
    scale.pack(side='top')
    vol = volume(scale, loc, savedState.volume)

    # sets the recording type: alsa or pulse
    if (PLATF == "Linux"):
        if (set_rec_type()):
            soundid = '     pulse: '
        else:
            soundid = '      alsa: '
    elif (PLATF == "Windows"):
        soundid = 'nircmd: '
    else:
        soundid = 'osascript: '

    chnvar = StringVar()   # creates a checkbutton for the sound channel
    chnvar.set(savedState.chn)
    if (PLATF == "Linux"):
        chnbut = Checkbutton(top, text="", variable=chnvar,
                             onvalue="ON", offvalue="OFF", command=chn)
        chnbut.pack(side="top", anchor=W)
        chn()
    else:
        chnlable = Label(top, text=soundid + vol.getChannel())
        chnlable.pack()

    # make tuner buttons
    f = Frame(mw, relief=SUNKEN, borderwidth=3)
    f.pack()
    for st in fmstations:
        Radiobutton(f, text=st[0], value=st[1],
                    variable=station, command=setstation).pack(anchor=W)
    ballmess = Label(mw, text=getFreq(
        station.get().split()[0]), font="Arial 12")
    ballmess.pack()
    if (use_tix):
        balloon = Tix.Balloon(mw, statusbar=ballmess)
        print("Tix found: http://tix.sourceforge.net")
    else:
        balloon = ToolTip(mw, msg=ballmess.cget("text"))
        print("ToolTip found: http://tkinter.unpythonic.net/wiki/ToolTip")

    # the current radio frequency
    Button(bbt, text="<", command=previous).pack(side="left", anchor=E)
    Button(bbt, text="Enter", command=enter).pack(side="left")
    Button(bbt, text=">", command=next).pack(side="left", anchor=W)
    freq = Entry(top, font="Arial 24", width=5, justify=CENTER)
    freq.insert(0, station.get().split()[0])
    freq.pack(side="bottom")

    recvar = StringVar()   # creates a checkbutton for the recording state
    loopvar = StringVar()  # creates a checkbutton for the loopback
    netvar = StringVar()   # creates a checkbutton for the internet
    recvar.set("OFF")
    aid = 0
    if (REC):
        aid = getpid(REC.rsplit('/', 1)[1])
    if (aid):  # is the loop back already on?
        loopvar.set("ON")
        lid = aid
    else:
        loopvar.set(savedState.loop)
        loop()
    netvar.set(savedState.net)

    # create quit and mute buttons
    Button(top, text="Exit", command=cleanup).pack(side="right")

    btm = Button(top, text="Off", command=mute, textvariable=btmute)
    btm.pack(side="left")
    Checkbutton(top, text="Rec", variable=recvar, onvalue="ON",
                offvalue="OFF", command=rec).pack(side="top", anchor=W)
    Checkbutton(top, text="Net", variable=netvar, onvalue="ON",
                offvalue="OFF", command=net).pack(side="top", anchor=W)
    Checkbutton(top, text="Loop", variable=loopvar, onvalue="ON",
                offvalue="OFF", command=loop).pack(side="left")

    # mouse whell control
    mw.bind("<Button-4>", vol.mouse_wheel)
    mw.bind("<Button-5>", vol.mouse_wheel)
    mw.bind("<Enter>", mouse_enter)
    mw.bind("<Leave>", mouse_leave)
    mw.bind("<Button-2>", previous)
    mw.bind("<Button-3>", next)
    mw.bind('<KeyPress-h>', help)
    mw.bind('<KeyPress-q>', cleanup)

    # turn the analogic radio on
    mute()

    # set an icon for the window
    icon_img = PhotoImage(file=RGIF)
    mw.tk.call('wm', 'iconphoto', mw._w, icon_img)

    # start the lirc thread
    if (use_lirc):
        start_irrec()

    mw.protocol("WM_DELETE_WINDOW", cleanup)

    if (savedState.pos):
        mw.geometry(savedState.pos)

    mw.mainloop()


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (KeyboardInterrupt, SystemExit):
        fini()
