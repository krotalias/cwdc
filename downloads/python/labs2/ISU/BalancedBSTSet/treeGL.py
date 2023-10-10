#!/usr/bin/env python
# coding: UTF-8
#
## @package treeGL
#
#  A tree exhibitor based on OpenGL.
#  Non-commercial use only.
#
#  Fedora:
#   - sudo dnf install python2-pyopengl or python3-pyopengl
#
#  Ubuntu:
#   - sudo apt-get install python2-opengl or python3-opengl
#
#  MacOS:
#   - sudo port install py27-opengl or py36-opengl
#
#  @author Paulo Roma Cavalcanti
#  @date 01/10/2018
#  @copyright LGPL2
#
from __future__ import print_function
from builtins import input
from OpenGL.GL import *
from OpenGL.GLUT import *
from OpenGL.GLU import *
try:
    from BalancedBSTSet import BalancedBSTSet as BSTSet, generateRandomArray
except ImportError:
    from BSTSet import BSTSet, generateRandomArray
from math import sin, cos, pi, pow, fabs
from random import randint
import sys

## background color.
BACKGROUND = (1.0, 250 / 255.0, 205 / 255.0, 0.0)
## text color.
BLACK = (0.0, 0.0, 0.0)
BLUE = (0.0, 0.0, 1.0)
RED = (1.0, 0.0, 0.0)
GREEN = (0.0, 1.0, 0.0)
GRAY = (0.5, 0.5, 0.5)
## edge color.
PURPLE = (0.7, 0.0, 0.7)
## leaf color.
ORANGE = (1.0, 0.5, 0.0)
## internal node color.
DARKGRAY = (0.3, 0.3, 0.3)
LIGHTGRAY = (0.7, 0.7, 0.7)

## convert ang in degrees to radians.
def toDegree(ang): return pi * ang / 180.0

## area for picking.
def pickRadius(r): return max(3.0 * r, radius)
## horizontal displacement for a given height.
def HDSP(ht): return hdsp * pow(2.0, ht - 2)


## radius of a circle in world coordinates.
radius = 1.0
## space between nodes and labels.
space = 1.0
## horizontal displacement between nodes.
hdsp = 0.0
## vertical displacement between nodes.
vdsp = 0.0
## a reference to the global search tree.
Stree = None
## representation of a Null node.
NullNode = None
## font for rendering normal text.
fontNormal = GLUT_BITMAP_HELVETICA_12
## font for rendering small text.
fontSmall = GLUT_BITMAP_TIMES_ROMAN_10
## current font.
font = fontNormal
## object for mapping world coordinates to screen coordinates.
mapwv = None

## a 2D point.
class WorldPoint (object):
    ## radius for picking in X direction.
    rdx = 0.0
    ## radius for picking in Y direction.
    rdy = 0.0

    ## constructor.
    def __init__(self, x=0.0, y=0.0):
        ## this point Euclidean coordinates.
        self.position = (x, y)

    ## point position getter.
    #  @return this point position.
    @property
    def position(self):
        return self.x, self.y

    ## set the coordinates of this point.
    @position.setter
    def position(self, pos):
        ## x coordinate.
        self.x = pos[0]
        ## y coordinate.
        self.y = pos[1]

    ## negation operator.
    def __neg__(self):
        return WorldPoint(-self.x, -self.y)

    ## return a copy of this point.
    def copy(self):
        return WorldPoint(self.x, self.y)

    ## operator -.
     # Return the distance to point p.
    def __sub__(self, p):
        return self + -p

    ## operator +.
    def __add__(self, p):
        return WorldPoint(p.x + self.x, p.y + self.y)

    ## Dot product operator.
    def dotProd(self, p):
        return (p.x * self.x + p.y * self.y)

    ## operator *.
     # Multiplication by an scalar.
    def __mul__(self, s):
        return WorldPoint(s * self.x, s * self.y)

    ## operator += .
    def __iadd__(self, p):
        self.x += p.x
        self.y += p.y
        return self

    ## operator ==.
    # Check if p is into a box of size (WorldPoint.rdx, WorldPoint.rdy), centered at self.
    def __eq__(self, p):
        return self.isClose(p, WorldPoint.rdx, WorldPoint.rdy)

    ## operator [].
    def __getitem__(self, index):
        return self.x if index == 0 else self.y

    ## operator [].
    def __setitem__(self, index, value):
        if index == 0:
            self.x = value
        else:
            self.y = value

    ## return whether this point is close to point p, given a tolerance.
    def isClose(self, p, tolx, toly):
        return (fabs(self.x - p.x) <= tolx) and (fabs(self.y - p.y) <= toly)

    ## string representation of this point.
    def __repr__(self):
        return "(%f, %f)" % self.position


