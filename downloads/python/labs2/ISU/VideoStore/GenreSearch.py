#!/usr/bin/env python
# coding: UTF-8
#
## @package GenreSearch
#
#  Class for searching items matching a given genre.
#
#  @author Paulo Roma
#  @since 11/07/2017

from SearchCondition import SearchCondition

##
#  Implementation of SearchCondition that matches items
#  based on the genre (not case sensitive).
#
class GenreSearch (SearchCondition):
    ##
    #  Constructs a GenreSearch for the given value.
    #  @param genre
    #    the genre to search for
    #
    def __init__(self, genre):
        ## The genre we are searching for.
        self.__genre = genre

    ##
    #  Matches this genre with the genre of a given item.
    #
    #  @param item containing the genre to compare to.
    #
    def matches(self, item):
        return self.__genre == item.getGenre()
