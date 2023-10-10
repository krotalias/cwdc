#!/usr/bin/env python
# coding: UTF-8
#
## @package Ranking
#
#  Manipulates ranking objects.
#
#  @author Paulo Roma Cavalcanti
#  @date 11/08/2018
#

import sys
from random import randint, choice, shuffle

def cmp(x, y):
    """
    Replacement for built-in function cmp that was removed in Python 3

    Compare the two objects x and y and return an integer according to
    the outcome. The return value is negative if x < y, zero if x == y
    and strictly positive if x > y.
    """

    return (x > y) - (x < y)

def shuffle(lst):
    """Shuffle a list: time complexity is O(n)."""

    a = lst[:]

    # To shuffle an array a of n elements (indices 0..n-1)
    for i in range(len(a) - 1, 0, -1):
        # random integer such that 0 ≤ j ≤ i
        j = randint(0, i)

        # exchange a[i] and a[j]
        a[i], a[j] = a[j], a[i]

    return a

## Class (like a C struct) for sorting one rank in ascending order,
# to be used in the kemeny distance.
#
class rankDataKemeny (object):
    ## Constructor.
    #
    #  @param r1 first metric.
    #  @param r2 second metric.
    #
    def __init__(self, r1, r2):
        ## first metric.
        self.r1 = r1
        ## second metric.
        self.r2 = r2

    ## Returns a string represention of a rankDataKemeny object.
    def __repr__(self):
        st = ""
        st += str(self.r1)
        st += ", "
        st += str(self.r2)
        st += "\n"
        return st

    ## In Python 2, \_\_cmp\_\_(self, other) implemented comparison between two objects,
    #  returning a negative value if self < other, positive if self > other, and zero if they were equal.
    #
    #  @return 1 if the first rank of this object is greater than o's,
    #         -1 if the first rank of this object is smaller than o's or
    #          0 if it is equal.
    #
    def __cmp__(self, o):
        return cmp(self.r1, o.r1)

