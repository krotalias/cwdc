#!/usr/bin/env python
# coding: UTF-8
#
## @package ClubMember
#
#  A class describing a ClubMember customer of the Video Store.
#
#  @author Paulo Roma
#  @since 26/11/2018

from Customer import Customer

## Inherits from Customer.
#  ClubMembers are allowed to rent items even if they currently have overdue items.
#  - They get a one-day grace period for late returns.
#  - For two or more days, they pay the same late fees as regular customers.
#
#
class ClubMember (Customer):
    ## Constructor from the customer name.
    #
    #
    def __init__(self, name):
        super(ClubMember, self).__init__(name)

    ## Updates the customer balance.
    #  Club members get a one-day grace period for late returns.
    #
    #  @param fee late fee.
    #  @param date due date.
    #  @param today return date.
    #
    def setBalance(self, fee, date, today):
        if (date < today) and (today - date) > 1:
            super(ClubMember, self).setBalance(fee, date, today)

    ## ClubMembers are allowed to rent items even if they currently have overdue items.
    #
    #  @param today date for checking rental allowance.
    #  @return true.
    #
    def canRent(self, today):
        return True
