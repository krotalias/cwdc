#!/usr/bin/env python
# coding: UTF-8
#
## @package RiverTest
#
#  Unit test for certain aspects of the behavior of 
#  RiverSimulator.
# 
#  @author Paulo Cavalcanti
#  @date 13/02/2018
#  @see https://docs.python.org/3/library/unittest.html
#

from River import *
import sys
import unittest

class RiverTest(unittest.TestCase):
  ##
  #  Seed for controlling random number generator.
  #
  SEED = 19580427
  
  def test_FF3_FF4_BF4(self):
    river = River("RiverTest.txt")  
    
    # "FF3 FF4 BF4" -> FF4 dies old
    
    # FF4 --- BF5
    
    msg1 = "BF5 --- ---" # BF5 moved to the right (FF4 moved to the left (eaten) or did not move)
    msg2 = "--- --- BF5" # FF4 moved to the left and BF5 did not move
    msg3 = "--- BF5 ---" # BF5 moved to the left and FF4 moved to right
    msg4 = "FF4 --- BF5" # BF5 and FF4 did not move
    msg5 = "FF4 BF5 ---" # BF5 moved to the left and FF4 did not move
    msg6 = "BF5 FF4 ---" # FF4 moved to the right and BF5 to the right
    msg7 = "--- FF4 BF5" # FF4 moved to the right and BF5 did not move
  
    self.assertEqual("FF3 FF4 BF4", str(river))
    
    print (river)  
    river.updateRiver()
    print (river)  
    
    self.assertIn("BF5", str(river))
    self.assertNotEqual(str(river),"--- --- ---")
   
    # seven possibilities 
    self.assertTrue(msg1 == str(river) or
                    msg2 == str(river) or
                    msg3 == str(river) or
                    msg4 == str(river) or
                    msg5 == str(river) or
                    msg6 == str(river) or
                    msg7 == str(river))

    river.updateRiver()
    print (river)
    self.assertIn("BF6", str(river))
    self.assertNotIn("FF", str(river))

    # FF4 dies old
    # BF6 can be in any of the three cells 

    msg1 = "BF6 --- ---"
    msg2 = "--- --- BF6"
    msg3 = "--- BF6 ---"

    # three possibilities
    self.assertTrue(msg1 == str(river) or
                    msg2 == str(river) or
                    msg3 == str(river))

    # create a river with length 5
    # we want to repeat the same choices.
    river = River(5, RiverTest.SEED) 
    print(river)
    river.updateRiver(True)
    print(river)
    # python 2 and 3 give different results.
    self.assertTrue(str(river) == "BM7 BM0 BM0 --- BF3" or str(river) == "--- --- BM9 --- ---") 

def main():
	test = RiverTest()
	test.test_FF3_FF4_BF4()

if __name__=="__main__":
   unittest.main()