## Manages the mapping window <---> viewport.
class mapper(object):
    ## constructor from two rectangles.
    def __init__(self, window, viewport):
        ## make y point upward.
        self.up = lambda y: self.__ysize - y
        ## lower left corner of the current window.
        self.__p1 = WorldPoint()
        ## upper right corner of the current window.
        self.__p2 = WorldPoint(1, 1)
        ## a rectangle limiting the screen coordinates.
        self.viewport = viewport
        ## a rectangle limiting the world coordinates.
        self.window = window

    ## window getter.
    #  @return the current window corners.
    @property
    def window(self):
        # a tuple is immutable
        return self.__p1, self.__p2

    ## set the current window.
    @window.setter
    def window(self, window):
        self.__p1.position = (window[0], window[1])
        self.__p2.position = (window[2], window[3])
        self.update()

    ## viewport getter.
    # @return the current viewport extension.
    @property
    def viewport(self):
        return self.__xsize, self.__ysize

    ## set the current viewport.
    @viewport.setter
    def viewport(self, viewport):
        ## initial viewport lower left corner position in pixels.
        self.__xpos = viewport[0]
        ## initial viewport lower left corner position in pixels.
        self.__ypos = viewport[1]
        ## initial viewport length in pixels.
        self.__xsize = viewport[2] - viewport[0]
        ## initial viewport height in pixels.
        self.__ysize = viewport[3] - viewport[1]
        self.update()

    ## calculate window <--> viewport scale factors and aspect ratio.
    #  If the scale factors are not the same in both directions, x and y,
    #  distortion will occur.
    def update(self):
        fxsize = float(self.__xsize)
        fysize = float(self.__ysize)
        d = self.__p2 - self.__p1
        ## X scale.
        self.__sx = d.x / fxsize
        ## Y scale.
        self.__sy = d.y / fysize
        ## window to viewport aspect ratio: width / height.
        self.aspect = self.__sx / self.__sy
        WorldPoint.rdx = pickRadius(self.__sx)
        WorldPoint.rdy = pickRadius(self.__sy)

    ## maps screen point (x,y) to world coordinates.
    #
    # @param x screen coordinate.
    # @param y screen coordinate.
    # @return the world coordinates of (x,y).
    #
    def toWorldCoordinates(self, x=0, y=0):
        # make y grow upward
        y = self.up(y)
        pt = WorldPoint((x - self.__xpos) * self.__sx,
                        (y - self.__ypos) * self.__sy)
        pt += self.__p1

        # assert self.toScreenCoordinates(pt) == (x,y)

        return pt

    ## maps a world point to screen coordinates.
    #
    # @param wp world point.
    # @return the screen coordinates of (wp.x,wp.y).
    # @see http://www.di.ubi.pt/~agomes/cg/teoricas/04e-windows.pdf
    #
    def toScreenCoordinates(self, wp):
        pt = (int(round((wp.x - self.__p1.x) / self.__sx)) + self.__xpos,
              int(round((wp.y - self.__p1.y) / self.__sy)) + self.__ypos)

        return pt


