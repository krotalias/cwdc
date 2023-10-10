#!/usr/bin/env python
# coding: UTF-8
#
## @package _10_tkmpg123
#
#  tkmpg123 - keep mpg123 and Tk happily eventing w/o blocking.
#
#  @author Paulo Roma
#  @since 2009/08/18

import os
import sys
import signal
import pickle
try:                         # python3
    from tkinter import *
    import tkinter.filedialog as tk_FileDialog
    import tkinter.dialog as Dialog
    from subprocess import getstatusoutput
except ImportError:
    from Tkinter import *
    import tkFileDialog as tk_FileDialog
    import Dialog
    from commands import getstatusoutput

sys.path.append("/usr/bin")  # to find tkalarm
try:
    from tkalarm import volume, location
except:
    from _07_alarme_class import volume, location

pid = 0            # player process ID
state = False        # indicates player playing/paused
csong = ""           # current song
mw = Tk()
c = Canvas()

def init(loc):
    "Initialize global variables."""

    global root, player, playlist, OS

    OS = loc.os()
    if (OS == "Linux"):
        root = "/home/mp3/"     # the root of the music directory
        player = loc.bindir() + "mpg123"
        playlist = loc.tempdir() + 'tkmpg123-' + getUser() + '.m3u'
    elif (OS == "Darwin"):
        root = home + "/mp3/"   # the root of the music directory
        player = loc.bindir() + "../opt/local/bin/mpg123"
        playlist = loc.tempdir() + 'tkmpg123-' + getUser() + '.m3u'
    else:                            # windows
        root = "W:\\"             # the root of the music directory
        player = loc.bindir() + "\\mpg123\\mpg123.exe"
        playlist = loc.tempdir() + 'tkmpg123.m3u'

def createMenu(loc):
    "Creates the main menu."""

    mw.title("tkmpg123")
    # do not resize the player
    mw.resizable(False, False)

    if (loc.os() != "Windows"):
        # grey does not work on macos - x11
        # mw.tk_setPalette ( "light grey" )
        mw.option_add('*background', 'light grey')
    menubar = Menu(mw)
    mw.config(menu=menubar)
    file = Menu(menubar)
    submenu = Menu(file, tearoff=0)
    submenu.add_command(label='File', command=play_file)
    submenu.add_command(label='URL', command=play_url, accelerator='u')
    file.add_cascade(label='Play', menu=submenu, underline=0)

    file.add_command(label='Quit', command=cleanup, accelerator='q')
    menubar.add_cascade(label='File', menu=file)

    edit = Menu(menubar)
    edit.add_command(label='Preferences', command=preferences, accelerator='p')
    edit.add_command(label='Clear', command=clear, accelerator='c')
    menubar.add_cascade(label='Edit', menu=edit)

    help = Menu(menubar)
    help.add_command(label='About', command=about, accelerator='h')
    menubar.add_cascade(label='Help', menu=help)

    # set an icon for the window
    if (os.path.exists("/usr/share/pixmaps/turntable.gif")):
        icon_file = "/usr/share/pixmaps/turntable.gif"
    else:
        icon_file = "./images/turntable.gif"
    icon_img = PhotoImage(file=icon_file)
    mw.tk.call('wm', 'iconphoto', mw._w, icon_img)

    # display the menu
    mw.update()

