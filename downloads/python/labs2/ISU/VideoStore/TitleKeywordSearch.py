#!/usr/bin/env python
# coding: UTF-8
#
## @package TitleKeywordSearch
#
#  A class for looking for titles matching a given substring in the Video Store.
#
#  @author Paulo Roma
#  @since 26/11/2018

import sys
from SearchCondition import SearchCondition
from DVD import DVD

## A class for matching keywords against titles.
#
#
class TitleKeywordSearch (SearchCondition):
   ##  Constructor.
   #
   #  @param keyword word to search for.
   #  @param allowSubstrings match for substrings.
   #
    def __init__(self, keyword, allowSubstrings):
        ## whether substrings (partial match) is sufficient.
        self.__allowSubstrings = allowSubstrings
        ## word to search for.
        self.__keyword = keyword.upper()

   ##  Return True if the item's title contains the given keyword.
   #  If the allowSubstrings parameter is False, then the title is considered a match
   #  only if the keyword matches a complete word (whitespace-separated string) in the title.
   #
   #  Otherwise, matches returns True if the keyword appears anywhere in the title, even as a substring.
   #
   #  @return match with keyword.
   #
    def matches(self, item):
        if self.__allowSubstrings:
            return self.__keyword in item.getTitle().upper()
        else:
            parts = item.getTitle().split()
            for s in parts:
                if self.__keyword == s.upper():
                    return True

        return False


## For testing.
def main():
    item1 = DVD("A MovieName", "Action", 1)
    item2 = DVD("Another Movie Name", "Action", 2)
    tks1 = TitleKeywordSearch("Movie", True)
    tks2 = TitleKeywordSearch("Movie", False)
    print(tks1.matches(item1))
    print(tks2.matches(item2))


if __name__ == "__main__":
    sys.exit(main())