## Class for creating and comparing different rankings.
#  Currently, it is implemented the footrule and kemeny distances.
#
class Ranking (object):
    ##
    #  Python does not allow multiple constructors. However,
    #  they can be simulated by its argument type.
    def __init__(self, arg):
        ## Ranking object.
        self.ranking = []
        if type(arg) == list:
            self.initializeFromList(arg)
        elif type(arg) == tuple:
            self.initializeFromTuple(arg)
        elif type(arg) == int:
            self.initializeFromInt(arg)

    ##
    # Constructs a random ranking of the numbers 1 through n. Raises a
    # ValueError if n < 1. Must run in O(n log n) time <br>
    # <br>
    # <strong>Note:</strong> For random number generation, use the Random module.
    # To generate a random permutation of 1 through n, use the shuffle algorithm.
    #
    # @see <a href="https://docs.python.org/3/library/random.html">Generate pseudo-random numbers</a>
    # @see <a href="http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm">"shuffle" algorithm</a>
    #
    # @param n
    #            Number of random rankings to create
    # @throws ValueError
    #             if n < 1
    #
    def initializeFromInt(self, n):
        if (n < 1):
            raise ValueError("Number is smaller than 1")

        # create a random ranking [1,...,n]
        self.ranking = shuffle(list(range(1, n + 1)))

    ##
    # Constructs a ranking o of the set U = {1,...,rank.length},
    # where o(i) = rank[i-1]. Raises a TypeError if rank is None.
    # Raises a ValueError if rank does not consist of distinct elements
    # between 1 and rank.length. Must run in O(n log n) time or better,
    # where n = rank.length.
    #
    # @param rank
    #            Ranking set
    # @throws TypeError
    #             if rank is None
    # @throws ValueError
    #             if rank does not consist of distinct elements between 1 and
    #             rank.length
    #
    def initializeFromList(self, rank):
        if (rank is None):
            raise TypeError("Null rank")

        rankCopy = list(rank[:])

        rankCopy.sort()
        for i, r in enumerate(rankCopy[:-1]):
            if (r == rankCopy[i + 1] or r < 1 or r > len(rankCopy)):
                raise ValueError("Duplicated rankings")

        if (rankCopy[-1] < 1) or (rankCopy[-1] > len(rankCopy)):
            raise ValueError("Ranking out of range")

        self.ranking = rank[:]

    ## Class (like a C struct) for sorting the ranks in descending order.
    #
    class rankData (object):
        ## Constructor.
        #
        #  @param position position in the scores array (before ordering).
        #  @param score score.
        #
        def __init__(self, score, position):
            ## score.
            self.score = score
            ## position.
            self.pos = position

        ## Returns a string represention of a rankData object.
        def __repr__(self):
            st = ""
            st += str(self.score)
            st += ", "
            st += str(self.pos)
            st += "\n"
            return st

        ## In Python 2, \_\_cmp\_\_(self, other) implemented comparison between two objects,
        #  returning a negative value if self < other, positive if self > other, and zero if they were equal.
        #  We want to sort backward (descending order).
        #
        #  @return -1 if the score of this object is greater than o's,
        #           1 if the score of this object is smaller than o's or
        #           0 if it is equal.
        #
        def __cmp__(self, o):
            return -cmp(self.score, o.score)

    ##
    # Constructs a ranking of the set U = {1,...,scores.length}, where element
    # i gets rank k if and only if scores[i-1] is the kth largest element in
    # the array scores. Raises a TypeError if scores is None. Raises
    # an ValueError if scores contains duplicate values. Must run
    # in O(n log n) time, where n = scores.length. <br>
    # <br>
    # Example: <br>
    # Suppose scores = (0.75, 0.36, 0.65, -1.5, 0.85). Then, the corresponding
    # ranking is o = (2, 4, 3, 5, 1).
    #
    # @param scores
    #            Scores set
    # @throws TypeError
    #             if scores is None
    # @throws ValueError
    #             if scores contains duplicate values
    #
    def initializeFromTuple(self, scores):
        if (scores is None):
            raise TypeError("Null score")

        scoresCopy = list(scores)
        scoresCopy.sort()
        for i in range(0, len(scores) - 1):
            if (scoresCopy[i] == scoresCopy[i + 1]):
                raise ValueError("Duplicated scores")

        scoresCopy = []
        for i, s in enumerate(scores):
            scoresCopy.append(Ranking.rankData(s, i))

        scoresCopy.sort(key=lambda pair: pair.score, reverse=True)
        # print (Ranking.toString(scoresCopy))

        self.ranking = len(scores) * [None]

        for i, s in enumerate(scoresCopy):
            if True:  # this is O(n*log(n))
                self.ranking[s.pos] = i + 1
            else:    # this is O(n**2)
                for j, s2 in enumerate(scores):
                    if s.score == s2:
                        break
                self.ranking[len(scores) - i - 1] = len(scores) - j

    ##  Returns the number of items in the ranking.
    #  Must run in O(1) time
    #
    #  @return the number of items in the ranking.
    #
    def getNumItems(self):
        return len(self.ranking)

    ##
    # Returns the rank of item i. Raises a ValueError if item i
    # is not present in the ranking. Must run in O(1) time.
    #
    # @param i
    #            Item to get rank for
    # @return the rank of item i
    # @throws ValueError
    #             if item i is not present in the ranking
    #
    def getRank(self, i):
        if (i < 1 or i > len(self.ranking)):
            raise ValueError("Item not in ranking")

        return self.ranking[i - 1]

    ##
    # Returns the foot-rule distance between r1 and r2. Raises a
    # TypeError if either r1 or r2 is None. Raises a
    # ValueError if r1 and r2 have different lengths. Must run in
    # O(n) time, where n is the number of elements in r1 (or r2).
    #
    # @param r1
    #            Ranking object
    # @param r2
    #            Ranking object
    # @return the foot-rule distance between r1 and r2
    # @throws TypeError
    #             if either r1 or r2 is None
    # @throws ValueError
    #             if r1 and r2 have different lengths
    #
    @staticmethod
    def footrule(r1, r2):

        if (r1 is None or r2 is None):
            raise TypeError("Ranking is None")

        if (len(r1.ranking) != len(r2.ranking)):
            raise ValueError("Rankings of different sizes")

        sum = 0

        for i in range(0, len(r1.ranking)):
            sum += abs(r1.ranking[i] - r2.ranking[i])
        return sum

    ##
    #  Recursive merge sort for counting the number of inversions
    #  in a sequence of integers.
    #
    #  @param arr given array.
    #  @return number of inversions.
    #
    @staticmethod
    def __sortAndCount(arr):
        if len(arr) <= 1:
            return 0

        mid = len(arr) // 2
        midR = len(arr)

        arrL = arr[0:mid]
        arrR = arr[mid:midR]

        countLeft = Ranking.__sortAndCount(arrL)
        countRight = Ranking.__sortAndCount(arrR)
        countMerge = Ranking.__mergeAndCount(arrL, arrR, arr)

        return countLeft + countRight + countMerge

    ##
    #  Merges two ordered sub-arrays and returns the resulting sorted array.
    #  Also counts the number of elements out of order (inversions).
    #
    #  @param left first array.
    #  @param right second array.
    #  @param resultant merged and sorted array.
    #  @return number of inversions.
    #
    @staticmethod
    def __mergeAndCount(left, right, resultant):
        count = 0
        i = 0
        j = 0
        k = 0

        while (i < len(left) and j < len(right)):
            if left[i] <= right[j]:
                resultant[k] = left[i]
                i += 1
            else:
                resultant[k] = right[j]
                j += 1
                count += (len(left) - i)
            k += 1

        if i >= len(left):
            resultant[k:] = right[j:]

        if j >= len(right):
            resultant[k:] = left[i:]

        return count

    ##
    # Returns the Kemeny distance between r1 and r2. Raises a
    # TypeError if either r1 or r2 is None. Raises a
    # ValueError if r1 and r2 have different lengths. Must run in
    # O(n log n) time, where n is the number of elements in r1 (or r2).
    #
    # @param r1
    #            Ranking object
    # @param r2
    #            Ranking object
    # @return the Kemeny distance between r1 and r2
    # @throws TypeError
    #             if either r1 or r2 is None
    # @throws ValueError
    #             if r1 and r2 have different lengths
    #
    @staticmethod
    def kemeny(r1, r2):
        if (r1 is None or r2 is None):
            raise TypeError("Ranking is None")

        if (len(r1.ranking) != len(r2.ranking)):
            raise ValueError("Rankings of different lengths")

        kemenyCopy = []

        for i, r in enumerate(r1.ranking):
            kemenyCopy.append(rankDataKemeny(r, r2.ranking[i]))

        kemenyCopy.sort(key=lambda pair: pair.r1)

        # print(Ranking.toString(kemenyCopy))

        ranking2 = [x.r2 for x in kemenyCopy]

        return Ranking.__sortAndCount(ranking2)

    ##
    # Returns the footrule distance between this and other. Raises a
    # TypeError if other is None. Raises a ValueError
    # if this and other have different lengths. Must run in O(n) time, where n
    # is the number of elements in this (or other).
    #
    # @param other
    #            Ranking object
    # @return the footrule distance between this and other
    # @throws TypeError
    #             if other is None
    # @throws ValueError
    #             if this and other have different lengths
    #
    def fDist(self, other):
        return Ranking.footrule(self, other)

    ##
    # Returns the Kemeny distance between this and other. Raises a
    # TypeError if other is None. Raises a ValueError
    # if this and other have different lengths. Must run in O(n log n) time,
    # where n is the number of elements in this (or other).
    #
    # @param other
    #            Ranking object
    # @return the Kemeny distance between this and other
    # @throws TypeError
    #             if other is None
    # @throws ValueError
    #             if this and other have different lengths
    #
    def kDist(self, other):
        return Ranking.kemeny(self, other)

    ##
    # Returns the number of inversions in this ranking. Should run in O(n log
    # n) time, where n is the number of elements in this. <br>
    # <br>
    # <strong>Note:</strong> Since Ranking objects are immutable, you could, in
    # fact, compute the number of inversions in a ranking just once, at the
    # time of creation, and store it for later access. With this
    # implementation, invCount would take O(1) time. You are free to implement
    # this version or the one that computes inversions every time the method is
    # called your documentation should indicate clearly which approach your
    # method uses.
    #
    # @return the number of inversions in t
    #
    def invCount(self):
        return Ranking.__sortAndCount(self.ranking)

    ##
    #  Returns a string representing a list of integers or tuples.
    #
    #  @param arr given list.
    #  @return string.
    #
    @staticmethod
    def toString(arr):
        st = ""
        for i in arr:
            st += " "
            st += str(i)
        return st

    ## Returns a string representation of this ranking.
    def __repr__(self):
        return Ranking.toString(self.ranking)

