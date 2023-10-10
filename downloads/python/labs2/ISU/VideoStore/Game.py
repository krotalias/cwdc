#!/usr/bin/env python
# coding: UTF-8
#
## @package Game
#
#  A class describing a Game of the Video Store.
#
#  @author Paulo Roma
#  @since 26/11/2018

import math
from AbstractItem import AbstractItem

## Concrete implementation of an AbstractItem.
#
#
class Game (AbstractItem):
    ## The late fee is 5.00 for each week or any part of a week.
    LATE_FEE = 500

    ## Constructor from a title and a barcode.
    #  The genre is hardcoded to "GAME".
    #
    #
    def __init__(self, title, barcode):
        super(Game, self).__init__(title, "GAME", barcode)

    ##  Calculates a late returning fee.
    #  The late fee is 5.00 for each week or any part of a week.
    #
    #  @param today the date on which the item is being returned.
    #  @return the late fee for returning the item on the given date,
    #  or zero if the item is not currently rented.
    #
    def calculateLateFee(self, today):
        fee = 0
        if self.isRented():
            if self.getDueDate() < today:  # late return
                days = today - self.getDueDate()
                fee += Game.LATE_FEE * int(math.ceil(days / 7.0))
        return fee

    ## Rents for 5.00 for one week.
    #
    #  @return rental cost.
    #
    def getRentalCost(self):
        return 500

    ## Returns the number of days allowed to keep this game.
    #
    #  @return number of allowed rental days.
    #
    def getRentalDays(self):
        return 7
