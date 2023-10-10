#!/usr/bin/env python
# coding: UTF-8
#
## @package weightedNumGenerator
# Return random numbers weighted by given probabilities.
#
# @author Flavia e Paulo Roma
# @since 16/06/2016
# @see http://programmers.stackexchange.com/questions/150616/return-random-list-item-by-its-weight

# current system time is used to initialize the generator when random is first imported.
from random import randint, random, choice, shuffle
from functools import reduce

## Method 1 -- given a list of of items and a list of probabilities, return a new list
#  that contains int(100*prob[i]) duplicates of the i-th item.
#  Randomly select an item from that new list within the range [0, length(list)]
#
#  @param l list of items.
#  @param weights list of probabilities.
#  @return a list of items with multiplicity given by its corresponding probability times 100 (minimum p=0.01).
def genWeightedList(l, weights):
    if (len(l) != len(weights)):
        return None
    weighedList = []
    for i, w in enumerate(weights):  # tuples(0,w[0]), (1,w[1]),...)
        mult = int(w * 100)
        weighedList += [l[i]] * mult
    return weighedList

## Using a dictionary, instead of two lists.
#  @param d pairs of items,probabilities.
#  @return a list of items with multiplicity given by its
#          corresponding probability times 100 (minimum p=0.01).
def genWeightedListD(d):
    weighedList = []
    for k, v in d.items():  # return pairs of key:value
        mult = int(v * 100)
        weighedList += [k] * mult
    return weighedList

## Return a random element from seq (same of choice from random).
#  @param seq given sequence of items.
#  @return random item.
def weightedRand(seq):
    ## Return a random integer N such that a <= N <= b.
    randSel = randint(0, len(seq) - 1)
    print("seq[%d] = %s" % (randSel, seq[randSel]))
    return seq[randSel]

## Method 2 -- given list of items and a list of probabilities,
#  which sum up to one, for example, 0.5 + 0.2 + 0.2 + 0.1 = 1.0.
#  Get a random number between 0 and the total weight (1.0).
#  - If the random number falls in the first slot, or weight\[0] (which is 0.5 in the example),
#  then choose the first item from the list.
#  - If it falls in the second slot, which
#  is between weight[0] and weight[0] + weight[1], then select the second
#  item from the list.
#  - For third item, the random number must fall in the third slot,
#  which would be between weight[0] + weight[1] and weight[0] + weight[1] + weight[2],
#  - and the sequence goes on.
#
#  TODO - make method more efficient with quicksort
#
#  @param l list of items
#  @param weights list of probabilities.
#  @return a random item weighted by given probabilities.
def weightedRand2(l, weights):
    if (len(l) != len(weights)):
        return
    # should always sum 1.0
    totalWeight = reduce(lambda x, y: x + y, weights)
    if abs(totalWeight - 1.0) > 1.0e-03:
        print("totalWeight = %f" % totalWeight)
        return None

    # return the next random floating point number in the range [0.0, 1.0)
    randSel = random()
    print("\nrandom = %f" % randSel)
    weightSum = 0
    for i, item in enumerate(l):
        weightSum += weights[i]
        print(weightSum, item)
        if (randSel <= weightSum):
            return item

## Using a dictionary.
#  @param d pairs of items,probabilities.
#  @return a random item weighted by given probabilities.
def weightedRandD(d):
    # should always sum 1.0
    totalWeight = reduce(lambda x, y: x + y, d.values())
    if abs(totalWeight - 1.0) > 1.0e-03:
        print("totalWeight = %f" % totalWeight)
        return None

    # return the next random floating point number in the range [0.0, 1.0)
    randSel = random()
    print("\nrandom = %f" % randSel)
    weightSum = 0
    for k, v in d.items():
        weightSum += v
        print(weightSum, k)
        if (randSel <= weightSum):
            return k

## Main program for testing.
def main():
    d = {'a': 0.1, 'b': 0.2, 'c': 0.2, 'd': 0.5}
    l = list(d.keys())
    weights = list(d.values())

    modList = genWeightedList(l, weights)
    modList = genWeightedListD(d)

    # shuffle the sequence modlist in place (not really necessary?)
    shuffle(modList)
    print("l = %s" % l)
    print("modlist = %s" % modList)

    randSel = weightedRand(modList)
    print("Using method 1: = %s" % randSel)
    # return a random element from the non-empty sequence modlist, or raises IndexError, if modlist is empty.
    randSel = choice(modList)
    print("randSel (choice) = %s" % randSel)

    print("Using method 2: %s" % weightedRand2(l, weights))
    print("Using method 3: %s" % weightedRandD(d))


if __name__ == "__main__":
    main()
