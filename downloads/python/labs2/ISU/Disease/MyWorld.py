#!/usr/bin/env python
# coding: UTF-8
#
## @packge MyWorld
#
import sys
from World import World
from IWorld import IWorld
from Disease import Disease

##
# This class has its default constructor, inherited methods from the World class, and the
# methods specified in the IWorld interface.
#
# @author Paulo Cavalcanti
# @date 22/02/2020
# @see https://br.godaddy.com/engineering/2018/12/20/python-metaclasses/
#
class MyWorld (World, IWorld):

    ##
    # Constructor.
    # Calls the constructor of the World class with the width and height of
    # 720 and 640 cells, respectively.
    # Initialize an array to keep the average temperature of each world
    # region (quadrant). Call the prepare() method.
    #
    def __init__(self):
        super(MyWorld, self).__init__(720, 640)
        ### Array holding the temperatures of the four quadrants.
        self.__temperature = [0, 0, 0, 0]
        ### Iteration counter.
        self.__itCounter = 0

        self.prepare()

    ## Sets the temperature of the given quadrant.
    def setTemp(self, quad, temp):
        if (quad >= 0 and quad <= 3):
            self.__temperature[quad] = temp

    ## Gets the temperature of the given quadrant.
    def getTemp(self, quad):
        return self.__temperature[quad]

    ##
    # Return the total disease strength of all the diseases
    # in this world.
    #
    # @see http://docs.python.org/reference/expressions.html#generator-expressions
    #
    def getSumStrength(self):
        return sum(o.getStrength() for o in self.getObjects())

    ##
    # Create Disease objects. The number of the objects equals to the value passed
    # in numDisStr. An example of a valid numDisStr is: "2".
    #
    # If numDisStr is null or it cannot be converted to a positive integer,
    # print a message on screen:
    # "Check the NumDiseases line in simulation.config." and return null.
    #
    # @return an array of object references to the created Disease objects.
    #
    def initDiseases(self, numDisStr):
        nd = 0
        err = False
        if (numDisStr is None):
            err = True
        else:
            try:
                nd = int(numDisStr)
            except ValueError as e:
                err = True

        diseaseArr = None
        if (err):
            print("Check the NumDiseases line in simulation.config.")
        else:
            diseaseArr = [Disease() for i in range(nd)]

        return diseaseArr

    ##
    # Add each Disease object into this MyWorld object,
    # according to the information in locationStr.
    # An example of a locationStr is "200,200400,480". This means that the first
    # Disease is planted at cell (200,200) and the second Disease is at cell (400, 480).
    # If the locationStr is empty or not in the correct format or does not have all the
    # cell coordinates of all the Disease objects, print on screen
    # "Check the Locations line in simulation.config" and return -1.
    #
    # @return 0 for a successful initialization of the Disease locations.
    #
    def initLocations(self, locationsStr, diseaseArr):
        err = False
        if (locationsStr is None):
            err = True
        else:
            parts = locationsStr.split(";")
            if len(parts) != len(diseaseArr):
                err = True
            else:
                for i, p in enumerate(parts):
                    parts2 = p.split(",")
                    if (len(parts2) != 2):
                        err = True
                        break

                    try:
                        x = int(parts2[0])
                        y = int(parts2[1])
                        self.addObject(diseaseArr[i], x, y)
                        diseaseArr[i].setLocation(x, y)
                    except ValueError as e:
                        err = True

        if (err):
            print("Check the Locations line in simulation.config.")
            return -1

        return 0

    ##
    # Set the lower bound and upper bound temperature and the growth rate for
    # each disease according to the input growthStr. An example of a valid string
    # for 2 Disease objects is: "10.0,15.0,2.010.0,13.0,3.0"
    # If growthStr is empty or not in the correct format or does not have all the
    # growth for all the Disease objects in the Disease array, print on screen
    # "Check the DiseasesGrowth line in simulation.config." and return -1.
    #
    # @return return 0 for a successful initialization of the Disease growth conditions.
    #
    def initGrowthConditions(self, growthStr, diseaseArr):
        err = False
        if (growthStr == None):
            err = True
        else:
            parts = growthStr.split(";")
            if len(parts) != len(diseaseArr):
                err = True
            else:
                for i, p in enumerate(parts):
                    parts2 = p.split(",")
                    if len(parts2) != 3:
                        err = True
                        break

                    try:
                        diseaseArr[i].setGrowthCondition(float(parts2[0]),
                                                         float(parts2[1]),
                                                         float(parts2[2]))
                    except ValueError as e:
                        err = True

        if err:
            print("Check the DiseasesGrowth line in simulation.config.")
            return -1

        return 0

    ##
    # Sets the temperature for each quadrant of the MyWord according to the value
    # of the tempStr. An example of tempStr is below. The region temperatures for
    # regions 0, 1, 2, and 3 are 12, 20, 50, and 100, respectively.
    # Ex: "122050100"
    #
    def initTemps(self, tempStr):
        err = False
        parts = tempStr.split(";")
        if len(parts) != 4:
            err = True
        else:
            try:
                list(map(lambda i: self.setTemp(i, int(parts[i])), range(4)))
            except ValueError as e:
                err = True

        if (err):
            print("Check the Temperature line in simulation.config.")
            return -1

        return 0

    ##
    # Prepare the world. Open a text file named "simulation.config" in the current
    # path (directly under the project directory). Parse the configuration file for the
    # number of Disease objects, the cell locations of these objects, the growth
    # rates, and the temperature ranges associated with individual growth rates.
    #
    # @throws IOError
    #
    def prepare(self):
        try:
            inputFile = open("./simulation.config")
        except IOError as e:
            print("File \"simulation.config\" not found.")
            raise IOError

        d = None
        err = False
        lines = inputFile.readlines()
        while True:  # simulates a goto statement
            line = lines[0]
            sArr = line.split("=")  # split the string at "="
            ## check whether the string on the left hand side is NumDiseases
            if (sArr[0] != "NumDiseases"):
                err = True
                break

            d = self.initDiseases(sArr[1])
            if (d is None):
                err = True
                break

            line = lines[1]
            sArr = line.split("=")
            if (sArr[0] != "Locations"):
                err = True
                break

            ## everything is fine, then add the diseases to the world
            if (self.initLocations(sArr[1], d) < 0):
                err = True
                break

            line = lines[2]
            sArr = line.split("=")
            if (sArr[0] != "DiseasesGrowth"):
                err = True
                break

            if (self.initGrowthConditions(sArr[1], d) < 0):
                err = True
                break

            line = lines[3]
            sArr = line.split("=")
            if (sArr[0] != "Temperature"):
                err = True
                break

            if (self.initTemps(sArr[1]) < 0):
                err = True
                break

            break  # success!!

        inputFile.close()
        if (err):
            print("Terminating the program.")
            sys.exit(-1)

    ##
    # This method overrides the act() method in the World class.
    # This method prints
    # "Iteration <ITRID>: World disease strength is <WorldDisease>",
    # where @f$<ITRID>@f$ is replaced by the current iteration number and
    # @f$<WorldDisease>@f$ is replaced by the returned value of getSumStrength()
    # in 2 decimal places. An example is below:
    # <PRE>
    # Iteration 0: World disease strength is 2.00
    # Iteration 1: World disease strength is 3.00
    # </PRE>
    #
    def act(self):
        print("Iteration %d: World disease strength is %.2f" %
              (self.__itCounter, self.getSumStrength()))
        self.__itCounter += 1

def main():
    world = MyWorld()
    nd = world.numberOfObjects()
    print("Number of diseases = %d" % nd)
    print("World size: (%d,%d,%d)" %
          (world.getWidth(), world.getHeight(), world.getDepth()))
    for i in range(4):
        print("Quadrant %d temperature: %.2f" % (i, world.getTemp(i)))
    objs = world.getObjects()
    for i, d in enumerate(objs):
        print("Disease %d in position (%d,%d)" % (i, d.getX(), d.getY()))
        print("  Disease %d in quadrant %d with strength %.2f" %
              (i, d.getQuadrant(), d.getStrength()))
        g, l, h = d.getGrowthCondition()
        print("  Disease %d growth = %.2f, lower = %.2f and higher = %.2f" %
              (i, g, l, h))

    # print("%r" % world)


if __name__ == "__main__":
    sys.exit(main())
