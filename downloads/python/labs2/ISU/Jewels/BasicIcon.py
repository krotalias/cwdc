#!/usr/bin/env python
# coding: UTF-8
#
## @package BasicIcon
#
#   Basic implementation of the Icon interface.
#
#   @author Paulo Roma
#   @since 30/03/2020
#

from Icon import Icon

##
# Basic implementation of the Icon interface.
#
class BasicIcon (Icon):
    ##
    # Constructs an icon of the given type.
    # @param type
    #   type for this icon
    #
    def __init__(self, type):
        ## Type of this icon.
        self.__type = type

    ## Returns the type of this icon.
    # @return type of this icon.
    #
    def getType(self):
        return self.__type

    ## Return whether two icons have the same type.
    def __eq__(self, obj):
        if obj is None or self.__type is None or type(obj) != type(self):
            return False
        return self.__type == obj.__type

    ## Return a string representaion of this icon.
    def __repr__(self):
        return str(self.__type)
