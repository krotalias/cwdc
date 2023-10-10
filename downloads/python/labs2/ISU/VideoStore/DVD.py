#!/usr/bin/env python
# coding: UTF-8
#
## @package DVD
#
#  A class describing a DVD of the Video Store.
#
#  @author Paulo Roma
#  @since 26/11/2018

from AbstractItem import AbstractItem
from SimpleDate import SimpleDate

## Concrete implementation of an AbstractItem.
#
#
class DVD (AbstractItem):
    ## The late fee is 1.00 per day.
    LATE_FEE = 100

    ## Constructor from a title, a genre and a barcode.
    #
    #
    def __init__(self, title, genre, barcode):
        super(DVD, self).__init__(title, genre, barcode)

    ## Calculates a late returning fee.
    #  The late fee is 1.00 per day.
    #
    #  @param today the date on which the item is being returned.
    #  @return the late fee for returning the item on the given date,
    #   or zero if the item is not currently rented.
    #
    def calculateLateFee(self, today):
        fee = 0
        if self.isRented():
            if self.getDueDate() < today:  # late return
                days = today - self.getDueDate()
                fee += DVD.LATE_FEE * days
        return fee

    ## Rents for 3.50 for five days.
    #
    #  @return rental cost.
    #
    def getRentalCost(self):
        return 350

    ## Returns the number of days allowed to keep this DVD.
    #
    #  @return number of allowed rental days.
    #
    def getRentalDays(self):
        return 5
