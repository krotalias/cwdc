#!/usr/bin/env python
# coding: UTF-8
#
## @package TextUI
#

import sys

from BullsAndCowsGame import BullsAndCowsGame, WordList, Status

##
# A simple text-based user interface for the BullsAndCowsGame.
#
class TextUI:

    ## Class (static) variable.
    # Name of file containing words.
    #
    DICTIONARY_FILENAME = "palavras.txt"

    ## Class (static) variable.
    # Size of words to use for this game.
    #
    WORD_SIZE = 5

    ##
    # Constructs a user interface that will use the given game.
    #
    # @param givenGame a game object.
    #
    def __init__(self, givenGame):
        ## The game object used by this UI.
        self.game = givenGame

    ##
    # Main user interface loop.
    #
    def runUI(self):
        done = False

        # start with player 0
        whoseTurn = 0

        while not done:
            self.display()

            try:
                if (sys.hexversion > 0x03000000):
                    word = input("Player %d enter your guess: " % whoseTurn)
                else:
                    word = raw_input("Player %d enter your guess: " %
                                     whoseTurn).decode("utf-8")
            except KeyboardInterrupt:
                exit("\nTerminated by user %d" % whoseTurn)

            word = word.strip().lower()
            status = self.game.guess(word)
            if status == Status.INVALID_WORD:
                print("Invalid word!")
                whoseTurn = 1 - whoseTurn
                print("It is player %d's turn now." % whoseTurn)
            elif status == Status.LOSE_TURN:
                print("Sorry, no new bulls.")
                whoseTurn = 1 - whoseTurn
                print("It is player %s's turn now." % whoseTurn)
            elif status == Status.KEEP_TURN:
                print("Good guess!")
            elif status == Status.WIN:
                print("You won!")
                print("The word was " + self.game.getSecretWord())
                done = not self.playAgain()
                if not done:
                    self.game.startNewRound()
                    print("\nSecret Word = " + self.game.getSecretWord())
                    whoseTurn = 1 - whoseTurn

    ##
    # Displays the game state.
    #
    def display(self):
        print("")
        print("------------------------------")
        print("Bulls: " + self.game.getBulls())
        print("Cows:  " + self.game.getCows())
        print("Geese: " + self.game.getGeese())
        print("------------------------------")

    ##
    # Queries whether the player wants to play again.
    #
    # @return
    #   true if the player chooses to play again, false otherwise
    #
    def playAgain(self):
        try:
            if (sys.hexversion > 0x03000000):
                response = input("Do you want to play again (y/n)?")
            else:
                response = raw_input("Do you want to play again (y/n)?")
        except (SyntaxError, KeyboardInterrupt):
            exit("\nTerminated by user")
        return len(response) > 0 and response.lower()[0] == "y"

## Main program for testing.
#
# Usage: "BullsAndCowsGame.py palavras.txt ainda"
#
# @param argv secret word and word file name.
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    wlist = WordList(TextUI.DICTIONARY_FILENAME)
    if len(argv) > 1:  # a file name for getting words from was given
        print("Running: %s" % argv[0])
        TextUI.DICTIONARY_FILENAME = argv[1]
        wlist = WordList(TextUI.DICTIONARY_FILENAME)

        if len(argv) > 2:  # a secret word was also given
            if (sys.hexversion > 0x03000000):
                secretWord = argv[2]
            else:
                secretWord = argv[2].decode("utf-8")
            TextUI.WORD_SIZE = len(secretWord)
            print("secret word = %s, length = %d\n" %
                  (secretWord, TextUI.WORD_SIZE))
            game = main2(TextUI.DICTIONARY_FILENAME,
                         secretWord)  # a given secret word
        else:
            game = BullsAndCowsGame(wlist, TextUI.WORD_SIZE)
    else:
        game = BullsAndCowsGame(wlist, TextUI.WORD_SIZE)
    print("\nSecret Word = %s" % game.getSecretWord())
    ui = TextUI(game)
    ui.runUI()

## Another test.
#
#  @param fwords filename for getting words from.
#  @param word secret word.
#
def main2(fwords, word):
    wl = WordList(fwords)
    try:
        bcg = BullsAndCowsGame(wl, word)
    except (ValueError, TypeError) as detail:
        print(detail)
        exit('Searching word "%s" in file "%s"' %
             (word, TextUI.DICTIONARY_FILENAME))

    # just testing
    i = wl.binarySearch(wl.words, word)
    print("%s index: %d" % (word, i))
    print("words[%d] = %s" % (i, wl.words[i]))
    print("Dictionary sizes: %s" % wl.sizes)
    print("A word of size %d: %s" %
          (TextUI.WORD_SIZE, wl.generate(TextUI.WORD_SIZE)))

    return bcg


if __name__ == "__main__":
    sys.exit(main())
