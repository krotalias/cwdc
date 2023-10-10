#!/usr/bin/env python
# coding: UTF-8
#
## @package mapper2
#
#  Class for handling the mapping of a triangle onto another,
#  or three points in world coordinates to GPS coordinates,
#  by using affine transformations.
#
#  @author Paulo and Flavia Roma
#  @date 10/08/2019
#
import sys
import numpy as np

class mapper2:
    ## Constructor.
    #
    #  A linear transformation is uniquely defined by how its
    #  base vectors are transformed.
    #
    #  In 2D, three non-colinear points in a coordinate system A,
    #  define a base with two vectors.
    #
    #  Therefore, if we know the image of these three points onto another
    #  coordinate system B, the transformation that takes A -> B is defined.
    #
    #  @param world window triangle.
    #  @param viewport screen triangle.
    #  @param ydown whether Yaxis is upside down.
    #  @see http://www.math.ucla.edu/~baker/149.1.02w/handouts/i_affine_II.pdf
    #
    def __init__(self, world, viewport, ydown=True):
        if len(world) == 4:
            world = list(world)
            world += [world[0], world[3]]
        if len(viewport) == 4:
            viewport = list(viewport)
            viewport += [viewport[0], viewport[3]]

        self.ys = -1 if ydown else 1

        ## Three vertices of a triangle in world coordinates.
        self.world = world
        ## Three vertices of a triangle in GPS coordinates.
        self.viewport = viewport

        p = np.array([world[0], world[1], 1])
        q = np.array([world[2], world[3], 1])
        r = np.array([world[4], world[5], 1])
        P = np.array([viewport[0], viewport[1], 1])
        Q = np.array([viewport[2], viewport[3], 1])
        R = np.array([viewport[4], viewport[5], 1])

        # Row matrices.
        t1 = np.linalg.inv(np.array([p - r, q - r, r]))
        t2 = np.array([P - R, Q - R, R])

        # T = transpose(t1 * t2)
        # Column matrices.
        ## Hold the world to GPS transformation matrix.
        self.T = np.transpose(t1.dot(t2))
        ## Inverse matrix of T
        self.I = np.linalg.inv(self.T)

    ## Maps a single point from world coordinates to viewport (screen) coordinates.
    #
    #  @param x, y given point.
    #  @return a new point in screen coordinates.
    #
    def __windowToViewport(self, x, y):
        # Y axis maybe upside down
        X = self.T.dot(np.array([x, self.ys * y, 1]))
        return X[0], X[1]

    ## Maps a single vector from world coordinates to viewport (screen) coordinates.
    #
    #  @param x, y given vector.
    #  @return a new vector in screen coordinates.
    #
    def windowVecToViewport(self, x, y):
        X = self.T.dot(np.array([x, self.ys * y, 0]))
        return X[0], X[1]

    ## Maps a single point from screen coordinates to window (world) coordinates.
    #
    #  @param x, y given point.
    #  @return a new point in world coordinates.
    #
    def viewportToWindow(self, x, y):
        X = self.I.dot(np.array([x, y, 1]))
        return X[0], X[1]

    ## Maps points from world coordinates to viewport (screen) coordinates.
    #
    #  @param p a variable number of points.
    #  @return two new points in screen coordinates.
    #
    def windowToViewport(self, *p):
        return [self.__windowToViewport(x[0], x[1]) for x in p]

def main():
    # maps the unit triangle onto another triangle.
    # p q r -> P Q R (homogeneous coordinates).
    map = mapper2([1, 0, 0, 1, 0, 0], [2, 1, 4, 3, 2.5, 4], False)
    print(map.T)
    p1, p2, p3 = map.windowToViewport((1, 0), (0, 1), (0, 0))
    p = map.viewportToWindow(400, 400)
    print("%s - %s - %s" % (p1, p2, p3))  # (2.0, 1.0) - (4.0, 3.0) - (2.5,4)
    print("(%d,%d)" % p)       # (-198, 198)


if __name__ == "__main__":
    sys.exit(main())
