#!/usr/bin/env python
# coding: UTF-8
#  
## @package River
#  
#  The concrete class River.
#  
#  @author Paulo Cavalcanti
#  @date 11/02/2018 
#

from Animal import *
from Bear import *
from Fish import *
from RandomSingleton import *

##
#  A river is represented by a string that looks like this:
#
#  - --- FF2 BM3 --- BF1 BM8 FM0 --- --- BF4
#
#  The above represents a River object whose underlying array has length 10.
#  Each element is represented by a three-character string, which is either 
#  ‘---’, which stands for None, or it has the form @f$\alpha\beta\delta@f$, where:
#
#  - @f$\alpha@f$ is either F or B, depending on whether the cell references a Fish or a Bear,
#  - @f$\beta@f$ is either F or M, depending on whether the object referenced is male or female, and
#  - @f$\delta@f$ is a single digit, between 0 and 4 for Fish objects and between 0 and 9 for Bear objects,
#   which gives the age of the object.
#
class River(object):
	## Control printing degugging information.
	__toDebug__ = False

	## Char for representing empty cells.
	cEmpty = '-'

	## An obejct for generating random numbers or choices.
	randObj = RandomSingleton.getInstance()

	## 
	# The finalize method is called when an object is about to get garbage collected. 
	# This can happen at any time after it has become eligible for garbage collection.
	# Note that it's entirely possible that an object never gets garbage collected 
	# (and thus finalize is never called).
	# 
	def __del__(self):
		try:
			if self.__pWriter!=None:
				self.__pWriter.close() # close open files
		finally:
			print("End of Simulation.")
		#	super(River,self).__del__()

	##
	#  Constructs a river from a file.
	# 
	#  @param inputFileName The name of the file to be read from.
	#  @throws IOError
	#
	def __readFile(self,inputFileName):
		try:
			file = open (inputFileName)
			for line in file:
				line = line.split()
				self.length = len(line)
				self.river = [None] * self.length
				for i in range(self.getLength()):
					if line[i][0] == River.cEmpty:		# empty cell
						self.river[i] = None
					else:
						age = int(line[i][2])
						gen = Gender.FEMALE  if line[i][1] == 'F' else Gender.MALE
						ani = Bear(age, gen) if line[i][0] == 'B' else Fish(age, gen)
						self.river[i] = ani
			file.close()
		except IOError as e:
			print(inputFileName+" not found!")
			raise e
		
	## Creates a river populated with bears and fishes of random ages and genders.		
	def createRandomRiver(self):
		animal = {0:lambda: None, 1:Bear, 2:Fish}
		for i in range(self.getLength()):
			rand = River.randObj.nextInt(2)
			self.river[i] = animal[rand]()

	##
	#  Generates a random river ecosystem of the given length, where the seed of
	#  the random number is as given.
	# 
	#  @param arg   The length of the river or a file to read input from..
	#  @param seed  The seed value used for the random number generator.
	#  @throws TypeError
	#
	def __init__(self, arg, seed=None):
		## The river in which the animals reside in.
		self.river = []
		## The length of the river (number of cells).
		self.length = 0
		self.setSeed(seed)
		## For writing this river on a file.
		self.__pWriter = None

		if isinstance(arg,int):
			if arg > 0:
				self.length = arg
				self.river = [None] * self.length
				self.createRandomRiver()
		elif isinstance(arg,str):
			fileName = arg
			self.__readFile(fileName)
		else:
			raise TypeError

	##
	#  Returns the length of the river.
	# 
	#  @return The length of the river.
	#
	def getLength(self):
		assert(self.length==len(self.river))
		return self.length

	##
	#  Sets the seed of the random number generator used in updating the river.
	# 
	#  @param seed
	#            The seed value used for the random number generator.
	#
	def setSeed(self,seed):
		River.randObj.setSeed(seed)

	##
	#  Gets the seed of the random number generator used in updating the river.
	#
	#  @return seed
	#            The seed value used for the random number generator.
	#
	def getSeed(self):
		return River.randObj.seed

	##
	#  Returns the number of empty (None) cells in the river.
	# 
	#  @return The number of empty (None) cells.
	#
	def numEmpty(self):
		return self.river.count(None)

	##
	#  If the river has no empty (None) cells, then do nothing and return false.
	#  Otherwise, add an animal of age 0 of randomly chosen gender, and of the
	#  same type as "animal", to a cell chosen uniformly at random from among the
	#  currently empty cells and return true.
	# 
	#  @param animal
	#            The type of animal that should be added to the river.
	#  @return True if an animal was added, false otherwise.
	#
	def addRandom(self,animal):
		i = self.getNullCell()
		if i >= 0:
			gender = Animal.getRandomGender()
			a = Fish(0,gender) if isinstance(animal, Fish) else Bear(0,gender)
			self.river[i] = a
		return (i >= 0)

	## Returns a random None (empty) cell, or -1 if all cells are occupied.    
	#
	#  @return the index of an empty cell.
	#  @see https://docs.python.org/3/library/functions.html#enumerate
	#  <br>
	def getNullCell(self):
		arr = [i for i, v in enumerate(self.river) if v is None]
		return River.randObj.nextInt(arr) if len(arr) > 0 else -1

	##
	#  Process the object at cell i, following the rules given in the Project
	#  Description:
	#
	#  - If it is None, do nothing. 
	#  - If it is an animal and it has reached the end of its lifespan, the animal dies. 
	#  - Otherwise, decides which direction, if any, the animal should move, 
	#  and what other actions to take (including the creation of a child). 
	#
	#  A random number is generated with three possible outcomes:
	#   - 0 - stays where it was.
	#   - 1 - jumps to the right.
	#   - 2 - jumps to the left.
	# 
	#  @param i The index of the cell to be updated.
	#
	def updateCell(self, i):
		random = River.randObj.nextInt(2)

		if self.river[i] is None:
			return
						
		if random == 0:
			return
		
		j = (i+1)%self.getLength() if random == 1 else (self.getLength() -1 if (i-1)<0 else (i-1))
		
		if self.river[j] is None:											# move the animal from i to j
			self.river[j] = self.river[i]
			self.river[i] = None
		else:
			bred = False
			if (isinstance(self.river[i],Bear) and isinstance(self.river[j], Fish)):
				self.river[j] = None										# bear eats fish
			elif (isinstance(self.river[j], Bear) and isinstance(self.river[i], Fish)):
				self.river[i] = None										# bear eats fish
			elif type(self.river[i]) == type(self.river[j]):				# same animal into i and j
				if isinstance(self.river[i], Bear):							# it is a bear
					b1 = self.river[i]
					b2 = self.river[j]
					if ( b1.gender == b2.gender ):							# two bears of same gender 
						if b1.getStrength() > b2.getStrength():				# the weaker dies
							self.river[j] = None
						elif b2.getStrength() > b1.getStrength():
							self.river[i] = None
					else:													# two bears of opposite gender
						bred = self.addRandom(b1)
				elif self.river[i].gender != self.river[j].gender:			# two fishes of opposite gender
					bred = self.addRandom(self.river[i])
			if River.__toDebug__ and bred:
				print(str(self.river[i])+" mated with "+str(self.river[j]))

	##
	#  Perform one cycle of the simulation, going through the cells of the
	#  river, updating ages, moving animals, creating animals, and killing
	#  animals, as explained in the Project Description.
	#
	#  In each cycle, all the animals in the river age by one year, and those that exceed
	#  their allotted time span die (i.e., disappear). After that, the cells of the river 
	#  are considered from left to right, starting at cell 0. If the cell contains a bear 
	#  or a fish, this animal will randomly choose to either stay where it is or to attempt 
	#  to move into an adjacent array cell to its left or right.
	#
	#  @param debug Turn debugging on or off.
	#
	def updateRiver(self, debug=False):
		River.__toDebug__ = debug
		for i in range(self.getLength()):
			if self.river[i] is not None:
				if not self.river[i].incrAge():
					self.river[i] = None	# it reached its maximum age, so dies
		for i in range(self.getLength()):
			self.updateCell(i)

	##
	#  Writes the river to an output file.
	# 
	#  @param outputFileName The name of the output file.
	#  @throws IOError
	#
	def write(self, outputFileName):
		try:
			# Lazy instantiation.
			if self.__pWriter is None:
				self.__pWriter = open(outputFileName, 'w')
			self.__pWriter.write(str(self)) 
			self.__pWriter.write('\n') 
			self.__pWriter.flush()
		except IOError as e:
			print(outputFileName+" could not be created!")
			raise e

	##
	#  Produces a string representation of the river following the format
	#  described in the Project Description.
	# 
	#  @return The string representation of the river.
	#
	def __repr__(self):
		riverStr = ""
		for i in range(self.getLength()):
			riverStr += (River.cEmpty * 3) if self.river[i] is None else str(self.river[i])
			if i < self.getLength()-1:
				 riverStr += " "
		return riverStr


def main():
	r = River(10)
	print (r)
	print("Number of null cells: %d"% r.numEmpty())
	print("Null cell: %d" % r.getNullCell())

if __name__ == "__main__":
	main()
