#!/usr/bin/env python
# coding: UTF-8
#
## @package DNAStrandTest
#
#  Class for testing the DNA strand matching.
#
#  @author Paulo Roma
#  @since 18/12/2019
#  @see https://docs.python.org/2/library/unittest.html
#

from DNAStrand import DNAStrand
import sys
import unittest

##
# Class for testing certain aspects of the behavior of
# DNAStrand.
#
class DNAStrandTest(unittest.TestCase):
    ##
    # Two DNAStrand objects to be used in the tests.
    #
    def setUp(self):
        self.d1 = DNAStrand("TCAT")
        self.d2 = DNAStrand("AGAGCAT")

    def test_createComplement(self):
        msg = "complement() should return the given string"
        self.assertEqual(str(self.d1.createComplement()), "AGTA", msg)
        self.assertEqual(str(self.d2.createComplement()), "TCTCGTA", msg)

    def test_findMatchesWithRightShift(self):
        msg = "findMatchesWithRightShift() should return the given string"
        self.assertEqual(self.d1.findMatchesWithRightShift(
            self.d2, 0), "TCat", msg)
        self.assertEqual(self.d1.findMatchesWithRightShift(
            self.d2, 1), "tcaT", msg)
        self.assertEqual(self.d1.findMatchesWithRightShift(
            self.d2, 2), "tcat", msg)
        self.assertEqual(self.d1.findMatchesWithRightShift(
            self.d2, 3), "tcaT", msg)
        self.assertEqual(self.d1.findMatchesWithRightShift(
            self.d2, 4), "tcat", msg)

        self.assertEqual(
            "AGagcat", self.d2.findMatchesWithRightShift(self.d1, 0), msg)

    def test_countMatchesWithRightShift(self):
        msg = "countMatchesWithRightShift() should return the given amount"
        self.assertEqual(
            self.d1.countMatchesWithRightShift(self.d2, 0), 2, msg)
        self.assertEqual(
            self.d1.countMatchesWithRightShift(self.d2, 1), 1, msg)
        self.assertEqual(
            self.d1.countMatchesWithRightShift(self.d2, 2), 0, msg)
        self.assertEqual(
            self.d1.countMatchesWithRightShift(self.d2, 3), 1, msg)
        self.assertEqual(
            self.d1.countMatchesWithRightShift(self.d2, 4), 0, msg)

        self.assertEqual(self.d2.countMatchesWithLeftShift(self.d1, 0), 2, msg)

    def test_findMatchesWithLeftShift(self):
        msg = "findMatchesWithLeftShift() should return the given string"
        self.assertEqual(self.d1.findMatchesWithLeftShift(
            self.d2, 0), "TCat", msg)
        self.assertEqual(self.d1.findMatchesWithLeftShift(
            self.d2, 1), "tcat", msg)
        self.assertEqual(self.d1.findMatchesWithLeftShift(
            self.d2, 2), "TCaT", msg)
        self.assertEqual(self.d1.findMatchesWithLeftShift(
            self.d2, 3), "tcat", msg)
        self.assertEqual(self.d1.findMatchesWithLeftShift(
            self.d2, 4), "tcAt", msg)
        self.assertEqual(self.d1.findMatchesWithLeftShift(
            self.d2, 5), "Tcat", msg)
        self.assertEqual(self.d1.findMatchesWithLeftShift(
            self.d2, 6), "tcat", msg)
        self.assertEqual(self.d1.findMatchesWithLeftShift(
            self.d2, 7), "tcat", msg)

    def test_countMatchesWithLeftShift(self):
        msg = "countMatchesWithLeftShift() should return the given amount"
        self.assertEqual(self.d1.countMatchesWithLeftShift(self.d2, 0), 2, msg)
        self.assertEqual(self.d1.countMatchesWithLeftShift(self.d2, 1), 0, msg)
        self.assertEqual(self.d1.countMatchesWithLeftShift(self.d2, 2), 3, msg)
        self.assertEqual(self.d1.countMatchesWithLeftShift(self.d2, 3), 0, msg)
        self.assertEqual(self.d1.countMatchesWithLeftShift(self.d2, 4), 1, msg)
        self.assertEqual(self.d1.countMatchesWithLeftShift(self.d2, 5), 1, msg)
        self.assertEqual(self.d1.countMatchesWithLeftShift(self.d2, 6), 0, msg)
        self.assertEqual(self.d1.countMatchesWithLeftShift(self.d2, 7), 0, msg)

    def test_findMaxPossibleMatches(self):
        msg = "findMaxPossibleMatches() should return the given integer"
        self.assertEqual(self.d1.findMaxPossibleMatches(self.d2), (3, -2), msg)

    def test_letterCount(self):
        msg = "letterCount() should return the given integer"
        self.assertEqual(self.d1.letterCount('A'), 1, msg)
        self.assertEqual(self.d1.letterCount('C'), 1, msg)
        self.assertEqual(self.d1.letterCount('G'), 0, msg)
        self.assertEqual(self.d1.letterCount('T'), 2, msg)

    def test_isValid(self):
        msg = "isValid() should return the given boolean"
        self.assertTrue(self.d1.isValid(), msg)
        self.assertTrue(self.d2.isValid(), msg)

    def test_matches(self):
        msg = "matches() should return the given boolean"
        self.assertTrue(self.d1.matches('A', 'T'), msg)
        self.assertFalse(self.d1.matches('C', 'T'), msg)
        self.assertTrue(self.d2.matches('C', 'G'), msg)
        self.assertFalse(self.d2.matches('C', 'A'), msg)

    def test_Exception(self):
        with self.assertRaises(ValueError):
            DNAStrand("casas")


if __name__ == "__main__":
    unittest.main()
