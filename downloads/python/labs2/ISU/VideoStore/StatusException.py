#!/usr/bin/env python
# coding: UTF-8
#
## @package StatusException
#
#  Exceptions to be thrown when an error has occurred.
#
#  @author Paulo Roma
#  @since 11/07/2017

##
# Exception type thrown for invalid operations such
# as attempting to rent an item that is already
# rented.
#
class StatusException (Exception):
    ##
    #  Constructs a StatusException with the given message.
    #  @param msg
    #    message for this exception
    #
    def __init__(self, msg):
        super(StatusException, self).__init__(msg)
        if msg:
            ## @var msg
            #  hold the error message.
            self.msg = "Usage: " + msg
        else:
            self.msg = "Usage: Invalid or NULL arguments"
