#!/usr/bin/env python
# coding: UTF-8
#
## @package trigonometry
#  An arc tangent which considers the signs of both x and y,
#  mimicking the behaviour of function atan2.
#
#  @author Paulo Roma
#  @since

from math import atan, pi

##
#   Computes the arc tangent (measured in degrees) of y/x.
#   Unlike atan(y/x), the signs of both x and y are considered.
#
#   The two-argument atan2 function computes the arctangent of @f$\frac{y}{x}@f$ given y and x,
#   but with a range of @f$(-\pi, \pi]@f$. In other words, atan2(y, x) is the angle between
#   the positive x-axis of a plane and the point (x, y) on it, with positive sign
#   for counter-clockwise angles (upper half-plane, y > 0), and negative sign for
#   clockwise angles (lower half-plane, y < 0).
#
#   @param y y coordinate.
#   @param x x coordinate.
#   @return atan2(y,x) in degrees.
#
def atan2d(y, x):
    if (x == 0 and y == 0):
        ang = "undef"
    elif (x == 0 and y < 0):
        ang = -pi / 2
    elif (x == 0 and y > 0):
        ang = pi / 2
    else:
        ang = atan(float(y) / x)
        if (x < 0 and y >= 0):
            ang += pi
        elif (x < 0 and y < 0):
            ang -= pi

    return ang * 180 / pi  # math.degrees(math.atan2(y,x))

def main():
    y = float(input("Type y: "))
    x = float(input("Type x: "))
    print(atan2d(y, x))


if __name__ == "__main__":
    main()
