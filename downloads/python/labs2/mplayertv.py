#!/usr/bin/env python
# coding: UTF-8
#
## @package mplayertv
#
#  Intended to play files using mplayer,
#  and load subtitles automatically (ENG, POR and ESP).
#  They can be switched during playback using the "j" key.
#
#  Subtitle files must have the same prefix of the movie file
#  (without white spaces and weird characters, please)
#  and a language code: my.movie.CD1.EN.srt, my.movie.CD1.PT.srt,
#  my.movie.CD1.ES.sub, or my.movie.CD1.rar
#
#  The following empty files in the movie directory cause the
#  script to pass the corresponding option to mplayer during playback:
#  xvid, divx4, nocache, or fbyt (for a 4:3 aspect ratio).
#
#  Command Line Parameters -- name of a file to play.
#
#  Note1: if more than one argument is passed, they are concatenated,
#  because I suppose it is a file name with white spaces in this case.
#
#  Note2: it is possible to create a desktop icon and just drag the
#  file to be played onto it. For windows, however, the desktop icon
#  has to be edited, and "python" (supposed to be in the path)
#  has to be appended before the "program name".
#
#  @author Paulo Roma
#  @since 18/03/2007

__version__ = "$Revision: 1.71 $"
# $Source: /home/cvsroot/bin/mplayertv.py,v $

import sys
import os
import string
from platform import uname
from sys import *
try:
    from tkinter import *
    import tkinter.filedialog as tk_FileDialog
except ImportError:
    from Tkinter import *
    import tkFileDialog as tk_FileDialog

# P_NOWAIT - returns the process ID of the new process, and go ahead
# P_WAIT   - waits for the process to finish, and returns its exit code
ptype = os.P_WAIT
# plays the second part of a movie recursively
RECURSIVE = False
# language codes
languages = [['EN', '.HI'], ['PT', '_PT'], ['BR', '_BR'], ['ES', '.SP']]
# audio file extensions
audio_file = [".flac", ".mp3", ".m4a", ".mpc", ".ogg", ".wav", ".wma"]
# video file extensions
video_file = [".avi", ".flv", ".mkv", ".m4v", ".mov", ".mp4",
              ".mpeg", ".mpg", ".nuv", ".ogm", ".VOB", ".wmv", ".ts"]
# binary directory
bindir = ""

def getLocale():
    import locale
    try:
        locale.setlocale(locale.LC_ALL, '')
        return locale.getlocale()
    except locale.Error:
        return ("Unknown", "Unknown")

def getOs():
    global bindir
    o = uname()[0]
    if (o == "Linux"):  # Linux
        bindir = "/usr/bin/"
    elif (o == "Darwin"):
        bindir = "/opt/local/bin/"
    else:
        lc = getLocale()
        if (lc[0] == "pt_BR" and os.path.exists("C:\\Arquivos de Programas")):
            bindir = "C:\\Arquivos de Programas\\"
        elif (lc[0] == "en_US" or os.path.exists("C:\\Program Files")):
            bindir = "C:\\Program Files\\"
        else:
            o = "Unknown"
    return o

def getFormat(fbase, code1, code2):
    """Looks for a file in .sub or .srt format 

    Keyword arguments:
    fbase -- file path and base name (without extension)
    code1 -- language code (BR,EN,ES,PT)
    code2 -- alternative language code (_BR,.HI,.SP,_PT)

    """

    subtin = fbase + "." + code1 + ".srt"
    if (not os.path.exists(subtin)):
        subtin = fbase + "." + code1 + ".sub"
        # for very old naming convention
        if (not os.path.exists(subtin)):
            subtin = fbase + code2 + ".sub"
            if (not os.path.exists(subtin)):
                subtin = fbase + code2 + ".srt"
                if (not os.path.exists(subtin)):
                    subtin = ""
    if (subtin != ""):
        subtin = subtin + ","

    return subtin

