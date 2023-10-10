#!/usr/bin/env python
#coding: UTF-8
#
## @package _04e_bubble
#
#   Sorting lists.
#
#   Bubble sort, sometimes incorrectly referred to as sinking sort,
#   is a simple sorting algorithm that works by repeatedly stepping
#   through the list to be sorted, comparing each pair of adjacent items
#   and swapping them if they are in the wrong order. The pass through the
#   list is repeated until no swaps are needed, which indicates that the list
#   is sorted. The algorithm gets its name from the way smaller elements "bubble"
#   to the top of the list. Because it only uses comparisons to operate on elements,
#   it is a comparison sort. Although the algorithm is simple, most of the other sorting
#   algorithms are more efficient for large lists.
#   <p>
#   Bubble sort has worst-case and average complexity both @f$O(n^{2})@f$,
#   where n is the number of items being sorted.
#   Performance of bubble sort over an already-sorted list (best-case) is @f$O(n)@f$.
#
#   @author Paulo Roma
#   @since 16/04/2012
#   @see <a href="/python/videos/bubble_sort.mp4">Animation</a>

import random

##
#   @brief Sorts a list using bubble sort.
#
#   @param v list to be sorted.
#
def bubble_sort(v):
    n = len(v)
    swapped = True
    while swapped:
        swapped = False
        n -= 1
        for i in range(0, n):
            if (v[i] > v[i + 1]):
                # swap
                v[i], v[i + 1] = v[i + 1], v[i]
                swapped = True
                # every time one pass of this loop is completed,
                # the largest element has been moved to the end
                # of the array
    return v

def main():
    v = []
    for i in range(0, 20):
        v.append(random.randint(-100, 100))
    print("array       : ", v)
    print("sorted array: ", bubble_sort(v))


if __name__ == '__main__':
    main()
