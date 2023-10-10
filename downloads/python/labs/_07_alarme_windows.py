#!/usr/bin/env python
# coding: UTF-8
#
## @package _07_alarme_windows
#    Playing a song at a given time.
#
#    @author Paulo Roma
#    @since 21/05/2009
#    @see http://docs.python.org/library/time.html
#    @see http://www.mpg123.de/

import time
import os
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
def alarme(h, m, fplayer, player, song):
    while (True):
        dt = list(time.localtime())
        hour = dt[3]
        minute = dt[4]
        if hour == h and minute == m:
            return os.spawnv(os.P_WAIT, fplayer, [player, song])
        time.sleep(0.1)  # Suspend execution for the given number of seconds


##
#   @brief Main function for testing.
#
#   @param argv starting hour and minute.
#
def main(argv=None):
    ## It can be anything
    player = "mpg123"

    ## Use mpg123
    #fplayer1 = "C:\\Program Files\\mpg123\\mpg123.exe"
    fplayer1 = "C:\\Arquivos de Programas\\mpg123\\mpg123.exe"

    ## Use Windows Media Player
    #fplayer2 = "C:\\Program Files\\Windows Media Player\\wmplayer.exe"
    fplayer2 = "C:\\Arquivos de Programas\\Windows Media Player\\wmplayer.exe"

    ## Since the music name contains spaces, it is necessary to put it between quotes
    #musica  = "\"W:\\Blackmores Night\\1999 - Under a Violet Moon\\01 - Under a Violet Moon.mp3\""
    ## Requires mpg123 1.11.0 or superior.
    musica = "\"http://dl.lcg.ufrj.br/python/videos/01 - Minha Musica.mp3\""

    hora = int(input("Alarm Start hour: "))
    minu = int(input("Alarm Start minute: "))
    plyr = int(input("Player: 1 - mpg123, 2 - Windows Media Player "))

    if (plyr == 1):
        fplayer = fplayer1
    else:
        fplayer = fplayer2

    # Call alarm function
    alarme(hora, minu, fplayer, player, musica)


if __name__ == '__main__':
    main()
