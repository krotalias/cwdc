#!/usr/bin/env python
# coding: UTF-8
#
## @package OverDueItemSearch
#
#  A class for looking for overdue items in the Video Store.
#
#  @author Paulo Roma
#  @since 26/11/2018

from SearchCondition import SearchCondition

## A class for matching items with due date before a given date.
#
#
class OverDueItemSearch (SearchCondition):
    ## Constructor.
    #
    #  @param date given date.
    #
    def __init__(self, date):
        ## date for the search.
        self.__date = date

    ## Return True if the item's due date is before a given date.
    #
    #  @return match with due dates smaller then date.
    #
    def matches(self, item):
        return item.getDueDate() is not None and item.getDueDate() < self.__date