#=================================  text  =====================================#

## draws a text at pt.
#
#  @param pt starting position.
#  @param s string.
#
def text(pt, s):
    glColor3d(*BLACK)
    glRasterPos2f(pt.x, pt.y)
    for i in s:
        glutBitmapCharacter(font, ctypes.c_int(ord(i)))


#===============================  pldraw  =====================================#

## draws a polyline, starting at pts[0] and ending at pts[n-1].
def pldraw(n, pts):
    glColor(*PURPLE)
    glLineWidth(2.0)
    glBegin(GL_LINE_STRIP)
    for p in pts:
        glVertex2f(p.x, p.y)
    glEnd()


#==================================  pnt  =====================================#

## draws a point at pt.
def pnt(pt):
    glBegin(GL_POINTS)
    glVertex2f(pt.x, pt.y)
    glEnd()


#=========================  circ  =============================================#

## draws a circle.
#
#  @param center of the circle.
#  @param r radius of the circle.
#
def circ(center, r):
    global font

    font = fontNormal
    if mapwv.aspect > 3.0 or mapwv.aspect < 0.2:
        pnt(center)
        font = fontSmall
        return

    nseg = 18
    ang = 2 * pi / nseg
    a = WorldPoint(1.0, 0.0)
    glLineWidth(1.0)

    c = r * cos(ang)
    s = r * sin(ang)
    rot = [WorldPoint(c, -s),
           WorldPoint(s, c)]
    #glBegin(GL_LINE_LOOP)
    glBegin(GL_POLYGON)
    for i in range(nseg):
        a.position = (a.dotProd(rot[0]), a.dotProd(rot[1]))
        # translate to center
        if mapwv.aspect > 1:
            glVertex2f(a.x * mapwv.aspect + center.x, a.y + center.y)
        else:
            glVertex2f(a.x + center.x, a.y / mapwv.aspect + center.y)
    glEnd()


#=========================  reshape  ===========================================#

## handles callbacks generated by moving or resizing a window.
def reshape(w, h):
    mapwv.viewport = (0, 0, w, h)
    glViewport(0, 0, w, h)

#=========================  printHelp  =========================================#

## prints help messages.
def printHelp():
    print("Type 'q' to exit.")
    print("Type 'i' to insert.")
    print("Type 'c' to start over.")
    print("Type 'd' to delete.")
    print("Type 'r' to insert random nodes.")
    print("Type 'R' to rebalance the tree.")
    print("Type '?' to statistics.")
    print("Mouse Left click to delete.")
    print("Mouse Middle click to print the tree.")
    print("Mouse Right click to get info.\n")


#=========================  printData  =========================================#

## prints some statistics.
def printData():
    print("Height: %s" % Stree.height())
    print("Nodes : %s\n" % len(Stree))


#=========================  insertData  ========================================#

## inserts a new node.
def insertData():
    input_buffer = input("Enter new node contents: ")
    ptr = list(map(int, input_buffer.split()))
    addNodes(ptr)
    redraw()


#=========================  deleteData  ========================================#

## deletes a node.
def deleteData():
    input_buffer = input("Enter nodes to be deleted: ")
    ptr = input_buffer.split()
    for node in ptr:
        Stree.remove(int(node))

    redraw()

# ==================== getXmin =================================================#

## gets the x coordinate of the leftmost node of a subtree.
# The left subtree is traversed, recursively, until a NullNode is found.
#
# @param rnode subtree root.
# @param center calculated rnode position.
# @param ht rnode height.
# @return minimum node coordinate in the x axis.
#
def getXmin(rnode, center, ht):
    if rnode.left is NullNode:
        return center.x

    d = WorldPoint(HDSP(ht - 1), vdsp)
    return getXmin(rnode.left, center - d, ht - 1)

# ==================== getXmax =================================================#

