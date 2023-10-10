#!/usr/bin/env python
# coding: UTF-8
# vim: tabstop=4:softtabstop=4:shiftwidth=4
#
## \mainpage VideoStore - A video store that rents games and DVDs.
#
# The purpose of this assignment is to give you some experience working with inheritance.
# In this homework, you will implement code for a simple video store.
# <br>
# A video store consists of a list of items (various kinds of games and DVDs) and a list of customers (people who can rent items):
# - Different kinds of items may have different policies for how long they may be rented, the cost of rental, and how late fees are calculated.
# - Different kinds of customers may have different behavior, when it comes to late fees or other aspects of renting and returning items.
#
# Please note that all cost amounts in the code are expressed in cents, e.g., where the spec says $1.50, your code would use the integer value 150.
#
# @section notes release.notes
# This program runs either in python 2.7 or python 3.6
#
# To run the program:
# - python VideoStore.py
#
## @package VideoStore
#
#  A video store that rents DVDs, and Games.
#
#  @author Paulo Roma
#  @since 11/07/2017

import sys

##
#
#  VideoStore consists of a list of items and a list of customers
#  who can rent items.
#
class VideoStore(object):
    ##
    #  Constructs a VideoStore that initially has no items and no customers.
    #
    def __init__(self):
        ## The items in this store.
        self.__items = []
        ## The list of customers of this store.
        self.__customers = []

    ##
    #  Adds an item to this store's list of items, provided
    #  that there is not already an item with the same barcode.
    #  @param item
    #    the item to be added
    #  @return item
    #
    def addItem(self, item):
        if item not in self.__items:
            self.__items.append(item)
            return item
        return None

    ##
    #  Adds a customer to this store's list of customers.
    #  @param customer the customer to be added
    #  @return customer
    #
    def addCustomer(self, customer):
        if customer not in self.__customers:
            self.__customers.append(customer)
            return customer
        return None

    ##
    #  Returns the customer with the given name
    #  @param name
    #    the name of the customer to search for
    #  @return
    #    the customer
    #
    def findUser(self, name):
        for p in self.__customers:
            if name == p.getName():
                return p
        return None

    ##
    #  Search the store's collection for items satisfying the
    #  given SearchCondition.
    #  @param condition
    #    the SearchCondition
    #  @return
    #    list of items satisfying the condition
    #
    def search(self, condition):
        results = []
        for item in self.__items:
            if condition.matches(item):
                results.append(item)
        return results

    ##
    #  Returns the set of users and items in this store.
    #
    #  @return a string with all users and items.
    #
    def __str__(self):
        st = ""
        for item in self.__items:
            st += "%s: Genre = %s\n" % (item, item.getGenre())

        st += "\n"

        for cust in self.__customers:
            st += str(cust) + "\n"

        return st

    ##
    #  Returns the set of users and items in this store.
    #
    #  @return a string with all users and items.
    #
    def __repr__(self):
        st = ""
        for item in self.__items:
            st += "%r: Genre = %s\n" % (item, item.getGenre())

        st += "\n"

        for cust in self.__customers:
            st += repr(cust) + "\n"

        return st

## Main program for testing.
def main():
    from Customer import Customer
    from DVD import DVD
    from SimpleDate import SimpleDate

    store = VideoStore()
    today = SimpleDate.todayNow()
    today2 = today + 2
    print("Today is %r" % today)

    c1 = Customer("João")
    store.addCustomer(c1)
    c1.rentItem(store.addItem(DVD("Matrix", "Science Fiction", 3)), today)
    c1.rentItem(store.addItem(DVD("Ladyhawke", "Fantasy", 2)), today)
    print(store)


if __name__ == "__main__":
    sys.exit(main())