def getOptions(base, ext):
    """Gets option list, based on the presence of empty files"""

    xvid = base + "xvid"
    divx4 = base + "divx4"
    nocache = base + "nocache"
    fbyt = base + "fbyt"
    ffac3 = base + "ffac3"

    if (os.path.exists(xvid)):
        options = ["-vc", "xvid"]
    elif (os.path.exists(divx4)):
        options = ["-vc", "divx4"]
    elif (os.path.exists(nocache)):
        options = ["-nocache"]
    elif (os.path.exists(fbyt)):
        options = ["-aspect", "4:3"]
    elif (os.path.exists(ffac3)):
        options = ["-ac", "ffac3"]
    elif (ext == ".nuv"):
        options = ["-vf", "crop=624:460:2:0,pp=lb", "-aspect", "4:3"]
    else:
        options = []

    monitor_aspect = os.environ.get('MONITOR_ASPECT')
    if monitor_aspect is not None:
        # some versions of mplayer are buggy
        options = options + ["-monitoraspect", monitor_aspect]
        #                 + ["-xineramascreen", "1"]
        print("The Monitor Aspect Ratio is %s" % monitor_aspect)
        print("Options are", options)
    return options

def parseFileName(fname):
    """Breaks fname in path/base.ext"""

    path = os.path.dirname(fname)            # returns the file path
    cdir = os.getcwd()                       # returns the current directory
    file = os.path.split(fname)[1]           # returns a list <path, file>
    ext = os.path.splitext(fname)[1]         # returns a list <path, .ext>
    # returns a list split at the first '.' (from back to front)
    base = str.rsplit(str(file), '.', 1)[0]
    if (path == ""):                         # path is NULL - we are at the file directory
        path = cdir                          # in Unix, it could be "."

    return (path, base, ext)

def getSubList(fbase):
    """Returns the subtitle parameter list."""

    subs = ""
    for s in languages:
        subs = subs + getFormat(fbase, s[0], s[1])

    lsub = []
    if (subs != ""):
        lsub = ["-sub", subs.rstrip(",")]     # remove any trailing ","
    elif (os.path.exists(fbase + ".idx") or
          os.path.exists(fbase + ".rar")):    # try vobsub format
        lsub = ["-vobsub", fbase, "-unrarexec", "/usr/bin/unrar"]

    return lsub

def getParamList(player, path, ext, subtitles, movie, options):
    """Returns the parameter list."""

    global ptype

    lparam = []
    lparam1 = [player, '-really-quiet']
    lparam2 = [player, '-quiet']

    if (ext == ".pls" or ext == ".m3u"):        # a playlist
        lparam.extend(lparam2)
        lparam.extend(['-playlist', movie])
    elif (ext in video_file):                   # movie file
        lparam.extend(lparam1)
        if (subtitles):                         # found at least one subtitle
            lparam.extend(subtitles)
        lparam.append(movie)
        lparam.extend(options)
        # macos does not close the select file window
        ptype = os.P_NOWAIT
    elif (ext in audio_file):                   # music file
        lparam.extend(lparam2)
        lparam.append(movie)
    else:
        sys.exit("Unknown file extension: " + ext)

    return lparam

def play(fplayer, path, ext, subtitles, movie, movieOriginal, lparam):
    """Plays the multimedia file."""

    if (ext == ".tox"):                # xine playlist
        os.chdir(path)
        return os.spawnl(os.P_NOWAIT, bindir + 'xine', 'xine', movie)
    elif (ext == ".avi"):              # dirt hack for playing the second part of a movie
        second_part = movieOriginal.replace('CD1', 'CD2', 1)
        if (movieOriginal != second_part and os.path.exists(second_part)):
            os.spawnv(os.P_WAIT, fplayer, lparam)    # plays the first part
            if (RECURSIVE):
                # plays the second part AFTER the first
                sys.argv[1] = second_part
                print('-----> Recursive call to main()')
                return main()                         # by means of a recursive call to main
            else:
                if (subtitles):
                    lparam[3] = lparam[3].replace('CD1', 'CD2')  # subtitles
                    lparam[4] = lparam[4].replace('CD1', 'CD2')  # movie name
                else:
                    lparam[2] = lparam[2].replace('CD1', 'CD2')  # movie name

    # call movie player as another process
    return os.spawnv(ptype, fplayer, lparam)