## gets to the x coordinate of the rightmost node of a subtree.
# The right subtree is traversed, recursively, until a NullNode is found.
#
# @param rnode subtree root.
# @param center calculated rnode position.
# @param ht rnode height.
# @return maximum node coordinate in the x axis.
#
def getXmax(rnode, center, ht):
    if rnode.right is NullNode:
        return center.x

    d = WorldPoint(-HDSP(ht - 1), vdsp)
    return getXmax(rnode.right, center - d, ht - 1)

# ==================== locateNode ==============================================#

## returns a node close to a given point.
# The tree is traversed in preorder, recursively, until a node is found, or
# NullNode is returned, if the given point is not close to any node.
#
# @param rnode a node to start the search.
# @param center position of rnode.
# @param ht height of rnode.
# @param pos given point.
# @return a node close to the given point, or NullNode.
#
def locateNode(rnode, center, ht, pos):
    if pos == center:           # visit the root
        return rnode
    if (rnode.left != NullNode):
        d = WorldPoint(HDSP(ht - 1), vdsp)
        node = locateNode(rnode.left, center - d, ht - 1, pos)
        if (node != NullNode):
            return node

    if (rnode.right != NullNode):
        d = WorldPoint(-HDSP(ht - 1), vdsp)
        node = locateNode(rnode.right, center - d, ht - 1, pos)
        if (node != NullNode):
            return node

    return NullNode


# ==================== drawTree ================================================#

## draws a tree recursively.
#
# @param rnode root node.
# @param center rnode position.
# @param ht rnode height.
#
def drawTree(rnode, center, ht):
    pts = [center.copy(), center.copy()]

    if (rnode.left == NullNode and rnode.right == NullNode):
        glColor3d(*ORANGE)                  # leaf node
        if mapwv.aspect < 1:
            pts[0].y -= radius / mapwv.aspect + 1.5 * space
        else:
            pts[0].y -= radius + 1.5 * space
    else:
        glColor3d(*DARKGRAY)
        if mapwv.aspect > 1:
            pts[0].x += radius * mapwv.aspect + space * 0.5
        else:
            pts[0].x += radius + space * 0.5

    circ(center, radius)
    text(pts[0], str(rnode.data))

    if (rnode.left != NullNode):
        d = WorldPoint(HDSP(ht - 1), vdsp)
        pts[0] = center - d
        pldraw(2, pts)
        drawTree(rnode.left, pts[0], ht - 1)

    if (rnode.right != NullNode):
        d = WorldPoint(-HDSP(ht - 1), vdsp)
        pts[0] = center - d
        pldraw(2, pts)
        drawTree(rnode.right, pts[0], ht - 1)


#=========================  info  ==============================================#

## prints information about a node close to (x,y).
def info(x, y):
    height = Stree.height()
    height += 1
    pt = mapwv.toWorldCoordinates(x, y)
    node = locateNode(Stree.root(), getCenter(), height, pt)

    if (node != NullNode):
        nd = Stree.findEntry(node.data)
        if (nd != NullNode):
            print("%r, Height: %d" % (nd, Stree.getHeight(node)))


#=========================  deleteNode  ========================================#

## deletes a node close to (x,y).
def deleteNode(x, y):
    height = Stree.height()
    height += 1
    pt = mapwv.toWorldCoordinates(x, y)
    node = locateNode(Stree.root(), getCenter(), height, pt)

    if (node != NullNode):
        Stree.remove(node.data)
        redraw()


# ==================== addNodes ================================================#

## adds nodes to the tree.
#
# @param lst a list of node data.
#
def addNodes(lst):
    if type(lst) == list or type(lst) == tuple:
        for n in lst:
            if not Stree.add(n):
                print("Duplicate : %d" % n)
    else:
        if not Stree.add(lst):
            print("Duplicate : %d" % lst)


# ==================== createTree ==============================================#

