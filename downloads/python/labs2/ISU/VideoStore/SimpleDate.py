#!/usr/bin/env python
# coding: UTF-8
#
## @package SimpleDate
#
#  Packages dates in the format yyyy-mm-dd.
#
#  @author Paulo Roma
#  @since 11/07/2017

import calendar
import sys
from datetime import datetime, timedelta

##
# Date consisting of a year, month, and day.
#
class SimpleDate(object):
    ## Number of milliseconds in one day.
    #
    MILLIS_IN_24_HOURS = 1000 * 60 * 60 * 24

    ## Return today's date.
    @staticmethod
    def today():
        now = datetime.now()
        return SimpleDate(now.year, now.month, now.day)

    ## Return today's date and time.
    @staticmethod
    def todayNow(delta=3):
        lstime = list(datetime.timetuple(
            datetime.utcnow() - timedelta(hours=delta)))
        return SimpleDate(*lstime[:6])

    ##
    # Constructs a SimpleDate with the given year, month, and day.
    #
    # @param year four-digit year
    # @param month 1-based month number
    # @param day 1-based day of month
    # @param hour 24-based hour time
    # @param min minutes of time
    # @param sec seconds of time
    # @see https://www.tutorialspoint.com/python/time_strptime.htm
    # @see https://docs.python.org/3/library/datetime.html
    #
    def __init__(self, year, month, day, hour=0, min=0, sec=0):
        date = "%s/%s/%s %s:%s:%s" % (str(day), str(month),
                                      str(year), str(hour), str(min), str(sec))
        ## Holds the date in this SimpleDate object.
        self.__date = datetime.strptime(date, '%d/%m/%Y %H:%M:%S')  # .date()

    ##
    # Returns a SimpleDate that is a given number of days
    # after this date.
    # @param additionalDays the number of days to be added to this date
    #
    def SimpleDateFromDays(self, additionalDays):
        date = datetime.strptime(str(self), '%Y-%m-%d').date()
        date += timedelta(days=additionalDays)
        l = str(date).split("-")
        return SimpleDate(l[0], l[1], l[2])

    ##
    # Determines whether this date is strictly earlier than the
    # given date.
    # @param other
    # @return true if this date is strictly before the given date.
    #   false otherwise
    #
    def isBefore(self, other):
        return self.daysUntil(other) > 0

    ##
    # Returns the number of days from this date until the given date.
    # Returns a negative number if this date after the given date.
    # @param other the future date
    # @return number of days until the given date (negative if it is in the past)
    #
    def daysUntil(self, other):
        dt = other.__date - self.__date
        return dt.days

    ## Operator ==.
    def __eq__(self, other):
        return self.__date == other.__date

    ## Operator <.
    def __lt__(self, other):
        return self.isBefore(other)

    ## Operator +. Adds ndays to this date.
    def __add__(self, ndays):
        return self.SimpleDateFromDays(ndays)

    ## Operator -. Number of days between this and other.
     # @return (other - self) in days.
    def __sub__(self, other):
        return other.daysUntil(self)

    ## Prints this simpleDate in the format hour:min:sec day-month-year.
    #
    def __repr__(self):
        tp = self.__date.timetuple()
        return "%02d:%02d:%02d %02d-%02d-%4d" % (tp.tm_hour, tp.tm_min, tp.tm_sec, tp.tm_mday, tp.tm_mon, tp.tm_year)

    ## Prints this simpleDate in the format year-month-day.
    #
    def __str__(self):
        tp = self.__date.timetuple()
        return "%4d-%02d-%02d" % (tp.tm_year, tp.tm_mon, tp.tm_mday)

## Main program for testing.
def main():
    date = SimpleDate(2017, 7, 12)
    date2 = date.SimpleDateFromDays(22)
    date2 = date + 22
    date3 = SimpleDate(2017, 7, 12)
    print(date == date3)
    print(date == date2)
    print(date < date2)
    print(date)
    print(repr(SimpleDate.todayNow(2)))
    print(repr(date2))
    print(SimpleDate(2019, 9, 19, 12, 23, 55).__repr__())
    print(date.daysUntil(date2))
    print(date2.daysUntil(date))
    print(date2 - date)
    print(date.isBefore(date2))


if __name__ == "__main__":
    sys.exit(main())
