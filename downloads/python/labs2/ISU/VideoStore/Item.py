#!/usr/bin/env python
# coding: UTF-8
#
## @package Item
#
#  A class modeling an item of the Video Store.
#
#  @author Paulo Roma
#  @since 11/07/2017

try:                 # python >= 3.4
    from abc import ABC, ABCMeta, abstractmethod
except ImportError:  # python 2
    from abc import ABCMeta, abstractmethod
    ABC = object

## This is an abstract class. All methods here must be implemented elsewhere.
#
#  An item represents a movie or game that can be rented
#  from a video store. Each item has a title, a genre,
#  and a unique integer identifier called a barcode.
#  An item can be rented or available, and if rented
#  it has a due date.
#
class Item(ABC):
    __metaclass__ = ABCMeta

    ##
    #  Rents this item if it is not already rented and sets the
    #  due date.
    #  @param today
    #    the date on which this item is being rented
    #  @throw StatusException
    #    if the item cannot be rented
    #
    @abstractmethod
    def setRented(self, today):
        pass

    ##
    #  Returns this item, if it is currently rented.
    #  @param today
    #    the date on which the item is being returned
    #  @throw StatusException
    #    if the item is not currently rented
    #
    @abstractmethod
    def setReturned(self, today):
        pass

    ## Sets this item due date.
    # If a date is given, the item is set as rented.
    #
    # @param date due date.
    #
    @abstractmethod
    def setDueDate(self, date=None):
        pass

    ##
    #  Returns the cost to rent this item.
    #  @return
    #    cost to rent the item
    #
    @abstractmethod
    def getRentalCost(self):
        pass

    ## Returns the number of days allowed to keep this item.
    #
    #  @return number of allowed rental days.
    #
    @abstractmethod
    def getRentalDays(self):
        pass

    ##
    #  Calculates the late fee (or bonus) that would be charged (or
    #  applied) for returning the item on the given date.
    #  @param today
    #    the date on which the item is being returned
    #  @return
    #    the late fee or bonus for returning the item on the given date,
    #    or zero if the item is not currently rented
    #
    @abstractmethod
    def calculateLateFee(self, today):
        pass

    ##
    #  Returns a String representing the genre of this item
    #  @return
    #    genre of this item
    #
    @abstractmethod
    def getGenre(self):
        pass

    ##
    #  Determines whether this item is currently rented.
    #  @return
    #    true if this item is rented, false otherwise
    #
    @abstractmethod
    def isRented(self):
        pass

    ##
    #  Returns the due date for this item if it is currently rented,
    #  or null if the item is not rented.
    #  @return
    #    due date for this item
    #
    @abstractmethod
    def getDueDate(self):
        pass

    ##
    #  Returns the title of this item.
    #  @return
    #    title of this item
    #
    @abstractmethod
    def getTitle(self):
        pass

    ##
    #  Returns the integer barcode for this item.
    #  @return
    #    barcode of this item
    #
    @abstractmethod
    def getBarcode(self):
        pass