## creates an initial tree.
#
# @param type tree type: 0 BSTSet, 1: ORDERED
# @param nNodes number of random nodes.
# @param data a list of nodes to be inserted into the tree, or None,
#        for generating nNodes random nodes.
# @return type name of the created tree.
#
def createTree(type, nNodes, data=None):
    global Stree
    # holds the type of the search tree.
    sname = "BSTSet" if type == 0 else "ORDERED"
    Stree = BSTSet(type == 0)

    if (nNodes < 0):              # type nodes on keyboard
        while True:
            try:
                n = int(input("Enter a node: "))
            except (ValueError, SyntaxError) as e:
                break
            addNodes(n)
    elif (data != None):          # a node data file
        addNodes(data)
    else:
        for i in range(nNodes):   # generate random nodes
            n = randint(1, 3 * nNodes)
            addNodes(n)

    glutSetWindowTitle(sname)
    return sname


# ==================== printTree ===============================================#

## prints the tree on the screen.
def printTree():
    print(Stree)
    for n in Stree:
        print("%s, " % n, end="")
    print("\b\b \n")
    sys.stdout.flush()


# ==================== displayTree =============================================#

## displays a tree.
def displayTree():
    global hdsp, vdsp

    if Stree.root() is NullNode:
        return
    glMatrixMode(GL_PROJECTION)
    glLoadIdentity()
    height = Stree.height()
    # number of leaves in a full binary tree
    nnode = 2**height
    height += 1

    dx = 4 * radius + space
    nnode *= dx
    p1 = WorldPoint(0.0, 0.0)
    p2 = WorldPoint(nnode, nnode)

    vdsp = 3 * dx
    hdsp = dx

    # root position.
    getCenter.ct.position = (p2.x * 0.5, p2.y - dx)

    xmin = getXmin(Stree.root(), getCenter(), height)
    xmax = getXmax(Stree.root(), getCenter(), height)

    p1.position = (xmin - dx, p2.y - vdsp * height)
    p2.position = (xmax + dx, p2.y)
    gluOrtho2D(p1.x, p2.x, p1.y, p2.y)

    mapwv.window = (p1.x, p1.y, p2.x, p2.y)
    drawTree(Stree.root(), getCenter(), height)


#=========================  getCenter  =========================================#

## return a copy of the root position.
def getCenter():
    return getCenter.ct.copy()


## ::Stree root position.
getCenter.ct = WorldPoint()

#=========================  init  ==============================================#

## initializes graphical global variables.
def init():
    global mapwv

    mapwv = mapper((0, 0, 1, 1), (0, 0, 1024, 512))
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGBA)
    glutInitWindowPosition(0, 0)
    glutInitWindowSize(*mapwv.viewport)
    glutCreateWindow("")
    glPointSize(7)
    glEnable(GL_POINT_SMOOTH)
    glClearColor(*BACKGROUND)


#=========================  redraw  ============================================#

## cleans the screen and redraws the picture.
def redraw():
    glClear(GL_COLOR_BUFFER_BIT)
    displayTree()
    glutSwapBuffers()


#=========================  readFile  ==========================================#

## read type and nodes from a file.
#
# @param fname file name.
# @return list of nodes, tree type and number of nodes.
#
def readFile(fname):
    str_type = ""
    type = 0
    nNodes = 0
    ndata = None
    try:
        fptr = open(fname, "r")
    except IOError:
        print("File '%s' does not exist.\n" % fname)
        sys.exit(-1)

    line = fptr.readline().split()
    if len(line) == 2 and line[1].isdigit():
        str_type = line[0]
        nNodes = int(line[1])
    else:
        print("Invalid file '%s' content.\n" % fname)
        sys.exit(-1)

    type = getType(str_type)
    if (type < 0):
        print("Invalid tree type: %s\n" % str_type)
        sys.exit(-1)

    ndata = []
    for line in fptr:
        try:
            ndata += list(map(int, line.split()))  # transform to integers
        except:
            print("Invalid file '%s' content.\n" % fname)
            sys.exit(-1)
    fptr.close()
    return ndata, type, nNodes


