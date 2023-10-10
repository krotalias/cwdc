#!/usr/bin/env python
# coding: UTF-8
#
## @package _13_VoronoiDemo
#
#  Interactively draws a Delaunay triangulation and
#  its dual Voronoi diagram.
#
#  Usage: just click points on the window with the
#         left mouse button.
#
#  @author Paulo Roma Cavalcanti
#  @since 07/03/2007

import os
from sys import *
path.append("C:\cgal-python-0.9.1")       # Windows

try:
    from CGAL.Kernel import *
    from CGAL import *
    from CGAL.Triangulations_2 import *
except:
    print('''ERROR: cgal-python not installed properly.''')
    print('''Go get it: http://cgal-python.gforge.inria.fr/''')
    exit(1)

# must be imported AFTER the CGAL stuff!!
try:
    from OpenGL.GLUT import *
    from OpenGL.GL import *
    from OpenGL.GLU import *
except:
    print('''ERROR: PyOpenGL not installed properly.''')
    print('''Go get it: http://pyopengl.sourceforge.net/''')
    exit(2)

width = 512
height = 512
points = []

# we want to use a Delaunay_triangulation_2
triang = Delaunay_triangulation_2()

def display():

    glClear(GL_COLOR_BUFFER_BIT)

    # Draw points
    glColor3f(1.0, 1.0, 1.0)
    glPointSize(3)
    glBegin(GL_POINTS)
    for p in points:
        glVertex2f(p[0], p[1])
    glEnd()

    # Draw Delaunay Triangulation
    glColor3f(1.0, 0.0, 1.0)
    glBegin(GL_LINES)
    for e in triang.edges:
        if (triang.is_infinite(e)):
            continue
        s = triang.segment(e)
        for i in range(2):
            p = Point_2(s[i])
            glVertex2f(p[0], p[1])
    glEnd()

    # Draw Voronoi Diagram
    glColor3f(1.0, 1.0, 0.0)
    glBegin(GL_LINES)
    for e in triang.edges:
        obj = triang.dual(e)
        # print obj.__class__
        if isinstance(obj, Segment_2):
            glVertex2f(obj[0][0], obj[0][1])
            glVertex2f(obj[1][0], obj[1][1])
        elif isinstance(obj, Ray_2):
            p = obj.source()
            v = obj.direction().vector()
            glVertex2f(p[0], p[1])
            p = p + 1000 * v
            glVertex2f(p[0], p[1])
    glEnd()

    # Finish
    glutSwapBuffers()


def reshape(wid, hgt):

    global width, height
    width = wid
    height = hgt
    glViewport(0, 0, width, height)
    glMatrixMode(GL_PROJECTION)
    glLoadIdentity()
    gluOrtho2D(0, width, height, 0)


def mouse(button, state, x, y):

    if (button != GLUT_LEFT_BUTTON or state != GLUT_DOWN):
        return
    p = Point_2(x, y)
    points.append(p)

    triang.insert(p)
    glutPostRedisplay()


def init():
    return


def main(argv=None):
    if argv is None:
        argv = sys.argv

    glutInit(argv)
    card = os.environ.get('CARD_TYPE')
    if (card == "Intel"):
        glutCreateWindow("Intel 945 bug")
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB)
    glutInitWindowSize(width, height)
    glutInitWindowPosition(100, 100)
    glutCreateWindow("Delaunay (pink) and Voronoi (yellow)")
    glutDisplayFunc(display)
    glutMouseFunc(mouse)
    glutReshapeFunc(reshape)
    glutMainLoop()
    return


if __name__ == '__main__':
    sys.exit(main())
