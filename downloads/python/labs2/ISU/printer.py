#!/usr/bin/env python
# coding: UTF-8
#
## @package printer
#
#  The Printer class models the usage of paper and ink in a printer. Paper can be added to the
#  printer at any time, and we assume that there is no maximum capacity for paper. A newly
#  constructed printer has a full ink cartridge containing the quantity of ink given by the constant
#  INK_CAPACITY. The printer can print one-sided or two-sided. For each side printed, a small
#  quantity of ink is used, as given by the constant INK_USAGE. The ink cartridge can be replaced
#  at any time, restoring the ink quantity to the value INK_CAPACITY.
#
#  Please note that you do not need any conditional statements (which we start next week) to
#  complete this assignment. There will be a few places where you need to choose the smaller of
#  two numbers, which can be done with the method min().
#
#  @author Paulo Roma
#  @since 20/06/2016
#  @see http://radek.io/2011/07/21/private-protected-and-public-in-python/

import sys

## Models the usage of paper and ink in a printer.
class printer:
    ##
    # Capacity, in ounces, of a new ink cartridge.
    #
    INK_CAPACITY = 2.0  # 56.699 gramas

    ##
    # Amount of ink, in ounces, used per printed page.
    #
    INK_USAGE = 0.0023

    ## Constructs a printer that initially contains the given number of sheets of paper and
    #  a full ink cartridge.
    #
    #  @param givenNumberOfSheets inital number of sheets of paper in the printer.
    def __init__(self, givenNumberOfSheets):
        ## number of sheets available
        self.__numberOfSheets = abs(givenNumberOfSheets)
        ## total paper used since construction
        self.__totalPaperUsed = 0
        ## quantity of ink available
        self.__inkQuantity = printer.INK_CAPACITY

    ## Adds the given number of sheets of paper to this printer.
    #  We assume that there is no maximum capacity.
    #
    #  @param additionalSheets number of sheets to be added to the printer.
    def addPaper(self, additionalSheets):
        if additionalSheets > 0:
            self.__numberOfSheets += additionalSheets

    ## Returns the number of sheets of paper currently in this printer.
    #
    #  @return number of sheets available.
    def getCurrentPaper(self):
        return self.__numberOfSheets

    ## Returns the total number of sheets of paper printed by this printer since its construction.
    #  Sheets used for two sided printing still count as just one sheet.
    #
    #  @return number of sheets of paper used since construction.
    def getTotalPaperUsed(self):
        return self.__totalPaperUsed

    ## Determines whether the ink has run out. Returns true if the amount of ink left is smaller
    #  than the quantity INK_USAGE.
    #
    #  @return True if the ink is over, and False otherwise.
    def isInkOut(self):
        return self.__inkQuantity < printer.INK_USAGE

    ## Simulates replacement of the ink cartridge, restoring the quantity of ink
    #  in the printer to INK_CAPACITY.
    def replaceInk(self):
        self.__inkQuantity = printer.INK_CAPACITY

    ## Simulates printing pages in one-sided mode, using the appropriate number of sheets and a
    #  corresponding quantity of ink. If there is not enough paper, the printer will use up all
    #  remaining paper and will only use the quantity of ink needed for the sheets actually
    #  printed. If there is not enough ink, the printer will use up all the ink, and will still
    #  use up the specified number of sheets of paper
    #  (i.e., it just prints a bunch of blank pages after the ink runs out).
    #
    #  @param numberOfPages number of sheets of paper to be printed.
    def printOneSided(self, numberOfPages):
        np = max(numberOfPages, 0)
        np = min(np, self.__numberOfSheets)

        self.__totalPaperUsed += np
        self.__inkQuantity -= printer.INK_USAGE * np
        self.__inkQuantity = max(self.__inkQuantity, 0)
        self.__numberOfSheets -= np

    ## Simulates printing pages in two-sided mode, using the appropriate number of sheets and a
    #  corresponding quantity of ink. If there is not enough paper, the printer will use up all
    #  remaining paper and will only use the quantity of ink needed for the sheets actually
    #  printed. If there is not enough ink, the printer will use up all the ink, and will still
    #  use up the specified number of sheets of paper
    #  (i.e., it just prints a bunch of blank pages after the ink runs out).
    #
    #  This is similar to printOneSided() method, but you first need to determine
    #  how many sheets of paper are needed. For 1 or 2 pages, you need 1 sheet;
    #  for 3 or 4 pages, you need 2 sheets; and so on. You can use integer division
    #  (and/or the modulus operator) for this. Then, you have to figure out how many sheets
    #  of paper will actually be used (as in printOneSided()). Finally, to calculate the ink
    #  needed, you need to know how many pages will really be printed: this must be either
    #  the original number os pages requested, or (maybe twice) the number of sheets of paper
    #  available in the printer, whichever is smaller.
    #
    #  @param numberOfPages number of sheets of paper to be printed in double side mode.
    def printTwoSided(self, numberOfPages):
        np = max(numberOfPages, 0)
        np = min(np // 2 + np % 2, self.__numberOfSheets)

        self.__totalPaperUsed += np
        self.__inkQuantity -= 2 * printer.INK_USAGE * np
        self.__inkQuantity = max(self.__inkQuantity, 0)
        self.__numberOfSheets -= np

    ## Print printer statistics.
    #
    def __str__(self):
        return "Total paper used = %d\nInk quantity = %f\nNumber of Sheets = %d\n" % \
            (self.getTotalPaperUsed(), self.__inkQuantity, self.getCurrentPaper())

## Main program for testing.
def main():
    print("Constructed(50)")
    prt = printer(50)
    print(prt)

    print("printTwoSided(3)")
    prt.printTwoSided(3)
    print(prt)

    print("printOneSided(2)")
    prt.printOneSided(2)
    print(prt)

    print("printOneSided(60)")
    prt.printOneSided(60)
    print(prt)

    print("addPaper(2000)")
    prt.addPaper(2000)
    print(prt)

    print("Sheets used = %d" % prt.getTotalPaperUsed())
    print("Out of ink = %s" % prt.isInkOut())
    print("Sheets available = %d\n" % prt.getCurrentPaper())

    print("printOneSided(870)")
    prt.printOneSided(870)
    print(prt)

    print("Out of ink = %s\n" % prt.isInkOut())

    prt.replaceInk()
    print("replaceInk()")
    print(prt)


if __name__ == "__main__":
    sys.exit(main())
