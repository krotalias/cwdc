#!/usr/bin/env python
# coding: UTF-8
#
## package IWorld
#
#  World Interface.

try:                 # python >= 3.4
    from abc import ABC, ABCMeta, abstractmethod
except ImportError:  # python 2
    from abc import ABCMeta, abstractmethod
    ABC = object

##
# Interface IWorld allows initializing and setting diseases for a world.
#
# @author Paulo Cavalcanti
# @date 22/02/2020
#
class IWorld(ABC):
    __metaclass__ = ABCMeta

    @abstractmethod
    def prepare(self): pass
    @abstractmethod
    def setTemp(self, quad, temp): pass
    @abstractmethod
    def getTemp(self, quad): pass
    @abstractmethod
    def getObjects(self): pass
    @abstractmethod
    def getSumStrength(self): pass
    @abstractmethod
    def initDiseases(self, numDisStr): pass
    @abstractmethod
    def initLocations(self, locationsStr, diseaseArr): pass
    @abstractmethod
    def initGrowthConditions(self, growthStr, diseaseArr): pass
    @abstractmethod
    def initTemps(tempStr): pass
