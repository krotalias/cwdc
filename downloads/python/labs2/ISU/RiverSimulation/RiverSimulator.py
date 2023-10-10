#!/usr/bin/env python
# coding: UTF-8
#
## \mainpage RiverSimulator - A dynamic ecosystem simulation.
#
#  The goal of this assignment is to write a Python program to simulate an ecosystem
#  that consists of Bears and Fishes, living in a River. 
#  <br>
#  The simulation proceeds in cycles, at each of which all Animals
#  age, and a subset of them move, mate, or die, according to certain rules.
#
# @section notes release.notes
# This progrm runs either in python 2.7 or python 3.6
#
# To run the program:
# - python RiverSimulator.py \<file name\>
# <br>
# where the optional "file name" is the name of a one line file, 
# with the initial river configuration, such as:
# - --- BF1 --- FM2 --- --- --- ---
# <br>
# This will create a river of length 8, with a one year old female Bear,
# and a two year old male Fish.  
#
# To automatically test the program:
# - python RiverTest.py
#
# The output is logged on a file with the following naming convention, 
# which uses the date and time of the execution:
# - River-2018-02-13:07-22-36.txt
# <pre>
#    FF0 FM1 BF0 FF2 FM1 FM1
#    FF1 FM2 BF1 --- FM2 FM2
#    FF2 --- BF2 FM0 FM3 FM3
#    FF3 --- BF3 FM1 FM4 FM4
#    --- --- BF4 FM2 --- ---
#    --- --- BF5 --- --- ---
#    --- BF6 --- --- --- ---
#    --- BF7 --- --- --- ---
#    --- --- BF8 --- --- ---
#    --- --- BF9 --- --- ---
# </pre>
#
## @package RiverSimulator
#
#  Simulates an ecosystem that consists of bears and fish, living in a river.
#
#  @author Paulo Cavalcanti
#  @date 11/02/2018
#

import sys, datetime
from River import *

## Check whether a string represents a number.
#
#  @return True if given string is a number, and False otherwise.
#  @see https://www.pythoncentral.io/how-to-check-if-a-string-is-a-number-in-python-including-unicode/
#  <br>
def isNumber(s):
	try:
		float(s)
		return True
	except ValueError:
		pass

	try:
		import unicodedata
		unicodedata.numeric(s)
		return True
	except (TypeError, ValueError):
		pass

	return False

## Implements a single method main for performing
#  the dialogue with the user.
#
class RiverSimulator(object):
	##
	#  Repeatedly simulates evolutions of river ecosystems. Each iteration
	#  should execute as the Project Description describes.
	# 
	#  @param argv file name to read input from.
	#  @see https://stackoverflow.com/questions/5012560/how-to-query-seed-used-by-random-random
	#  <br>
	def main(self,argv=None):
		if argv is None:
			argv = sys.argv
		count = 0
		fname = "River.txt"
		seed = None
		if len(argv) > 1:
			if (isNumber(argv[1])):
				seed = int(argv[1])
			else:
				fname = argv[1]
		while True:
			count += 1
			print("River Ecosystem Simulator")
			try:
				choice = int(input("keys: 1 (random river) 2 (file input) 3 (exit)\n"))
			except (SyntaxError,NameError,ValueError) as e:
				print("Reason: %s" % e)
				exit("End of fun!")
			if (choice == 1 or choice == 2):
				date = datetime.datetime.now()
				dateFormat = date.strftime('%Y-%m-%d:%H-%M-%S') # "yyyy-MM-dd:HH-mm-ss"
				file = "River-" + dateFormat.format(date) + ".txt"

				if choice == 1:
					print("Trial %d: %d\nRandom River" % (count, choice))
					try:
						length = int(input("Enter river length: "))
					except:
						continue
					river = River(length,seed)
				else:
					print("Trial %d: %d\nFile %s" % (count, choice, fname))
					try:
						river = River(fname,seed)
					except IOError as e:
						river = None

				if river is not None:
					try:
						cycles = int(input("Enter the number of cycles: "))
					except:
						continue
					print("Initial river (seed = %s):\n%s\n" % (str(river.getSeed()),river))
					river.write(file)

					for i in range(cycles):
						river.updateRiver()
						print("After cycle %d :\n%s\n" % (i+1, river))
						river.write(file)
					river.updateRiver()
					print("Final river:\n%s\n" % river)
					river.write(file)
			elif choice == 3:
				break

# Lets the game begin...
if __name__ == "__main__":
	sys.exit(RiverSimulator().main())
