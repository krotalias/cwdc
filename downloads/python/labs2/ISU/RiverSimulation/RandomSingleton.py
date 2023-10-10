#!/usr/bin/env python
# coding: UTF-8
#
## @package RandomSingleton
#
#  Random singleton class.
# 
#  @author Paulo Cavalcanti
#  @date 12/02/2018
#  @see https://gist.github.com/pazdera/1098129
#

from random import Random
import collections, time, sys, struct

## Reverse the order of the bytes of a given 32 bit word.
#  b4 b3 b2 b1 -> b1 b2 b3 b4
#
#  @param word given word.
#  @return a new word with the bytes reversed.
#  @see https://www.slac.stanford.edu/grp/lcls/controls/global/standards/software/basicIoOps.h 
#  @see https://www.devdungeon.com/content/working-binary-data-python
#
def byteReverse(word):
	val = 	((word & 0xff000000) >> 24) | ((word & 0x00ff0000) >>  8) | \
		((word & 0x0000ff00) <<  8) | ((word & 0x000000ff) << 24)

	return val

## Concentrates all of the random generation process in a single class.
#
#  The functions supplied by the random module are actually bound methods of a hidden instance of the random.Random class. 
#  We will instantiate our own instance of Random to get a generator that doesn’t share state.
#
#  There is no need to create a new class of this.
#  To get the random object from this class just call:
# 
#  <code><pre>
#  RandomSingleton.getInstance()
#  </pre></code>
# 
#  Example usage:
# 
#  <code><pre>
#      randNumber = RandomSingleton.getInstance().nextInt(10)
#  </pre></code>
# 
#  If calling from this object multiple times, it is fine to create a variable
#  referencing it:
# 
#  <code><pre>
#      randObj = RandomSingleton.getInstance()
#      randNumber = randObj.nextInt(10)
#      // Do something...
#      anotherRandNumber = randObj.nextInt(2)
#      // DO something else...
#      getRandElement = randObj.nextInt([7,-1,4,5,33])
#  </pre></code>
#
class RandomSingleton(object):
	##
	#  Singleton object to be used by the class.
	#
	__instance = None

	##
	#  Our own random object. 
	#
	__randObj = None

	## "Private" constructor.
	#   Makes __instance a reference to this object.
	#
	#   @throws Exception
	#
	def __init__(self):
		if RandomSingleton.__instance != None:
			raise Exception("This class is a singleton!")
		else:
			RandomSingleton.__instance = self
			RandomSingleton.__randObj = Random()

	##
	#  Gets an object for generating random integers.
	#  If there is no object, it is created.
	# 
	#  @return reference to a single instance of this object. 
	#
	@staticmethod
	def getInstance():
		if RandomSingleton.__instance is None:
			r = RandomSingleton()
			RandomSingleton.__randObj.seed()
		else:
			r = RandomSingleton.__instance

		return r

	## Return a random integer N such that 0 <= N <= val.
	#
	#  In Python 2.6 and better, abstract base classes were introduced, 
	#  and among other powerful features they offer more good, 
	#  systematic support for such "category checking".
	#
	#  @return a random number or a random element from a sequence.
	#  @see https://docs.scipy.org/doc/numpy/reference/generated/numpy.random.choice.html
	#  <br>
	def nextInt(self,val):
		if isinstance(val, int):
			return RandomSingleton.__randObj.randint(0,val)
		elif isinstance(val, collections.Sequence):
			return RandomSingleton.__randObj.choice(val)
		else:
			raise TypeError

	##
	#  Sets the seed used by this object to randomize. 
	#  This is useful for testing to provide reliable, 
	#  same results throughout tests.
	#
	#  Initialize internal state of the random number generator.
	#  None or no argument seeds from current time or from an 
	#  operating system specific randomness source if available 
	#  (see the os.urandom() function for details on availability).
	#  If a is not None or an int or a long, then hash(a) is used instead. 
	#  Note that the hash values for some types are nondeterministic 
	#  when PYTHONHASHSEED is enabled.
	# 
	#  @param val Seed to set in Random object.
	#
	def setSeed(self, val=None):
		# Lets start fresh!

		# we want to know the seed used
		if not isinstance(val,int):
			# From PyRandLib:
			# this provides a main advantage: for very short periods of time, 
			# the initial seeds for feeding the pseudo-random generator will be 
			# hugely different between two successive calls.

			# This method returns the time as a floating point number 
			# expressed in seconds since the epoch, in UTC.
			t = int(time.time()*1000.0) # let's include milliseconds
			val = byteReverse(t)

		## The seed value for the random number generator used in updating the river.
		self.seed = val
		RandomSingleton.__randObj.seed(val)

## Main program for testing.
def main():
	randObj = RandomSingleton.getInstance()	
	#randObj.setSeed(5) # will repeat same numbers at each run
	print (randObj.nextInt(10))
	print (randObj.nextInt(10))
	print (randObj.nextInt(10))
	print (randObj.nextInt([7,-1,4,-3,7,9,10]))
	a_byte = b'\xff'  # 255
	i = ord(a_byte)   # Get the integer value of the byte
	bin = "{0:b}".format(i)
	hex = "{0:x}".format(i)
	br = byteReverse(i)
	print ("%d = %s = %s" % (i,bin,hex))
	print ("byteReverse(%d) = %s = %s" % (i, "{0:b}".format(br), "{0:x}".format(br)))

	# Create a signed int
	# In a big-endian system, the most significant value in the sequence 
	# is stored at the lowest storage address (i.e., first)
	# 00001111 00000000 00001111
	i = int.from_bytes(b'\x0F\x00\x0F', byteorder='big', signed=True)
	bin = "{0:b}".format(i)
	hex = "{0:x}".format(i)
	br = byteReverse(i)

	print ("%d = %s = %s" % (i,bin,hex))
	print ("byteReverse(%d) = %s = %s" % (i, "{0:b}".format(br), "{0:x}".format(br)))

	# Find out what byte order your system uses
	print("Native byteorder: ", sys.byteorder)
	# Packing values to bytes
	# The first parameter is the format string. Here it specifies the data is structured
	# with a single four-byte integer followed by two characters.
	# The rest of the parameters are the values for each item in order
	binary_data = struct.pack("icc", 8499000, b'A', b'Z')
	print(binary_data)

if __name__ == "__main__":
	main()
