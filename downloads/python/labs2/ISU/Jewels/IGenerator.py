#!/usr/bin/env python
# coding: UTF-8
#
## @package IGenerator
#
#  IGenerator Interface.
#  Interface representing a utility for generating new icons in a Bejeweled-like video game.
#
#  @author Paulo Roma
#  @since 05/04/2020
#
try:                 # python >= 3.4
    from abc import ABC, ABCMeta, abstractmethod
except ImportError:  # python 2
    from abc import ABCMeta, abstractmethod
    ABC = object


##
# Interface representing a utility for generating new icons
# in a Bejeweled-like video game.
#
class IGenerator(ABC):
    ##
    # Returns a new Icon.
    # @return
    #   a new Icon
    #
    @abstractmethod
    def generate(self): pass

    ##
    # Initializes a given 2D array of Icons with new values.
    # Any existing values in the array are overwritten.
    # @param grid
    #   the 2D array to be initialized
    #
    @abstractmethod
    def initialize(self, grid): pass
