#!/usr/bin/env python
#
## @package _11_ncsub_rec
#
#   Non-continuous subsequences.
#
#   @author Paulo Roma
#   @since 03/01/2009
#   @see http://www.rosettacode.org/wiki/Non_Continuous_Subsequences


##
#   @brief Enumerates all non-continuous subsequences
#   for a given sequence.
#   <p>
#   A subsequence contains some subset of the elements of this sequence,
#   in the same order. A continuous subsequence is one in which no
#   elements are missing between the first and last elements of the
#   subsequence.
#   <p>
#   Recursive version.
#
#   @param seq a list of integers.
#   @param s
#   @return a list of subsequence lists.
#
def ncsub(seq, s=0):
    if seq:
        x = seq[:1]   # only the first element
        xs = seq[1:]  # remove the first element
        p2 = s % 2
        p1 = not p2
        return [x + ys for ys in ncsub(xs, s + p1)] + ncsub(xs, s + p2)
    else:             # empty list
        return [[]] if s >= 3 else []

def main():
    print(ncsub(list(range(1, 4))))  # (1, 2, 3)

    print(ncsub(list(range(1, 5))))  # (1, 2, 3, 4)

    # print (ncsub(list(range(1, 6)))) # (1, 2, 3, 4, 5)


if __name__ == '__main__':
    main()