#=========================  readType  ==========================================#

## reads the type and number of nodes from stdin.
#
# @return tree type and number of nodes.
#
def readType():
    str_type = ""
    type = 0
    nNodes = 0
    input_buffer = input("\nUsage: StreeGL [tree type] [#nodes] \
                           \n      `tree_type\': BSTSet ORDERED \
                           \n\n\nEnter tree type and number of nodes: ")
    input_buffer = input_buffer.split()
    if len(input_buffer) > 1 and input_buffer[1].isdigit():
        str_type = input_buffer[0]
        nNodes = int(input_buffer[1])
    type = getType(str_type)
    if (type < 0):
        print("Invalid tree type: %s\n" % str_type)
        sys.exit(-1)
    return type, nNodes


#=========================  keyboardHandler  ===================================#

## handles callbacks generated by keyboard events.
def keyboardHandler(key, x, y):
    global Stree
    if key == b'h':
        printHelp()
    elif key == b'?':
        printData()
    elif key == b'd':
        deleteData()
    elif key == b'i':
        insertData()
    elif key == b'c':
        Stree = NullNode
        type, nodes = readType()
        createTree(type, nodes)
        redraw()
    elif key == b'R':
        Stree.rebalance(Stree.root())
        redraw()
    elif key == b'r':
        arr = generateRandomArray(15, 500)
        addNodes(arr)
        redraw()
    elif key == b'q':
        Stree = NullNode
        glutLeaveMainLoop()
        return
        # Exception ignored on calling ctypes callback functio
        sys.exit(0)  # <-- python 3.8


#=========================  mouseHandler  ======================================#

## handles callbacks generated by mouse events.
def mouseHandler(button, state, x, y):

    if button == GLUT_LEFT_BUTTON:
        if (state == GLUT_DOWN):
            deleteNode(x, y)
    elif button == GLUT_MIDDLE_BUTTON:
        if (state == GLUT_DOWN):
            printTree()
    elif button == GLUT_RIGHT_BUTTON:
        if (state == GLUT_DOWN):
            info(x, y)


#=========================  getType  ===========================================#

## Return the code of a certain type of tree.
#
# @param tname name of a search tree.
# @return an integer greater than 0, or -1 if for an invalid type.
#
def getType(tname):
    type = -1
    if (tname == "BSTSet" or tname == "bstset"):
        type = 0
    elif (tname == "ORDERED" or tname == "ordered"):
        type = 1
    return type


#=========================  main  ==============================================#

## main program. Starts the interaction loop.
#
# @param argv command line arguments
#      - argv[0]: name of the program
#      - argv[1] and argv[2]
#        - tree type and number of nodes
#      - argv[1]:
#        - name of a two line file containing: type, number of nodes, and node data
#          - bstset 11
#          - 5 20 2 1 7 30 25 4 9 10 11
#      - argv[1]:
#        - number of nodes.
#
def main(argv=None):
    if argv is None:
        argv = sys.argv
    glutInit(argv)

    type = 0
    nNodes = 0
    ndata = None
    if (len(argv) == 2):                                # one argument
        if argv[1].isdigit():
            nNodes = int(argv[1])                       # a number
        else:
            ndata, type, nNodes = readFile(argv[1])     # a file
    elif (len(argv) > 2 and argv[2].isdigit()):         # two arguments
        type = getType(argv[1])
        if (type < 0):
            print("Invalid tree type: %s\n" % argv[1])
            sys.exit(-1)
        nNodes = int(argv[2])
    else:                                               # no arguments
        type, nNodes = readType()

    init()
    createTree(type, nNodes, ndata)

    glutMouseFunc(mouseHandler)
    glutKeyboardFunc(keyboardHandler)
    glutDisplayFunc(redraw)
    glutReshapeFunc(reshape)

    glutMainLoop()


if __name__ == "__main__":
    sys.exit(main())
