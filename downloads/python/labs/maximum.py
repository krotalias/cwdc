#!/usr/bin/env python
#
## @package maximum
#
#
#   Recursively find the maximum value in a list.
#
#   @author Paulo Roma
#   @since  15/09/2016
#
def maximum(L):
    if len(L) == 1:
        return L[0]
    else:
        return max(L[0], maximum(L[1:]))


if __name__ == '__main__':
    # so example input and output:
    L = [2, 4, 6, 23, 1, 46]
    print(maximum(L))
