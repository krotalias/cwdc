#!/usr/bin/env python
# coding: UTF-8
#
## @package Customer
#
#  A class describing a customer of the Video Store.
#
#  @author Paulo Roma
#  @since 11/07/2017

import sys
import datetime
from StatusException import StatusException
from DVD import DVD
from SimpleDate import SimpleDate

##
#  A Customer is a client of a VideoStore who can rent
#  items. A client is identified by a unique name.
#  At any given time a Customer has a list of
#  items currently rented, and a balance representing
#  rental charges, late fees, or credits (where a negative
#  balance indicates a credit).  Balances are in cents.
#  Ordinary customers are not allowed to rent new
#  items if they have any items overdue.
#
class Customer(object):

    ##
    #  Constructs a Customer with the given name.  Initially
    #  there are no items rented and the balance is zero.
    #  @param name
    #    the new customer's name
    #
    def __init__(self, name):
        ## Items currently rented by this customer.
        self.__itemsOut = []
        ## Name of this customer.
        self.__name = name
        ## Balance currently owed by this customer.
        self.__balance = 0

    ##
    #  Rents an item and adds it to this customer's list of items.
    #  If the item can be rented, this method updates the item's
    #  status (including the due date) and then adds it to this customer's list of items.
    #  If the item cannot be rented to this customer, a StatusException is thrown.
    #  @param item
    #    the item to be rented
    #  @param today
    #    the date on which the item is being rented
    #  @throw StatusException
    #    if the item cannot be rented to this customer for any reason
    #
    def rentItem(self, item, today):
        if not self.canRent(today):
            raise StatusException("Customer already has overdue items")
        item.setRented(today)
        self.__balance += item.getRentalCost()
        self.__itemsOut.append(item)

    ## Updates the balance of this customer.
    #
    #  @param fee late fee.
    #  @param date due date.
    #  @param today return date.
    #
    def setBalance(self, fee, date, today):
        self.__balance += fee

    ##
    #  Returns an item that this customer currently has rented and updates
    #  the balance if a late fee or credit is due.  If the item can be
    #  successfully returned, this method updates the item's status and removes
    #  it from this customer's list of items.  If the customer does not have
    #  the item rented, a StatusException is thrown.
    #  @param barcode
    #    identifier for the item to be returned
    #  @param today
    #    the date on which the item is being returned
    #  @throw StatusException
    #    if this customer does not have the given item rented
    #
    def bringBackItem(self, barcode, today):
        found = False
        for item in self.__itemsOut:
            if item.getBarcode() == barcode:
                found = True
                fee = item.calculateLateFee(today)
                # call child's setBalance().
                self.setBalance(fee, item.getDueDate(), today)
                item.setReturned()
                self.__itemsOut.remove(item)
                break
        if not found:
            raise StatusException("Item not found")

    ##
    #  Returns the balance for this customer.
    #  @return
    #    this customer's balance
    #
    def getBalance(self):
        return self.__balance * 0.01

    ##
    #  Returns the name of this customer.
    #  @return
    #    this customer's name
    #
    def getName(self):
        return self.__name

    ##
    #  Makes a payment on this customer's balance.
    #  @param amount
    #    the amount to be paid, in cents
    #
    def makePayment(self, amount):
        self.__balance -= amount

    ## Returns a string representation of this customer.
    #  The format is the customer type, name and balance.
    #
    def __str__(self):
        return ("%s: %s (%d items) --> %.2f" % (type(self).__name__, self.__name, len(self.__itemsOut), self.getBalance()))

    ##
    #  Returns a string representation of this customer.  The format
    #  consists of multiple lines.  The first line is the patron's name.
    #  Subsequent lines are formed from the __repr__() values of the
    #  items currently rented, separated by a newline.
    #  @return
    #    representation of this object as a multi-line string
    #
    def __repr__(self):
        sb = self.__name + ":\n"
        for item in self.__itemsOut:
            sb += repr(item)
            sb += "\n"
        return sb

    ##
    #  Helper method determines whether this customer
    #  already has overdue items.
    #  @param today
    #    the current date
    #  @return
    #    true if the customer has no overdue items,
    #    false otherwise
    #
    def canRent(self, today):
        for item in self.__itemsOut:
            if item.getDueDate().isBefore(today):
                return False
        return True

def main():
    item = DVD("Matrix", "Science Fiction", 3)
    customer = Customer("John Doe")
    print(customer)
    if customer.canRent(datetime.datetime.now()):
        try:
            customer.rentItem(item, SimpleDate.today())
        except StatusException as e:
            print(e)
            print(
                "AbstractItem: Sorry, rentItem method not implemented. Please, use a concrete class..")


if __name__ == "__main__":
    sys.exit(main())
