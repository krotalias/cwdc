#!/usr/bin/env python
# coding: UTF-8
#
## @package mergeHeap
#  Merge a variable number of sorted lists, into a single sorted output,
#  using a heap queue. Returns an iterator over the sorted values.
#
#  @see https://docs.python.org/2/library/heapq.html
#  @see https://docs.python.org/2/library/functions.html#iter
#  @see https://wiki.python.org/moin/Generators
#

import heapq

## Push a tuple(item,index) to a given heap.
#  Heaps are binary trees for which every parent node has a
#  value less than or equal to any of its children.
#  Generally implemented using an array or list.
#
#  @param h heap (a list).
#  @param it an iterator for getting the next item from a list.
#  @param i item index (the index of the list it came from).
#
def addtoheap(h, i, it):
    try:
        # Push the value item onto the heap, maintaining the heap invariant.
        # Smaller item value on the queue front, and in case of a tie,
        # the item index will be used.
        heapq.heappush(h, (next(it), i))
    except StopIteration:
        pass

## Create a priority queue for merging a set of sorted lists.
#  It implements a generator, which yields the next element
#  of the resultant sorted output.
#
def mergek(*lists):
    # create a list of iterators for each list in "lists"
    its = list(map(iter, lists))
    # an empty list to be used as a priority queue
    h = []
    # push pairs of (first element of each list, and list index)
    for i, it in enumerate(its):
        addtoheap(h, i, it)
    # h = [(1, 2), (7, 3), (2, 1), (10, 0)]
    while h:
        # remove the smaller element v from the queue.
        v, i = heapq.heappop(h)
        # push the successor of v onto the queue.
        addtoheap(h, i, its[i])
        # return v
        yield v

## Main program for testing.
#  Merge four sorted lists.
#
def main():
    for x in mergek([10], [2, 4, 6], [1, 3, 5], [7, 8, 9]):
        print(x)


if __name__ == "__main__":
    main()