def getInitialDir():
    """Returns an initial directory for searching files."""

    if (getOs() == "Windows"):
        return "V:\\"
    elif (getOs() == "Darwin"):
        return "/Users/Shared/videos"
    else:
        return "/home/videos"

def selectFile():
    """Creates a tkFileDialog for selecting a file."""

    file = tk_FileDialog.askopenfilename(title='Choose a file',
                                         filetypes=[
                                             ("all files", "*"), ("mp3", "*.mp3"), ("avi", "*.avi"), ("mp4", "*.mp4")],
                                         initialdir=getInitialDir())
    if (getOs() == "Windows"):
        if (file):
            file = file.replace("/", "\\")
    return file

def getPlayer():
    """Returns mplayer executable based on the OS."""

    if (getOs() == "Linux"):          # try Linux
        player = "mplayer"
        fplayer = bindir + player
    elif (getOs() == "Darwin"):       # try Mac
        player = "mplayer"
        fplayer = bindir + player
    elif (getOs() == "Windows"):      # try Windows
        player = "mplayer.exe"
        fplayer = bindir + "SMPlayer\\mplayer\\" + player
    else:
        sys.exit("No mplayer found.")

    return (player, fplayer, os.sep)

def main(argv=None):
    """Main program."""

    def debug(stat=False):
        """Prints debugging variables if stat is TRUE."""

        if (not stat):
            return
        print('argv       = %s' % argv)
        print('path split = %s' % str(os.path.split(movie)))
        print('ext split  = %s' % str(os.path.splitext(movie)))
        print('cdir       = %s' % os.getcwd())
        print('movie      = %s' % movie)
        print('path       = %s' % path)
        print('fbase      = %s' % fbase)
        print('ext        = %s' % ext)
        print('base       = %s' % base)
        print('options    = %s' % options)
        print('subtitles  = %s' % subtitles)
        print('lparam     = %s' % lparam)
        print('fplayer    = %s' % fplayer)

    if argv is None:
        argv = sys.argv

    l = getLocale()
    print("Python Version: %s - Language = %s, Charcode = %s" %
          (str.split(sys.version)[0], l[0], l[1]))

    opt = []
    nparam = len(argv)
    if nparam < 2:
        root = Tk()
        root.withdraw()                   # no parent winwdow hanging around
        #root.title ( "mplayerTV" )
        #Label(font="Arial 24",text="Select a multimedia file!").pack()
        movie = selectFile()
        if (not movie):
            sys.exit(0)
    elif nparam > 2:	                 # guessing it is a file name with blanks
        if (getOs() == "Windows"):
            # windows do that, even passing arguments between quotes
            movie = argv[1] + " "
            for i in range(2, nparam - 1):
                movie = movie + argv[i] + " "
            movie = movie + argv[nparam - 1]
        else:                             # for linux, we suppose these are mplayer parameters
            for i in range(2, nparam - 1):
                opt.append(argv[i])
            opt.append(argv[nparam - 1])
            movie = (argv[1])
    else:
        movie = (argv[1])     # file name

    if (not os.path.exists(movie)):
        sys.exit(movie + ": File not found")

    player, fplayer, slash = getPlayer()

    if (sys.hexversion < 0x03000000):
        movie = movie.encode('UTF-8', 'strict')
    path, base, ext = parseFileName(movie)

    movieOriginal = movie
    if (getOs() == "Windows"):         # we should do this after getting ext
        movie = "\"" + movie + "\""

    fbase = path + slash + base        # the base filename

    subtitles = getSubList(fbase)

    # special player parameters
    options = getOptions(path + slash, ext)
    options += opt

    lparam = getParamList(player, path, ext, subtitles, movie, options)

    debug()

    play(fplayer, path, ext, subtitles, movie, movieOriginal, lparam)


# When main() calls sys.exit(), your interactive Python interpreter
# will exit! The remedy is to let main()'s return value specify
# the exit status.
#
if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:                # used Ctrl-c to abort the program
        print("Bye, bye... See you later aligator.")
