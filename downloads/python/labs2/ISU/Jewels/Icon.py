#!/usr/bin/env python
# coding: UTF-8
#
## @package Icon
#
#  Icon Interface.
#  Interface representing an icon or block in a Bejeweled-like matching game.
#  At a minimum, each icon encapsulates an integer, referred to as its "type".
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
# Interface representing an icon or block in a
# Bejeweled-like matching game. At a minimum, each
# icon encapsulates an integer, referred to as its "type".
#
class Icon(ABC):
    ##
    # Returns the type of this icon.
    # @return
    #   type of this icon
    #
    @abstractmethod
    def getType(self): pass