## Main program for testing.
#  @param argv
#		Command line arguments
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    n = 7
    if len(argv) > 1:
        n = int(argv[1])

    arr1 = [1, 5, 3, 8, 4, 2, 7, 6]
    arr2 = [1, 3, 5, 2, 4, 6]
    arr3 = [4, 3, 1, 5, 2]
    arr4 = [5, 4, 1, 3, 2]
    arr5 = [1, 2, 4, 5, 3]

    rank0 = Ranking(n)
    rank1 = Ranking(arr1)
    rank2 = Ranking(arr2)
    rank3 = Ranking(arr3)
    rank4 = Ranking(arr4)
    rank5 = Ranking(arr5)

    print("random: %s\n" % rank0)

    print("arr2: %s" % rank2)
    print("Second item in arr2: %s" % rank2.getRank(2))
    print("Number of arr2 items: %s" % rank2.getNumItems())
    print("Number of inversions in arr2: %s\n" % rank2.invCount())

    arrF = (0.75, 0.36, 0.65, -1.5, 0.85)
    arrF2 = (0.57, 0.63, -1.2, 0.0, -5.6)
    print("arrF: %s" % Ranking.toString(arrF))
    rankF = Ranking(arrF)
    print("rankF: %s\n" % rankF)

    print("arr1: %s" % Ranking.toString(arr1))
    print("Number of inversions in arr1: %s\n" % rank1.invCount())

    print("arr5: %s" % Ranking.toString(arr5))
    print("Number of inversions in arr5: %s" % rank5.invCount())
    print("arr5 Sorted: %s\n" % Ranking.toString(arr5))

    print("arr3: %s" % Ranking.toString(arr3))
    print("arr4: %s" % Ranking.toString(arr4))
    print("Kemeny arr3 x arr4: %s" % Ranking.kemeny(rank3, rank4))
    print("Footrule arr3 x arr4: %s" % Ranking.footrule(rank3, rank4))


if __name__ == "__main__":
    sys.exit(main())