def buildPlayer(loc, ivol):
    """Builds the skin of our player."""

    global scale, lb

    # to avoid deallocation when leaving "buildPlayer"
    global itunes, paus, play, brow, lb, info, time

    c.configure(width=1, height=1, background='dark slate gray')

    itunes = PhotoImage(file='images/itunes.gif')
    c.create_image(0, 0, image=itunes, tag='itunes', anchor=NW)
    c.configure(width=itunes.width(), height=itunes.height())

    paus = PhotoImage(file='images/paus.gif')
    play = PhotoImage(file='images/play.gif')
    brow = PhotoImage(file='images/browse.gif')

    c.create_image(60, 33, image=paus, tag='play-image')
    c.create_image(444, 33, image=brow, tag='brow-image')
    c.pack()
    c.bind('<Button-1>', click)
    mw.bind('<KeyPress-u>', play_url)
    mw.bind('<KeyPress-h>', about)
    mw.bind('<KeyPress-q>', sys.exit)
    mw.bind('<KeyPress-c>', clear)

    green = '#d5dac1'
    font = 'courier 10'

    fr = Frame(mw).pack()
    f = Frame(fr, width=200, height=42, background=green,
              relief=SUNKEN, borderwidth=3)
    g = Frame(fr, width=80, height=12, background=green,
              relief=SUNKEN, borderwidth=3)
    f.pack_propagate(0)
    c.create_window(143, 16, anchor=NW, window=f)
    c.create_window(28, 50, anchor=NW, window=g)

    scale = Scale(g, from_=0, to=100, orient=HORIZONTAL, bd=0, length=55,
                  sliderlength=10, width=5, showvalue=0)
    scale.pack(side='left')
    vol = volume(scale, loc, ivol)

    # mouse whell control
    mw.bind("<Button-4>", vol.mouse_wheel)
    mw.bind("<Button-5>", vol.mouse_wheel)

    info = Label(f, text='', font=font, background=green)
    info.pack(side='top')

    time = Label(f, text='', font=font, background=green)
    time.pack(side='top')

    f2 = Frame(c, width=460, height=225, background=green,
               relief=SUNKEN, borderwidth=3)
    f2.pack_propagate(0)
    f2.pack(side=TOP, expand=True, fill=BOTH)
    c.create_window(10, 68, anchor=NW, window=f2)
    lb = Listbox(f2, height=10, width=72, selectmode=SINGLE)
    lb.pack(side=LEFT, expand=True, fill=BOTH)
    lb.bind('<ButtonRelease-1>', list_entry_clicked)
    mpgs = Scrollbar(lb, orient=VERTICAL, command=lb.yview)
    mpgs.pack(side=RIGHT, fill=Y)
    lb.config(yscrollcommand=mpgs.set)
    mpgs = Scrollbar(lb, orient=HORIZONTAL, command=lb.xview)
    mpgs.pack(side=BOTTOM, fill=X)
    lb.config(xscrollcommand=mpgs.set)

    mw.update()

def pause():
    """Pauses the song."""

    global state
    if (pid or state):
        stop()
        state = False
        c.itemconfigure('play-image', image=play)
    elif (not state and csong):
        start_play()
        state = True

def kill(pid):
    """kill function for Win32"""

    import ctypes
    ctypes.windll.kernel32.TerminateProcess(int(pid), -1)

def stop():
    """Stops the song, by killing the player process."""

    global pid
    if (pid):
        if (OS == "Windows"):
            kill(pid)
        else:
            os.kill(pid, signal.SIGTERM)
        pid = 0

def preferences():
    """Sets the player preferences."""

    return

def click(event):
    """Treats the mouse click event."""

    canvas = event.widget
    x = canvas.canvasx(event.x)
    y = canvas.canvasy(event.y)
    elem = canvas.find_closest(x, y)
    if (elem):
        if (elem[0] == 2):
            pause()
        elif (elem[0] == 3):
            play_file()

def about(e=None):
    """Shows usage messages."""

    Dialog.Dialog(None, {
        'title': 'About tkmpg123',
        'bitmap': 'info',
        'default': 'OK',
                   'strings': ['OK'],
                   'text': "tkmpg123 version 0.50\n\n" +
        "keyboard commands:\n\n" +
        ". - forward\n" +
        ", - rewind\n" +
        ": - fast forward\n" +
        "; - fast rewind\n" +
        "+ - volume up\n" +
        "- - volume down\n" +
        "b - back to beginning of track\n" +
        "s - interrupt/restart playback\n" +
        "f - next song\n" +
        "d - previous song\n" +
        "l - list current playlist\n" +
        "u - url\n" +
        "h - help\n" +
        "q - quit program\n",
                   'wraplength': '6i'})

def play_file():
    """Creates a tkFileDialog for selecting a song."""

    files = tk_FileDialog.askopenfilenames(
        filetypes=[("all files", "*"), ("mp3", "*.mp3"), ("m3u", "*.m3u")],
        initialdir=root)
    # python 2.6 bug: http://bugs.python.org/issue5712
    files = mw.splitlist(files)
    for file in files:
        if (OS == "Windows"):
            file = file.replace("/", loc.slash())
        aplay(file)

def play_url(e=None):
    """Enters a given URL for being played."""

    global song
    song = 'http://dl.lcg.ufrj.br/python/videos/01 - Minha Musica.mp3'

    def ok():
        global song

        song = url.get()
        mw2.destroy()

    mw2 = Tk()
    mw2.title("URL")
    if (OS != "Windows"):
        mw2.tk_setPalette("grey")
    # creates a text entry for the url
    url = Entry(mw2, font="Arial 12", width=60)
    url.insert(0, song)
    url.pack(side="left")
    Button(mw2, text="OK", command=ok).pack(pady=5)
    mw2.wait_window()
    aplay(song)

def readm3u(m3u):
    """"Reads all of the songs in a m3u file."""

    try:
        textf = open(m3u, 'r')
    except IOError:
        sys.exit('Cannot open file %s for reading' % filename)

    path = os.path.dirname(m3u)
    for line in textf:
        line = line.strip().replace('\n', '')
        if line[0] != "#":
            if (line[0] != '/'):
                aplay(path + '/' + line)
            else:
                aplay(line)

    textf.close()
    return

