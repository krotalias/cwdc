#!/usr/bin/env python
#
## @package _07_alarme
#
#   Playing a song at a given time.
#
#   @author Paulo Roma
#   @since 07/01/2009
#   @see http://docs.python.org/library/time.html
#   @see http://www.mpg123.de/

import time
import os
import platform
import sys

##
#   @brief Plays a given song at given time using a given player.
#
#   @param h starting hour.
#   @param m starting minute.
#   @param fplayer full path of the player executable.
#   @param player a player.
#   @param song a song.
#   @return process id of the player.
#
def alarm(h, m, fplayer, player, song):
    while (True):
        dt = list(time.localtime())
        hour = dt[3]
        minute = dt[4]
        if hour == h and minute == m:
            return os.spawnv(os.P_NOWAIT, fplayer, [player, song])
        time.sleep(0.1)    # Suspend execution for the given number of seconds

##
#   @brief Main function for testing.
#
#   @param argv starting hour and minute.
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    if len(argv) < 3:
        print("Usage: {} hr min".format(argv[0]))
        return 1
    else:
        if not (argv[1].isdigit() and argv[2].isdigit()):
            print("An hour and minute are expected.")
            return 1
        else:
            hour = int(argv[1])
            min = int(argv[2])

    player = "mpg123"
    artist = "Blackmores Night"
    album = "1999 - Under a Violet Moon"
    track = "01 - Under a Violet Moon.mp3"
    slash = os.sep
    pth0 = "http://orion.lcg.ufrj.br/mp3"
    if (platform.uname()[0] == "Linux"):
        pth = "/home/mp3"                      # linux
        fplayer = "/usr/bin/" + player
    elif (platform.uname()[0] == "Darwin"):
        pth = "/Users/Shared/mp3"              # macos
        fplayer = "/opt/local/bin/" + player
    else:                                      # try windows portuguese
        pth = "W:"
        ext = ".exe"
        drive = "C:"
        fplayer = drive + slash + "Arquiv~1" + slash + player + slash + player + ext
        if (not os.path.exists(fplayer)):      # try windows english
            fplayer = drive + slash + "Progra~1" + slash + player + slash + player + ext

    if (not os.path.exists(fplayer)):
        sys.exit("No {} found".format(player))

    song = pth + slash + artist + slash + album + slash + track
    if not os.path.exists(song):
        song = pth0 + slash + artist + slash + album + slash + track
    if (slash == "\\"):
        song = "\"" + song + "\""

    pid = alarm(hour, min, fplayer, player, song)
    print("%s pid is %d" % (player, pid))
    print("To finish the player, just do: kill -9 %d" % pid)
    return 0


try:
    if __name__ == "__main__":
        sys.exit(main())
except KeyboardInterrupt:                        # used Ctrl-c to abort the program
    print("Bye, bye... See you later alligator.")
except OSError as msg:
    print(msg)
