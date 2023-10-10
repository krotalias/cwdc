#!/usr/bin/env python
# coding: UTF-8
#
## @package _08c_rightTriangle
#
#  Print the right triangle with the length of two of its sides equal
#  to a given value @f$n@f$,
#  using the symbols + and =, in each of its four possible orientations.
#
#  For instance, if n=5, the output should be:
# <pre>
# +====  +++++  ====+  +++++
# ++===  ++++=  ===++  =++++
# +++==  +++==  ==+++  ==+++
# ++++=  ++===  =++++  ===++
# +++++  +====  +++++  ====+
# </pre>
#
#   @author Paulo Roma
#   @since 13/05/2018
#   @see https://en.wikipedia.org/wiki/Right_triangle
#

## Return a string representing the right triangle of height n
#  in a given orientation.
#
#  @param n triangle height.
#  @param orientation: 0 up, 1 down, 2 right, 3 left.
#
def rightTriangle(n, orientation=0):
    st = ""
    if orientation == 0:
        for i in range(n):
            st += "+" * (i + 1) + "=" * (n - i - 1) + " \n"
    elif orientation == 1:
        for i in range(n - 1, -1, -1):
            st += "+" * (i + 1) + "=" * (n - i - 1) + " \n"
    elif orientation == 2:
        for i in range(n - 1, -1, -1):
            st += "=" * (i) + "+" * (n - i) + " \n"
    elif orientation == 3:
        for i in range(n):
            st += "=" * (i) + "+" * (n - i) + " \n"
    return st

## Generates and interleaves all four orientations for printing.
#
#  @param n triangle height.
#
def getAllTriangles(n):
    symList = []
    for i in range(4):
        symList.append(rightTriangle(n, i).split("\n"))

    # list(zip(symList[0], symList[1], symList[2], symList[3]))
    lstr = list(zip(*symList))
    # this is a list of tuples
    # [('+== ', '+++ ', '==+ ', '+++ '), ('++= ', '++= ', '=++ ', '=++ '), ('+++ ', '+== ', '+++ ', '==+ ')]

    st = ""
    for i in lstr:
        # print each tuple
        # print ("".join(i))
        st += "".join(i) + "\n"

    return st.rstrip("\n")


if __name__ == '__main__':
    print(getAllTriangles(int(input("Type n: "))))
