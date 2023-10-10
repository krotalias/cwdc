#!/usr/bin/env python
# coding: UTF-8
#
## @package Bear
#  
#  The concrete class Bear.
#  
#  @author Paulo Cavalcanti
#  @date 11/02/2018 
#

from Animal import *

##
#  The Bear class models bears. A bear lives until the end of its 9th year 
#  (10 simulation cycles), unless it is killed earlier. 
#  A bear has a strength that varies with age. 
#
#  Bear extends the Animal class, providing appropriate implementations of the:
#
#  - constructors, 
#  - getAge(),
#  - maxAge(), and 
#  - incrAge().
#
#  Additionally, it offers one new method:
#
#  - getStrength()
#
class Bear (Animal):
	##
	#  Creates a Bear of given age and gender.
	#  If no age is given, then creates a Bear of a random age and gender.
	# 
	#  @param age
	#            The age of the Bear to be created.
	#  @param gender
	#            The gender of the Bear to be created.
	#
	def __init__(self, age=None, gender=None):
		super(Bear,self).__init__(age,gender)
		if age is None:
			# the Animal constructor did the rest
			self.age = RandomSingleton.getInstance().nextInt(Animal.BEAR_MAX_AGE) 
		else:
			self.age = age
			self.gender = gender

	##
	#  Returns true if the current age of the animal has reached the limit for
	#  the species otherwise, it return false.
	# 
	#  @return true if age limit has been reached, false otherwise.
	#
	def maxAge(self):
		return (self.age >= Animal.BEAR_MAX_AGE)

	##
	#  If the current age of the animal is less than the maximum for the
	#  species, increment the age of the animal by one and return true.
	#  Otherwise, it leaves the age as is and return false.
	# 
	#  @return true if the age has been incremented, false otherwise.
	#
	def incrAge(self):
		limit = False
		if not self.maxAge():
			self.age += 1
			limit = True
		return limit

	##
	# Returns the current strength of self Bear.
	# 
	# @return current strength.
	#
	def getStrength(self):
		mid = Animal.BEAR_MAX_AGE//2
		return (self.age+1) if (self.age <= mid ) else (Animal.BEAR_MAX_AGE-self.age)

	##
	#  Produces a string representation of self Bear object as described in the
	#  Project Description. e.g. BF7 would be returned for a 7-year old female
	#  bear.
	# 
	#  @return The string representation of this Bear.
	#
	def __repr__(self):
		bear = "B"
		bear += "F" if self.gender == Gender.FEMALE else "M"
		bear += str(self.getAge())
		return bear

	##
	#  @param other bear that will be involved in the comparison.
	#
	def __eq__(self, other):
		"""Checks if two bears are equal."""
		if other is None:
			return False
		return self.age == other.age and self.gender == other.gender

def main():
	b = Bear()
	print (b)
	print(b.getStrength())
	b = Bear(9,'M')
	print(b)
	b.incrAge()
	print(b)

if __name__ == "__main__":
	main()
