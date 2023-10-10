#!/usr/bin/env python
# coding: UTF-8
#
## @package Simulator
#
#  Simulates the growth of diseases in a virtual world.

import sys
from MyWorld import MyWorld
from World import World
from Actor import Actor

##
# This is the main method that sets up a virtual world and
# simulates the growth of diseases in the world.
#
# @param args command line arguments:
# - Number of iterations.
#
# @author Paulo Cavalcanti
# @date 22/02/2020
#
#
def main(args=None):
    if args is None:
        args = sys.argv

    numItr = 5

    if (len(args) > 1):
        numItr = int(args[1])

    print("Simulation of MyWorld")
    myworld = MyWorld()

    for _ in range(numItr):
        myworld.act()
        actors = myworld.getObjects()
        for j in actors:
            j.act()

    print("\nSimulation of World")
    world = World(100, 100)
    actor1 = Actor()
    actor2 = Actor()
    world.addObject(actor1, 10, 10)
    world.addObject(actor2, 90, 90)

    for _ in range(numItr):
        world.act()
        objs = world.getObjects()
        for j in objs:
            j.act()


try:
    if __name__ == "__main__":
        sys.exit(main())
except KeyboardInterrupt:     # used Ctrl-c to abort the program
    print("Bye, bye... See you later alligator.")
except OSError as msg:
    print(msg)
