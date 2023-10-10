#!/usr/bin/env python
# coding: UTF-8
#
## @package BullsAndCowsTest
#
#  Class for testing the Bulls and Cows game.
#
#  @author Paulo Roma
#  @since 18/01/2017
#  @see https://docs.python.org/2/library/unittest.html
#

from BullsAndCowsGame import BullsAndCowsGame
from BullsAndCowsGame import WordList
from BullsAndCowsGame import Status
import sys
import unittest

##
# Class for testing for certain aspects of the behavior of
# BullsAndCowsGame.
#
class BullsAndCowsTest(unittest.TestCase):
    ##
    # Size of words to use for the test game.
    #
    SIZE = 5

    ##
    # Do-nothing word list to use for testing.
    #
    wordList = WordList("words.txt")

    def assertEquals(self, msg, expected_value, actual_value):
        if isinstance(expected_value, str) or \
           isinstance(expected_value, bool) or \
           isinstance(expected_value, Status):
            self.assertEqual(actual_value, expected_value, msg)

            #print ("%s: %s" %(msg, actual_value))
            #assert expected_value == actual_value, \
            #       "'%s' is not equal '%s'" \
            #       % (actual_value,expected_value)

    def test_InitialSecretWord(self):
        msg = "After construction, getSecretWord() should return the given string"
        game = BullsAndCowsGame(self.wordList, "booby")
        self.assertEquals(msg, "booby", game.getSecretWord())

    def test_InitialGuesses(self):
        msg = "If no words have been guessed, getAllLettersGuessed should return an empty string"
        game = BullsAndCowsGame(self.wordList, "booby")
        self.assertEquals(msg, "", game.getAllGuessedLetters())

    def test_InitialGetCows(self):
        msg = "If no words have been guessed, getCows should return an empty string"
        game = BullsAndCowsGame(self.wordList, "booby")
        self.assertEquals(msg, "", game.getCows())

    def test_InitialBulls(self):
        msg = "If no words have been guessed, getBulls should return '*****'"
        game = BullsAndCowsGame(self.wordList, "booby")
        self.assertEquals(msg, "*****", game.getBulls())

    def test_Bulls(self):
        msg = "If 'break' has been guessed and secret word is 'fleet', getBulls should return '**e**'"
        game = BullsAndCowsGame(self.wordList, "fleet")
        game.guess("break")
        self.assertEquals(msg, "**e**", game.getBulls())

    def test_Cows(self):
        msg = "If 'break' has been guessed and secret word is 'fleet', getCows should return 'e'"
        game = BullsAndCowsGame(self.wordList, "fleet")
        game.guess("break")
        self.assertEquals(msg, "e", game.getCows())

    def test_Gueese(self):
        msg = "If 'flesh' has been guessed and secret word is 'fleet', getGeese should return 'sh'"
        game = BullsAndCowsGame(self.wordList, "fleet")
        game.guess("flesh")
        self.assertEquals(msg, "sh", game.getGeese())

    def test_EmptyGuess(self):
        msg = "If secret word is 'fleet' and guess string is 'break', getGueese should return 'brak'"
        game = BullsAndCowsGame(self.wordList, "fleet")
        game.guess("break")
        self.assertEquals(msg, "brak", game.getGeese())
        msg = "--> If guess string is empty, getGueese should return the same thing"
        game.guess("")
        self.assertEquals(msg, "brak", game.getGeese())

    def test_NewRound(self):
        msg = "If the secret word is 'fleet' and guess is 'break', getGeese should return 'brak'"
        game = BullsAndCowsGame(self.wordList, "fleet")
        game.guess("break")
        self.assertEquals(msg, "brak", game.getGeese())

        msg = "--> If we call startNewRound, getGeese should return the empty string"
        game.startNewRound()
        self.assertEquals(msg, "", game.getGeese())

        b = game.getBulls()
        msg = "--> If we call startNewRound, getBulls should be unaffected (WorddList is null)"
        self.assertEquals(msg, b, game.getBulls())

    def test_IsOver(self):
        msg = "If we guess secret word, isOver should return 'True'"
        game = BullsAndCowsGame(self.wordList, "fleet")
        game.guess("fleet")
        self.assertEquals(msg, True, game.isOver())
        msg = "--> If we guess again, isOver should still return 'True'"
        game.guess("beats")
        self.assertEquals(msg, True, game.isOver())

    def test_WordSize(self):
        msg = "If secret word size is different than guess parameter size, it should return 'Status.INVALID_WORD'"
        game = BullsAndCowsGame(self.wordList, self.SIZE)
        self.assertEquals(msg, Status.INVALID_WORD, game.guess("fake"))

    def test_Exception(self):
        with self.assertRaises(ValueError):
            BullsAndCowsGame(self.wordList, "casas")

def main():
    test = BullsAndCowsTest()
    test.test_InitialSecretWord()
    test.test_InitialGuesses()
    test.test_InitialGetCows()
    test.test_InitialBulls()
    test.test_Bulls()
    test.test_Cows()
    test.test_Gueese()
    test.test_EmptyGuess()
    test.test_NewRound()
    test.test_IsOver()
    test.test_WordSize()


if __name__ == "__main__":
    unittest.main()
    #sys.exit(main())
