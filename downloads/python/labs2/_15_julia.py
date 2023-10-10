#!/usr/bin/env python
# coding: UTF-8
#
## @package _15_julia
#
# Interactively draws a Julia set.
#
# Usage: 'n' draws the next set.
#        'q' or 'Esc' quits.
#
# @author Paulo Roma Cavalcanti
# @since 06/05/2010
# @see http://www.tjhsst.edu/~dhyatt/supercomp/n106.html
# @see http://en.wikipedia.org/wiki/Julia_set

import sys
import os
sys.path.append("../labs")
from OpenGL.GL import *
from OpenGL.GLUT import *
from OpenGL.GLU import *
from math import *
from progress_bar import progress_bar

# domain in the complex plane

LEFT = -1.5
RIGHT = 1.5
TOP = 1.5
BOTTOM = -1.5

WIDTH_MATRIX = 512       # size of the image
HEIGHT_MATRIX = 512

width = WIDTH_MATRIX
height = HEIGHT_MATRIX
MaxIters = 200           # maximum number of iterations

"""
   1. C = -0.12375 + 0.56508i (Basin with one attractor)
   2. C = -0.12 + .74i        (Three Attractors)
   3. C = -0.11 + 0.6557i     (Three arttractors but with slight spiral
   4. C = -0.194 + 0.6557i    (Three-attractor Cantor Set)
   5. C =  0 + i              (Dendrite filament near 3-attractor basin)
   6. C = -0.125 + 0i         (Parabolic case: boundary between 2 and 4 attractors)
   7. C =  0.11031 - 0.67037i (Fatou dust near 7-attractor basin)
   8. C =  0.27334 + 0.00742i (Parabolic case near 20-attractor basin) 
"""

c = [-0.12375 + 0.56508j,
     -0.12 + 0.74j,
     -0.11 + 0.6557j,
     -0.194 + 0.6557j,
     0.0 + 1.0j,
     -0.125 + 0.0j,
     0.11031 - 0.67037j,
     0.27334 + 0.00742j,
     -0.75 + 0.0j,
     -0.8 + 0.156j,
     -0.70176 - 0.38j,
     0.285 + 0.01j,
     -0.835 - 0.2321j,
     -0.70176 - 0.38j,
     -0.4 + 0.6j,
     -0.6180339887498948482 + 0.0j,
     0.285 + 0.0j]

mind = len(c)
ind = 0
__LIST__ = True

try:
    xrange
except NameError:
    xrange = range

def julia(c, kcolor):
    """
       Computes a Julia set using the constant c.
       kcolor is the square of the radius of the 
       circle in which zn must be in to be part of the set.

       z(n+1) = z(n)**2 + c
       z = (x+iy), c = (p+iq)
       z*z = x**2 - y**2 + 2ixy  
    """

    global theMandelbrot

    xmin = -1.5
    ymin = -1.5
    xmax = 1.5
    ymax = 1.5
    fact = 1.0
    npix = width
    npiy = height

    if __LIST__:
        theMandelbrot = glGenLists(1)
        glNewList(theMandelbrot, GL_COMPILE)
        glPointSize(3.0)

    if (fact >= 1.0 or fact <= 0.0):
        fact = 1.0

    npix = int(npix * fact)
    npiy = int(npiy * fact)

    deltax = (xmax - xmin) / float(npix)
    deltay = (ymax - ymin) / float(npiy)

    glBegin(GL_POINTS)

    for np in xrange(0, npix):
        progress_bar(np, npix - 1, 40)
        x = xmin + np * deltax
        for nq in xrange(0, npiy):
            y = ymin + nq * deltay
            k = 0   # number of iterations

            f = complex(x, y)
            r = 0.0
            while (r <= kcolor and k <= MaxIters):
                z = f
                f = z * z + c
                r = f.real * f.real + f.imag * f.imag
                k += 1

            if (r < kcolor):
                glColor3f(0.0, 0.0, 1.0)      # in the set - blue
            else:
                r = float(k) / MaxIters       # out of the set
                if (r > 0.03):
                    r *= 30.0  # lot of iterations
                else:
                    r *= 20.0  # few iterations
                if (r < 3.0):
                    glColor3f(r, 0.0, 0.0)    # red
                elif (r > 10.0):
                    glColor3f(0.0, 1.0, 0.0)  # green
                elif (r > 8.0):
                    glColor3f(0.0, 1.0, 1.0)  # cyan
                else:
                    glColor3f(1.0, 1.0, 0.0)  # yellow

            glVertex2f(np, nq)

    glEnd()
    if __LIST__:
        glEndList()


def init():
    glClearColor(0.0, 0.0, 0.0, 0.0)
    glViewport(0, 0, width, height)
    glMatrixMode(GL_PROJECTION)
    glLoadIdentity()
    gluOrtho2D(0, width, 0, height)
    glMatrixMode(GL_MODELVIEW)
    glLoadIdentity()
    julia(c[0], 4.0)


def display():
    glClear(GL_COLOR_BUFFER_BIT)
    if __LIST__:
        glCallList(theMandelbrot)
    else:
        julia(c[ind % mind], 4.0)
    glutSwapBuffers()


def reshape(w, h):
    global width, height

    width = w
    height = h
    glViewport(0, 0, w, h)
    glMatrixMode(GL_PROJECTION)
    if not __LIST__:
        glLoadIdentity()
        gluOrtho2D(0, width, 0, height)
    glMatrixMode(GL_MODELVIEW)
    glLoadIdentity()


def keyboard(key, x, y):
    global MaxIters, ind

    ESCAPE = b'\033'
    if key == b'Q' or key == b'q' or key == ESCAPE:
        glutLeaveMainLoop()
        return
        exit(0)
    elif key == b'I' or key == b'i':
        MaxIters += 10
    elif key == b'D' or key == b'd':
        MaxIters -= 10
    elif key == b'N' or key == b'n':
        ind += 1

    if __LIST__:
        julia(c[ind % mind], 4.0)
        glutPostRedisplay()
    else:
        display()

def main(argv=None):
    if argv is None:
        argv = sys.argv

    glutInit(argv)
    card = os.environ.get('CARD_TYPE')
    #if ( card == "Intel" ): glutCreateWindow ("Intel 945 bug")
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB)
    glutInitWindowSize(width, height)
    glutInitWindowPosition(0, 0)
    glutCreateWindow("Fractal eXtreme")
    init()
    glutDisplayFunc(display)
    glutKeyboardFunc(keyboard)
    glutReshapeFunc(reshape)
    glutMainLoop()
    return 0


if __name__ == '__main__':
    sys.exit(main())
