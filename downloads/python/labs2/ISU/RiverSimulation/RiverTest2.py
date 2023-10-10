import unittest
from Animal import Gender

from Bear import Bear
from Fish import Fish
from River import River

##
# @package AD2
# Class that tests all the object methods.
##
class TestRiverSimulator(unittest.TestCase):

    def test___init__(self):
        """ Test the Fish and Bear creation. """
        fish = Fish(1, Gender.FEMALE)
        bear = Bear(1, Gender.MALE)
        self.assertEqual(fish, Fish(1, Gender.FEMALE))
        self.assertEqual(bear, Bear(1, Gender.MALE))
        return


    def test_getAge(self):
        """ Test the Fish and Bear getAge() methods. """
        animals = Fish(2, Gender.MALE), Bear(2, Gender.FEMALE) # test getAge of Fish and Bear
        for animal in animals:
            self.assertEqual(animal.getAge(), 2)
        return

    def test_maxAge(self):
        """ Test the Fish and Bear maxAge() methods. """
        animals = Fish(4, Gender.FEMALE), Bear(9, Gender.FEMALE)
        for animal in animals:
            self.assertTrue(animal.maxAge())
        return

    def test_incrAge(self):
        """ Test the Fish and Bear increAge() methods. """
        animals = Fish(1), Bear(1)
        for animal in animals:
            self.assertTrue(animal.incrAge()) # the animals could increment their ages

        animals = Fish(4), Bear(9)
        for animal in animals:
            self.assertFalse(animal.incrAge()) # the animals could not increment their ages
        return

    def test_getStrength(self):
        """ Test the Bear getStrength() method. """

        # see the table of bear strengths in the project requirements.
        for age in range(5): # bears from age 0 to 4 have strength = age + 1
            self.assertEqual(Bear(age).getStrength(), age + 1)
        for age in range(5, 10): # bears from age 5 to 9 have strength = 9 - age
            self.assertEqual(Bear(age).getStrength(), 9 - age)

    def test__eq__(self):
        """ Test the __eq__ method of Fish and Bear classes. """
        bm0 = Bear(0, Gender.MALE)
        self.assertEqual(bm0, Bear(0, Gender.MALE))

        ff4 = Fish(4, Gender.FEMALE)
        self.assertEqual(ff4, Fish(4, Gender.FEMALE))


    def test__repr__(self):
        """ Test the __repr__ method of the Animal class """
        bm9 = Bear(9, Gender.MALE)
        ff4 = Fish(4, Gender.FEMALE)
        self.assertEqual(repr(bm9), "BM9")
        self.assertEqual(repr(ff4), "FF4")

    def test_init_river(self):
        """ Test the river constructor using the length and the file name. """
        # 1 is the seed that generates the sequence 'FF2 BM7 FF3 BF9 ---' for the river of length = 5
        randomRiver = River(5, 1) # a river generated randomly
        self.assertEqual(repr(randomRiver), 'FF2 BM7 FF3 BF9 ---')

        fileRiver = River('test2.txt') # a river generated from a text file
        self.assertEqual(repr(fileRiver), 'FM0 BF3 BF5 FF2 BM7 --- ---')


    def test_getLength(self):
        """ Test the River getLength() method. """
        river = River(5) # a random river of length = 5
        self.assertEqual(river.getLength(), 5) # the length should be 5


    def test_numEmpty(self):
        """ Test the River numEmpty() method. """
        river = River('test2.txt') # the river from 'test2.txt' has 2 empty cells.
        self.assertEqual(river.numEmpty(), 2) # there should be 2 empty cells


    def test_addRandom(self):
        """ Test the River addRandom() method. """

        river = River('test2.txt') # the river from 'test2.txt' has 2 empty cells.
        self.assertTrue(river.addRandom(Bear)) # filling those 2 empty cells
        self.assertTrue(river.addRandom(Bear))
        self.assertFalse(river.addRandom(Bear)) # when the river is full, addRandom returns False

    def test_updateCell(self):
        """ Test the River updateCell() method. """
        river = River(4, 1) # a river of length 4 and seed 1
        self.assertEqual(repr(river), 'FF2 BM7 FF3 BF9')
        river.updateCell(0)
        self.assertEqual(repr(river), '--- BM7 FF3 BF9') # FF2 turns FF3 and dies when interacting with a Bear
        river.updateCell(1)
        self.assertEqual(repr(river), '--- BM8 FF3 BF9') # BM7 turns BM8 and does not move
        river.updateCell(2)
        self.assertEqual(repr(river), '--- BM8 FF4 BF9') # FF3 turns FF4 and does not move
        river.updateCell(3)
        self.assertEqual(repr(river), '--- BM8 FF4 ---') # BF9 reaches the maximum age and dies
        river.updateCell(1)
        self.assertEqual(repr(river), '--- --- BM9 ---') # BM8 turns BM9 and kills FF4
        river.updateCell(2)
        self.assertEqual(repr(river), '--- --- --- ---') # BM9 reaches the maximum age and dies

    def test_updateRiver(self):
        """ Test the River updateRiver() method. """
        river = River(4, 10) # 10 is the seed for this river of length 4
        self.assertEqual(repr(river), '--- FF3 FM3 ---')
        river.updateRiver()
        self.assertEqual(repr(river), 'FF4 FM4 --- ---')

    def test_write(self):
        """ Test the River write() method. """
        river = River(4, 3) # a river of length 4 and seed 3
        self.assertEqual(repr(river), 'FM2 --- --- FM3')
        river.write('output_test2.txt') # name of the output file for this test
        newRiver = River('output_test2.txt') # creates a new River using the file just written
        self.assertEqual(repr(newRiver), 'FM2 --- --- FM3') # confirms that the output_test2.txt file was read properly

if __name__ == '__main__':
    unittest.main()
