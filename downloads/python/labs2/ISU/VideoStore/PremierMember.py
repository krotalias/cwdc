#!/usr/bin/env python
# coding: UTF-8
#
## @package PremierMember
#
#  A class describing a PremierMmeber customer of the Video Store.
#
#  @author Paulo Roma
#  @since 11/07/2017

from ClubMember import ClubMember
from Customer import Customer

## Inherits from ClubMember.
#  PremierMembers are allowed to rent items even if they currently have overdue items, and are
#  never charged late fees (though they still collect the early return bonus for new releases).
#  - Premier members accumulate 3 bonus points for each item returned on time. Ten bonus points
#  are worth 1.50.
#  - Each time they accumulate 10 bonus points, the bonus points are automatically
#  converted to a 1.50 credit on the customer’s balance.
#
#
class PremierMember (ClubMember):
    ## Constructor from the customer name.
    #
    #
    def __init__(self, name):
        super(PremierMember, self).__init__(name)
        ## bonus points earned by the member.
        self.__bonusPoints = 0

    ## Updates the balance if a credit is due.
    # Premier members are never charged late fees,
    # but earns bonuses for early returns.
    #
    # @param fee late fee.
    # @param date due date.
    # @param today return date.
    #
    def setBalance(self, fee, date, today):
        if fee <= 0:  # no fee (early return)
            self.__bonusPoints += 3
            if self.__bonusPoints >= 10:
                # I do not want to call ClubMember's setBalance().
                Customer.setBalance(self, -150, date, today)
                self.__bonusPoints -= 10
