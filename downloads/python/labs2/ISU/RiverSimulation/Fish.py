#!/usr/bin/env python
# coding: UTF-8
#  
## @package Fish
#
#  The concrete class Fish.
#
#  @author Paulo Cavalcanti
#  @date 11/02/2018
#  

from Animal import *

##
#  The Fish class models fishes. A fish lives at most up to the end of its fourth year 
#  (five simulation cycles), unless it is killed earlier. 
#
#  Fish extends the Animal class, providing appropriate implementations of the:
#
#  - constructors, 
#  - getAge(),
#  - maxAge(), and 
#  - incrAge().
#
class Fish (Animal):
	##
	#  Creates a Fish of given age and gender
	#  If no age is given, then creates a Fish of a random age and gender.
	# 
	# @param age
	#            The age of the Fish to be created.
	# @param gender
	#            The gender of the Fish to be created.
	#
	def __init__(self, age=None, gender=None):
		super(Fish,self).__init__(age,gender)
		if self.age is None:
			# the Animal constructor did the rest
			self.age = RandomSingleton.getInstance().nextInt(Animal.FISH_MAX_AGE) 
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
		return (self.age >= Animal.FISH_MAX_AGE)

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
	#  Produces a string representation of self Fish object as described in the
	#  Project Description. e.g. FM3 would be returned for a 3-year old male
	#  fish.
	# 
	#  @return The string representation of this Fish.
	#
	def __repr__(self):
		fish = "F"
		fish += "F" if self.gender == Gender.FEMALE else "M"
		fish += str(self.getAge())
		return fish

	##
	#  @param other fish that will be involved in the comparison.
	#
	def __eq__(self, other):
		"""Checks if two fishes are equal."""
		if other is None:
			return False
		return self.age == other.age and self.gender == other.gender

def main():
	f = Fish()
	print (f)

if __name__ == "__main__":
	main()
