#!/usr/bin/env python
# coding: UTF-8
#
## @package MileageCalculator
#
#   Class for reading a series of odometer and gallons/litres data
#   from filling up the gas tank of a vehicle, and calculating
#   the consumption between each gas station stop.
#
# @author Paulo Roma
# @date 24/08/2014
#

import sys

##  Data container for recording the odometer reading
#   and gallons/litres from filling up the gas tank of a vehicle.
#
class FillUp:
    ##
    # Return a string with the odometer reading and volume of gas.
    #
    def __str__(self):
        st = ""

        st += "Odometer = {:.2f}\nGas = {:.2f}".format(
            self.odometer, self.gallons)

        return st

    ##
    # Return a string with the odometer reading and volume of gas.
    #
    def __repr__(self):
        st = ""

        st += "Odometer = %.2f and Gas = %.2f" % (self.odometer, self.gallons)

        return st

    ##
    # Constructs a new FillUp object with the given data.
    # @param givenOdometer
    #   odometer reading
    # @param givenGallons
    #   number of gallons
    #
    def __init__(self, givenOdometer, givenGallons):
        ## Odometer reading when the tank was filled.
        self.odometer = givenOdometer

        ## Gallons needed to fill the tank.
        self.gallons = givenGallons

    ##
    # Returns the odometer reading.
    # @return
    #   the odometer reading
    #
    def getOdometer(self):
        return self.odometer

    ##
    # Returns the number of gallons.
    # @return
    #   number of gallons
    #
    def getGallons(self):
        return self.gallons

## Class for controlling the gasoline consumption of a car.
#
class MileageCalculator:

    ## debugging state.
    debug = False

    ## Miles per gallon to kilometers per litre.
    mpg2kpl = 1.609344 / 3.7854118

    ## Kilometers per litre to miles per gallon.
    kpl2mpg = 1.0 / mpg2kpl

    ##
    #   Constructor.
    #   Opens filename and calls Reader for inputting the distance readings.
    #   Raises an exception if filename does not exist.
    #
    #   @param filename distance file name.
    #
    def __init__(self, filename):
        ## FillUp list, which aggregates an int and a double.
        self.fillup = []

        ## Whether using the metric system.
        self.metricSystem = False

        try:
            f = open(filename, 'r')
        except IOError:
            print('MileageCalculator: Cannot open file %s for reading' % filename)
            raise
        self.Reader(f)

    ##
    #   Reads a file with a distance (int or float) and gasoline volume (double) per line.
    #   Creates a FillUp object for each line and inserts it in the fillup list.
    #   If any line contains just a single character "K", that means volumes are mesaured
    #   in litres and distances in kilometers. Otherwise, it is assumed gallons and miles.
    #
    #   @param f distance file object.
    #
    def Reader(self, f):
        for line in f:
            tempwords = line.split(None)

            if len(tempwords) == 2:
                try:
                    self.fillup.append(
                        FillUp(float(tempwords[0]), float(tempwords[1])))
                except:
                    print('Invalid reading: %s\n' % tempwords)
            elif len(tempwords) == 1:
                self.metricSystem = tempwords[0].upper() == "K"

        f.close()

    ##
    #   Calculates the consumption of the k-th entry of fillup list.
    #
    #   @param k fillup index.
    #   @return (odometer[k]-odometer[k-1])/gallons[k].
    #
    def consumption(self, k):
        if k < 1 or k >= len(self.fillup):
            return None

        previous = self.fillup[k - 1].getOdometer()
        current = self.fillup[k].getOdometer()
        gallons = self.fillup[k].getGallons()

        if MileageCalculator.debug:
            print("current %f\nprevious %f\ngallons %f\n" %
                  (current, previous, gallons))

        return (current - previous) / gallons

    ##
    #   Returns the consumption (in mi/gal) corresponding to each entry of "fillup",
    #   by calling the method "consumption".
    #
    #   @return a string: a series of consumptions.
    #
    def __repr__(self):
        sb = "Kilometers per litre\n" if self.metricSystem else "Miles per gallon\n"
        for i in range(1, len(self.fillup)):
            sb += "Consumption %d: %.3f\n" % (i, self.consumption(i))

        return sb

    ##
    #   Returns the consumption (in km/lt) corresponding to each entry of "fillup",
    #   by calling the method "consumption".
    #
    #   1 gallon = 3.7854118 litres
    #
    #   1 mile   = 1.609344  kilometers
    #
    #   @return a string: a series of consumptions.
    #
    def __str__(self):
        if self.metricSystem:
            sb = "Miles per Gallon\n"
            factor = MileageCalculator.kpl2mpg
        else:
            sb = "Kilometers per litre\n"
            factor = MileageCalculator.mpg2kpl
        for i in range(1, len(self.fillup)):
            sb += "Consumption %d: %.3f\n" % (i, self.consumption(i) * factor)

        return sb


##
#   Main method. Reads a series of pairs of distance and volume of gasoline and prints
#   the average consumption: (current-previous)/gallons.
#
def main(argv=None):
    f = "mileage.txt"
    d = False
    if argv is None:
        argv = sys.argv

    if (len(argv) > 2):
        f = argv[1]
        d = argv[2] == 'True'

    try:
        m = MileageCalculator(f)
        MileageCalculator.debug = d
        print("Using: {}\n".format(f))
        print(m)
        print(repr(m))
        if MileageCalculator.debug:
            print("fillup (str):\n" + '\n'.join(map(str, m.fillup)))
            print("fillup with format:\n{}".format(m.fillup))  # using format
            # using python 3 f-string
            print(f"fillup with f-string is:\n{m.fillup}")
    except IOError:
        sys.exit("File %s not found." % f)


if __name__ == "__main__":
    sys.exit(main())
