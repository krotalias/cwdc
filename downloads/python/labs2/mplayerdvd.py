#!/usr/bin/env python
# coding: UTF-8
#
## @package mplayerdvd
#
# Intended to play dvd discs using mplayer.
# $1 is the dvdplayer device.
# $2 is the chapter to be played.
#
# @author Paulo Roma
# @since Jul 31th 2009

import sys
import os
import string
import getcdmp
import mplayertv

validDevices = ['sr0', 'sr1', 'sr2', 'rdisk1', 'hda',
                'hdb', 'hdc', 'cdrom', 'cdrom1', 'dvd', 'dvd1']
validFileTypes = ['.cda', '.flac', '.mp3', '.m3u', '.mod', '.ogg',
                  '.pls', '.s3m', '.wav', '.xm',
                  '.avi', '.flv', '.mkv', '.mov', '.mp4', '.mpeg',
                  '.mpg', '.ogm', '.VOB', '.wma', '.wmv']

def getLocale():
    """Returns the current locale (language,charcode)."""

    import locale
    try:
        locale.setlocale(locale.LC_ALL, '')
        return locale.getlocale()
    except locale.Error:
        return ("Unknown", "Unknown")

def getParam(p):
    """Return the device and chapter number."""

    if (p):
        lm = p.split()
        nparam = len(lm)
        if (nparam == 0):
            return ('/dev/sr0', '1')
        elif (nparam == 1 and lm[0] in validDevices):
            return ('/dev/' + lm[0], '1')
        elif (nparam > 1 and lm[0] in validDevices and lm[1].isdigit()):
            return ('/dev/' + lm[0], lm[1])

    return (None, None)

def readDir(dir):
    """Performs the equivalent of "ls -l dir/*"."""

    import glob

    return glob.glob(dir + "/*")

def playdvd(device, chp):
    """Plays a DVD on device starting at chapter \'chp\'."""

    if (chp == None):
        chp = '1'

    monitor_aspect = os.environ.get('MONITOR_ASPECT')
    print("The Monitor Aspect Ratio is %s" % monitor_aspect)

    lparam = ['mplayer', 'dvd://' + chp, '-really-quiet',
              '-alang', 'en', '-slang', 'en', '-dvd-device', device]
    if (monitor_aspect is not None):
        lparam.extend(['-monitoraspect', monitor_aspect])

    player = "/usr/bin/mplayer"            # Linux
    if not os.path.isfile(player):
        player = "/opt/local/bin/mplayer"  # Mac
        if not os.path.isfile(player):
            exit("No mplayer found.")

    return os.spawnv(os.P_NOWAIT, player, lparam)

def playvcd(device, chp):
    """Plays a VCD on device starting at chapter \'chp\'."""

    if (chp == None):
        chp = '1'

    monitor_aspect = os.environ.get('MONITOR_ASPECT')
    print("The Monitor Aspect Ratio is %s" % monitor_aspect)

    lparam = ['mplayer', 'vcd://' + chp, '-really-quiet',
              '-alang', 'en', '-slang', 'en', '-cdrom-device', device]
    if (monitor_aspect is not None):
        lparam.extend(['-monitoraspect', monitor_aspect])

    return os.spawnv(os.P_NOWAIT, "mplayer", lparam)

def getExt(fname):
    """Returns fname extension."""

    return os.path.splitext(fname)[1]

def main(argv=None):
    """Main program."""

    if argv is None:
        argv = sys.argv

    l = getLocale()
    print("Python Version: %s - Language = %s, Charcode = %s" %
          (str.split(sys.version)[0], l[0], l[1]))

    param = fsys = ""
    chp = dev = mp = None
    nparam = len(argv)
    if nparam > 2:                       # guessing it is a file name with blanks
        # windows do that, even passing arguments
        param = argv[1] + " "
        for i in range(2, nparam - 1):   # between quotes
            param += argv[i] + " "
        param += argv[nparam - 1]
    elif nparam == 2:
        param = (argv[1])                # file name
        if (param.isdigit()):
            chp = param

    lmp = getcdmp.GetCDMountPoint()
    if len(lmp):
        # get first mount point from "/etc/mtab"
        dev, mp, fsys = lmp[0]
    if (dev == None):
        dev, chp = getParam(param)   # get mount point from the argument list
        if (dev != None):
            fsys = "udf"

    print("Device = %s, Chapter = %s, Mount Point = %s, File system = %s" %
          (dev, chp, mp, fsys))

    if (fsys == "udf"):                    # a DVD
        playdvd(dev, chp)
    elif ("9660" in fsys):
        if ("VCD" in mp):                  # a VCD
            playvcd(dev, chp)
        else:                              # a CD
            ls = readDir(mp)
            for f in ls:
                if (getExt(f) in validFileTypes):
                    argv = []
                    argv.append(mplayertv)
                    argv.append(f)
                    mplayertv.main(argv)
    else:
        sys.exit(
            "This script is for playing CDs/DVDs: mplayerdvd.py [dev] [chp]")


if __name__ == '__main__':
    sys.exit(main())
