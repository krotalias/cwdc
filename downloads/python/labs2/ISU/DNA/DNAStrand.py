#!/usr/bin/env python
# coding: UTF-8
#
## @package DNAStrand
#
#   Playing with string matching.
#
#   @author Paulo Roma
#   @since 15/12/2019
#   @see https://www.sciencedirect.com/topics/medicine-and-dentistry/dna-strand
#
import sys

class DNAStrand:

    ## Valid DNA symbols.
    symbols = 'ATCG'

    ##
    # Constructs a DNAStrand with the given string of data,
    # normally consisting of characters 'A', 'C', 'G', and 'T'.
    # Raises a ValueError exception, in case of an invalid givenData strand.
    #
    # @param givenData string of characters for this DNAStrand.
    #
    def __init__(self, givenData):
        ## Strand of this DNA, in upper case.
        self.strand = givenData.upper()
        if not self.isValid():
            raise ValueError("Invalid strand")

    ## Returns a string representing the strand data of this DNAStrand.
    def __str__(self):
        return self.strand

    ##
    # Returns a new DNAStrand that is the complement of this one,
    # that is, 'A' is replaced with 'T' and so on.
    #
    # @return complement of this DNA.
    #
    def createComplement(self):
        complement = ""
        for i in self.strand:
            if i == 'A':
                complement += 'T'
            elif i == 'T':
                complement += 'A'
            elif i == 'C':
                complement += 'G'
            elif i == 'G':
                complement += 'C'

        return DNAStrand(complement)

    ##
    # Returns a string showing which characters in this strand are matched with 'other',
    # when shifted left by the given amount.
    #
    # @param other given DNAStrand.
    # @param shift number of positions to shift other to the left.
    # @return a copy of this strand, where matched characters are upper case and unmatched, lower case.
    #
    def findMatchesWithLeftShift(self, other, shift):
        shifted = (len(other.strand) - shift)
        if (shift < 0 or shifted <= 0):
            return self.strand.lower()
        shortest = min(len(self.strand), shifted)
        matches = ""

        for i in range(shortest):
            c = self.strand[i]
            matches += c if self.matches(c, other.strand[shift + i]) \
                else c.lower()

        temp = self.strand.lower()
        matches += temp[shortest:]
        assert(len(matches) == len(self.strand))

        return matches

    ##
    # Returns a string showing which characters in this strand are matched with 'other',
    # when shifted right by the given amount.
    #
    # @param other given DNAStrand.
    # @param shift number of positions to shift other to the right.
    # @return a copy of this strand, where matched characters are upper case and unmatched, lower case.
    #
    def findMatchesWithRightShift(self, other, shift):
        local = (len(self.strand) - shift)
        if (shift < 0 or local <= 0):
            return self.strand.lower()
        shortest = min(local, len(other.strand))
        matches = ""

        for i in range(shortest):
            c = self.strand[shift + i]
            matches += c if self.matches(c, other.strand[i]) else c.lower()

        # AGAGCAT
        #  TCAT                                 7 - 5 = 2
        # 1 + 4 + 2 = shift + matches + (len(self.strand)-shif-matches))
        temp = self.strand.lower()
        matches = temp[:shift] + matches
        matches += temp[len(matches):len(self.strand)]
        assert(len(matches) == len(self.strand))

        return matches

    ##
    # Returns the maximum possible number of matching base pairs,
    # when the given sequence is shifted left or right by any amount.
    #
    # @param other given DNAStrand to be matched with this one.
    # @return maximum number of matching pairs and its position.
    #
    def findMaxPossibleMatches(self, other):
        COUNT = 0
        pos = 0
        for i in range(len(self.strand)):
            count = self.countMatchesWithRightShift(other, i)
            if (count > COUNT):
                COUNT = count
                pos = i

        for j in range(len(other.strand)):
            count = self.countMatchesWithLeftShift(other, j)
            if (count > COUNT):
                COUNT = count
                pos = -j

        return COUNT, pos

    ##
    # Returns the number of matching pairs,
    # when 'other' is shifted to the left by 'shift' positions.
    #
    # @param other given DNAStrand to match with this strand.
    # @param shift number of positions to shift other to the left.
    # @return number of matching pairs.
    #
    def countMatchesWithLeftShift(self, other, shift):
        count = 0
        matches = self.findMatchesWithLeftShift(other, shift)

        for i in matches:
            if i in DNAStrand.symbols:
                count += 1

        return count

    ##
    # Returns the number of matching pairs,
    # when 'other' is shifted to the right by 'shift' positions.
    #
    # @param other given DNAStrand to be matched with this one.
    # @param shift number of positions to shift other to the right.
    # @return number of matching pairs.
    #
    def countMatchesWithRightShift(self, other, shift):
        count = 0
        matches = self.findMatchesWithRightShift(other, shift)

        for i in matches:
            if i in DNAStrand.symbols:
                count += 1

        return count

    ##
    # Determines whether all characters in this strand are valid ('A', 'G', 'C', or 'T').
    #
    # @return True if valid, and False otherwise.
    #
    def isValid(self):
        valid = True
        for i in self.strand:
            if i not in DNAStrand.symbols:
                valid = False
                break

        return valid

    ##
    # Counts the number of occurrences of the given character in this strand.
    #
    # @param ch given character.
    # @return number of occurrences of ch.
    #
    def letterCount(self, ch):
        count = 0
        for i in self.strand:
            if i == ch:
                count += 1

        return count

    ##
    # Returns True if the two characters form a base pair ('A' with 'T' or 'C' with 'G').
    #
    # @param c1 first character.
    # @param c2 second character.
    # @return True if they form a base pair, and False otherwise.
    #
    def matches(self, c1, c2):
        match = False

        if (c1 == 'T' and c2 == 'A'):
            match = True
        elif (c1 == 'A' and c2 == 'T'):
            match = True
        elif (c1 == 'C' and c2 == 'G'):
            match = True
        elif (c1 == 'G' and c2 == 'C'):
            match = True

        return match

## Main program for testing.
#
# @param args two DNA strands.
#
def main(args=None):

    if args is None:
        args = sys.argv

    if len(args) == 5:
        d = DNAStrand(args[1])
        d2 = DNAStrand(args[2])
        ls = int(args[3])
        rs = int(args[4])
    else:
        d = DNAStrand("AGAGCAT")
        d2 = DNAStrand("TCAT")
        ls = 2
        rs = 3

    print("Complement: %s" % d.createComplement())
    print("Count A in %s: %d" % (d, d.letterCount('A')))
    print("%s isValid: %r" % (d, d.isValid()))
    print("Strand: %s" % d2)
    print("RightShift: %s, %d = %s" %
          (d, rs, d2.findMatchesWithRightShift(d, rs)))
    print("Left Shift: %s, %d = %s" %
          (d, ls, d2.findMatchesWithLeftShift(d, ls)))
    print("Maximum Matches: %d at position %d" % d.findMaxPossibleMatches(d2))
    print("Number of matches left shift: %s, %d = %s" %
          (d2, ls + rs, d.countMatchesWithLeftShift(d2, ls + rs)))


if __name__ == "__main__":
    sys.exit(main())
