#!/usr/bin/env python
# coding: UTF-8
#
## @package getcdmp
#
# Returns a CD mounting Point
#
# @author Paulo Roma
# @since 15 07 2006
#

import sys
import os
import re
import string

def GetCDMountPoint():
    """Search in /etc/mtab for a mount point."""

    mtab = "/etc/mtab"

    # returns the suffix after the last "/"
    def getName(x): return x.split("/")[-1]
    if not os.path.exists(mtab):
        Log("Wasn't able to locate mtab")
        return GetCD()

    list = []
    f = open(mtab)
    for line in f:
        dev, mpoint, fsys = line.split()[0:3]
        if fsys == "iso9660" or fsys == "udf":
            Log(mpoint)
            # if Found, return mount point
            # return dev, mpoint, fsys
            # return a list if somebody has multiple drives
            mpoint = mpoint.replace('\\040', " ")
            list.append((dev, mpoint, fsys))
    f.close()

    if not list:
        # Not Found, then search in /etc/fstab
        return GetCD()

    return list

def Log(s, prt=False):
    if (prt):
        print("Detected CD drive:", s)
    return

def GetCD():
    """Search in /etc/fstab for a mount point."""

    fstab = "/etc/fstab"
    list = []
    # Lifted almost completely out of freevo (thanks dischi ;)
    if not os.path.isfile(fstab):
        return GetMount()
    re_cd = re.compile(
        '^(/dev/cdrom[0-9]*|/dev/[am]?cd[0-9]+[a-z]?)[ \t]+([^ \t]+)[ \t]+', re.I)
    re_cdrec = re.compile(
        '^(/dev/cdrecorder[0-9]*)[ \t]+([^ \t]+)[ \t]+', re.I)
    re_dvd = re.compile('^(/dev/dvd[0-9]*)[ \t]+([^ \t]+)[ \t]+', re.I)
    re_iso = re.compile('^([^ \t]+)[ \t]+([^ \t]+)[ \t]+(iso|cd)9660', re.I)
    re_automount = re.compile(
        '^none[ \t]+([^ \t]+).*supermount.*dev=([^,]+).*', re.I)
    re_bymountcd = re.compile(
        '^(/dev/[^ \t]+)[ \t]+([^ ]*cdrom[0-9]*)[ \t]+', re.I)
    re_bymountcdr = re.compile(
        '^(/dev/[^ \t]+)[ \t]+([^ ]*cdrecorder[0-9]*)[ \t]+', re.I)
    re_bymountdvd = re.compile(
        '^(/dev/[^ \t]+)[ \t]+([^ ]*dvd[0-9]*)[ \t]+', re.I)
    fd_fstab = open(fstab)
    for line in fd_fstab:
        # Match on the devices /dev/cdrom, /dev/dvd, and fstype iso9660
        match_cd = re_cd.match(line)
        match_cdrec = re_cdrec.match(line)
        match_dvd = re_dvd.match(line)
        match_iso = re_iso.match(line)
        match_automount = re_automount.match(line)
        match_bymountcd = re_bymountcd.match(line)
        match_bymountcdr = re_bymountcdr.match(line)
        match_bymountdvd = re_bymountdvd.match(line)
        mntdir = ''
        if match_cd or match_bymountcd:
            m = match_cd or match_bymountcd
            dev = m.group(1)
            mntdir = m.group(2)
        elif match_cdrec or match_bymountcdr:
            m = match_cdrec or match_bymountcdr
            dev = m.group(1)
            mntdir = m.group(2)
        elif match_dvd or match_bymountdvd:
            m = match_dvd or match_bymountdvd
            dev = m.group(1)
            mntdir = m.group(2)
        elif match_iso:
            dev = match_iso.group(1)
            mntdir = match_iso.group(2)
        elif match_automount:
            dev = match_automount.group(2)
            mntdir = match_automount.group(1)
        if mntdir:
            list.append((dev, mntdir, "iso9660"))
            Log(mntdir)
    fd_fstab.close()
    return list

def GetMount():
    list = []
    GREP = "/usr/bin/grep"           # grep
    vol = os.popen("mount | " + GREP + " -E \"disk1\"").readline()
    if vol:
        l = vol.split()
        list.append((l[0].replace('disk', 'rdisk'), l[2], l[3][1:-1]))
    return list

def main(argv=None):
    """Main program."""

    if argv is None:
        argv = sys.argv
    return GetCDMountPoint()


if __name__ == '__main__':
    sys.exit(main())