def aplay(song):
    """Saves the song in the Dialog Box and plays it."""

    global lb
    if (song):
        ext = os.path.splitext(song)[1]
        if (ext != ".m3u"):
            lb.insert(END, song)
            mw.update()
            # play song immediately, but in a playlist it is the last
            #start_play(song)
        else:
            readm3u(song)

def clear(e=None):
    """Clears the Listbox."""

    global lb
    lb.delete(0, END)

def getUser():
    """Returns the user running the player."""

    #user = os.popen('whoami').read().strip('\n')
    (code, user) = getstatusoutput('whoami')
    return user

def list_entry_clicked(event):
    """Plays the current selection."""

    first = event.widget.curselection()
    if (first):
        f = open(playlist, 'wt')
        # we need to know when the song is over
        # before going to the next. The simpliest
        # way is using a playlist on a file.

        # the current selection set - update metadata
        cs = event.widget.get(first[0])
        try:
            import kaa.metadata
            mdata = kaa.metadata.parse(cs)
        except:
            try:
                import mmpython
                mdata = mmpython.parse(cs)
            except:
                mdata = None
        if (mdata):
            info.config(text=mdata.artist)
            time.config(text="Total Time: " + ctm(mdata.length))

        for s in lb.get(int(first[0]), END):
            ext = os.path.splitext(s)[1]
            # we cannot add a .m3u file to a m3u playlist
            if (ext == ".mp3"):
                if (sys.hexversion > 0x03000000):
                    f.write(bytes.decode(s.encode("utf-8")) + "\n")
                else:
                    f.write(s.encode("utf-8") + "\n")
        f.close()
        start_play(playlist)

def fini(msg=""):
    """Finishes the player."""

    stop()
    os._exit(0)

def ctm(s):
    """Returns the elapsed time."""

    m = int(s / 60)
    return "%02d:%02d" % (m, s - m * 60)

class playerState:
    """Holds the state of the player (used for persistency)."""

    def __init__(self):
        self.volume = 50
        self.playlist = []
        self.pos = ""

    def __str__(self):
        return " Volume = %s\n Playlist = %s\n Pos = %s\n" % \
            (self.volume, self.playlist, self.pos)

def start_play(song=""):
    """Starts a process for playing the given song."""

    global pid, csong

    if (pid):
        stop()

    if (song):
        csong = song
    elif (csong):
        song = csong
    else:
        return

    lparam = ["mpg123"]

    if (OS == "Windows"):
        song = "\"" + song + "\""
    else:
        lparam.append("-C")

    ext = os.path.splitext(song)[1]
    if (".m3u" in ext):
        lparam.append("-@")
    lparam.append(song)
    if (not pid):
        pid = os.spawnv(os.P_NOWAIT, player, lparam)
        c.itemconfigure('play-image', image=paus)

    return

def main(argv=None):
    """Main program."""

    global cleanup, lb, home, loc

    if argv is None:
        argv = sys.argv

    song = ""
    nparam = len(argv)
    if nparam > 2:                           # guessing it is a file name with blanks
        # windows do that, even passing arguments
        song = argv[1] + " "
        for i in range(2, nparam - 1):       # between quotes
            song += argv[i] + " "
        song += argv[nparam - 1]
    elif nparam == 2:
        song = (argv[1])

    def cleanup():
        savedState.volume = scale.get()
        savedState.pos = mw.geometry()
        savedState.playlist = []
        for s in lb.get(0, END):
            savedState.playlist += [s]
        pf = open(statfile, 'wb')
        pickle.dump(savedState, pf)
        pf.close()
        # print ( savedState )
        raise SystemExit

    home = os.environ.get("HOME")

    loc = location()
    init(loc)
    createMenu(loc)

    statfile = home + loc.slash() + '.tkmpg123'
    if (sys.hexversion > 0x03000000):
        statfile += '3'
    if (not os.path.exists(statfile)):
        savedState = playerState()
        buildPlayer(loc, savedState.volume)
    else:
        pf = open(statfile, 'rb')
        savedState = pickle.load(pf)
        buildPlayer(loc, savedState.volume)
        pf.close()
        if (savedState.playlist):
            [lb.insert(END, s) for s in savedState.playlist]
        mw.update()

    if (song):
        aplay(song)

    mw.protocol("WM_DELETE_WINDOW", cleanup)

    if (savedState.pos):
        mw.geometry(savedState.pos)

    mw.mainloop()


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (KeyboardInterrupt, SystemExit):
        fini()
