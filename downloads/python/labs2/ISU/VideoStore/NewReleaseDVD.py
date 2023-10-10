#!/usr/bin/env python
# coding: UTF-8
#
## @package NewReleaseDVD
#
#  A class describing a NewReleaseDVD of the Video Store.
#
#  @author Paulo Roma
#  @since 26/11/2018

from DVD import DVD

## Inherits from DVD and represents a DVD that has just been released on the market.
#
#
class NewReleaseDVD (DVD):
    ## Bonus for early return.
    BONUS = 100
    ## Penalty for each additional late day.
    PENALTY = 150
    ## First day late fee.
    FIRST_DAY_FEE = 400

    ## Constructor from a title, a genre and a barcode.
    #
    #
    def __init__(self, title, genre, barcode):
        super(NewReleaseDVD, self).__init__(title, genre, barcode)

    ## Calculates a bonus (if returned earlier) or a late fee.
    #  If it is returned early, the renter gets a 1.00 credit on
    #  his or her balance (i.e., calculateLateFee returns -100).
    #  The late fee is 4.00 for the first day
    #  late plus 1.50 per day for each additional day.
    #
    #  @param today the date on which the item is being returned.
    #  @return the late fee or bonus for returning the item on the given date,
    #          or zero if the item is not currently rented.
    #
    def calculateLateFee(self, today):
        fee = 0
        if self.isRented():
            if today < self.getDueDate():  # early return
                fee = -NewReleaseDVD.BONUS  # get a bonus
            else:
                days = today - self.getDueDate()
                if days > 0:
                    fee += NewReleaseDVD.FIRST_DAY_FEE + \
                        (days - 1) * NewReleaseDVD.PENALTY

        return fee

    ## Rents for 4.00 for two days.
    #
    #  @return rental cost.
    #
    def getRentalCost(self):
        return 400

    ## Returns the number of days allowed to keep this DVD.
    #
    #  @return number of allowed rental days.
    #
    def getRentalDays(self):
        return 2
