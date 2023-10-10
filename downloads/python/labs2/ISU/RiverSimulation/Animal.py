#!/usr/bin/env python
# coding: UTF-8
#
## @package Animal
#
#  The abstract class Animal.
#
#  @author Paulo Cavalcanti
#  @date 11/02/2018
#

import random
from enum import Enum
from RandomSingleton import *
try:                 # python >= 3.4
  from abc import ABC, ABCMeta, abstractmethod
except ImportError:  # python 2
  from abc import ABCMeta, abstractmethod
  ABC = object

## The gender of an animal.
class Gender (Enum):
	FEMALE = 1
	MALE = 2

##
 #  An abstract, Animal, class that is used to reduce code repetition
 #  between similar characteristics of different animals.
 #
class Animal(ABC):
	__metaclass__ = ABCMeta

	##
	#  Life expectancies of the animals.
	#
	BEAR_MAX_AGE = 9
	FISH_MAX_AGE = 4

	##
	#  Creates an animal of a given age and gender.
	#  If no gender is passed, then create
	#  an animal of a random gender.
	#
	#  @param age    The age of the animal to be created.
	#  @param gender The gender of the animal to be created.
	#
	def __init__(self, age=None, gender=None):
		## The gender of the animal.
		if gender is None:
			self.gender = Animal.getRandomGender()
		else:
			self.gender = gender

		## The age of the animal.
		self.age = age

	## Returns a random gender for an animal.
	@staticmethod
	def getRandomGender():
		randObj = RandomSingleton.getInstance()
		randomGender = randObj.nextInt(1)
		return Gender.FEMALE if randomGender == 0 else Gender.MALE

	##
	#  Returns the age of the animal.
	# 
	#  @return The age of the animal.
	#
	def getAge(self):
		return self.age

	##
	#  Returns true if the current age of the animal has reached the limit for
	#  the species otherwise, it return false.
	# 
	#  @return true if age limit has been reached, false otherwise.
	#
	@abstractmethod
	def maxAge(self):
		pass
			
	##
	#  If the current age of the animal is less than the maximum for the
	#  species, increment the age of the animal by one and return true.
	#  Otherwise, it leaves the age as is and return false.
	# 
	#  @return true if the age has been incremented, false otherwise.
	#
	@abstractmethod
	def incrAge(self):
		pass

def main():
	a = Animal()
	b = Animal()
	b.incrAge()
	print (a.gender)
	print (b.gender)
	print (b.age)

if __name__ == "__main__":
	main()
