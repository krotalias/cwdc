#!/usr/bin/env python
# coding: UTF-8
#
## @package _12a_poly
#
#  Draws a 3D polyhedron and allows a user to rotate it
#  (mouse left button and wheel).
#
#  The polyhedron is represented by a 3 x number_of_vertices matrix.
#  Each column represents a 3D vertex.
#
#  note: a m x n matrix is represented by a list of lines:
#     [[l_1] [l_2] .. [l_m]].
#  m = len(mat), n = len(mat[0]), mat(i,j) = mat[i][j]
#
#  @author Paulo Roma
#  @since 11/06/2019
#  @see http://www.orimosenzon.com/wiki/index.php/Python_samples
#  @see http://mathworld.wolfram.com/RotationMatrix.html
#  @see https://code.activestate.com/recipes/578876-rotatable-tetrahedron/

import sys
try:
    from tkinter import *     # python 3
except ImportError:
    from Tkinter import *     # python 2
from math import pi, copysign, sin, cos
from mapper2 import mapper2 as mapper
from math import sqrt

## Return m1 x m2 (m1 multiplied by m2).
def matMul(m1, m2): return [
    [sum(i * j for i, j in zip(row, col)) for col in zip(*m2)] for row in m1]


## Return vector v2 - v1.
def vecSub(v1, v2): return [(i - j) for i, j in zip(v2, v1)]

## Return vector v2 + v1.
def vecAdd(v1, v2): return [(i + j) for i, j in zip(v2, v1)]

## Return vector v * s.
def vecScale(v, s): return [i * s for i in v]


## Length of vector from point p = (x1,y1,...,x1n) to q = (x,y,...,xn).
def veclen(p, q): return sqrt(sum([(u - v)**2 for u, v in zip(p, q)]))

## Normalize a vector.
def normalize(p): return [float(i) / veclen([0] * len(p), p) for i in p]

## Transpose a matrix.
def transpose(M): return list(zip(*M))


## Bounding Box of a polyhedron.
def bbox(p): return [(min(i), max(i)) for i in p]


## Translate a polyhedron.
#
#  @param poly polyhedron.
#  @param t translation vector.
#
def translate(poly, t): return transpose([vecSub(t, p) for p in zip(*poly)])

## Centroid of a convex face.
def centroid(vtx): return [sum(v) / float(len(vtx)) for v in zip(*vtx)]

## Return cross product U x V.
def crossProd(U, V): return (
    U[1] * V[2] - U[2] * V[1], U[2] * V[0] - U[0] * V[2], U[0] * V[1] - U[1] * V[0])


## Return the dot product of two vectors.
def dotProd(u, v): return sum([u * v for u, v in zip(u, v)])

## Face normal vector.
def getNormal2(p): return crossProd(vecSub(p[0], p[1]), vecSub(p[0], p[2]))

## counter-clockwise rotation about the X axis
def ROT_X(x): return [[1, 0, 0],
                      [0, cos(x), -sin(x)],
                      [0, sin(x), cos(x)]]


## counter-clockwise rotation about the Y axis
def ROT_Y(y): return [[cos(y), 0, sin(y)],
                      [0, 1, 0],
                      [-sin(y), 0, cos(y)]]

## counter-clockwise rotation about the Z axis
def ROT_Z(z): return [[cos(z), -sin(z), 0],
                      [sin(z), cos(z), 0],
                      [0, 0, 1]]

## angular displacement as a function of a number of pixels.
def EPS(d): return d * pi / (0.75 * height)


## angular displacement as a function of the sign of a number of pixels.
def eps(d): return EPS(copysign(1, d))

## Polygon normal by Newell's method.
#
#  @param poly a polygon vertex list.
#  @return face normal vector.
#  @see https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
#
def getNormal(poly):

    n = [0] * len(poly[0])

    for i, v_curr in enumerate(poly):
        v_next = poly[(i + 1) % len(poly)]
        vs = vecSub(v_next, v_curr)
        va = vecAdd(v_curr, v_next)
        n[0] += vs[1] * va[2]
        n[1] += vs[2] * va[0]
        n[2] += vs[0] * va[1]

    return n

## Draw coordinate axes.
def drawAxes():
    origin = [0, 0, 0]
    a = transpose(axes)
    p = map.windowToViewport(origin, a[0])
    canvas.create_line(*p, fill='red', width=2)
    p = map.windowToViewport(origin, a[1])
    canvas.create_line(*p, fill='green', width=2)
    p = map.windowToViewport(origin, a[2])
    canvas.create_line(*p, fill='blue', width=2)

## Make a bounding box.
#
#  @param box lower left and upper right corners of the bounding box.
#  @return a 3 x 8 matrix with the eight vertices of the bounding box.
#
def makeBox(box):
    #          xmin, ymin,           xmax, ymin,           xmax, ymax            xmin, ymax
    b = [[box[0][0], box[1][0], box[1][0], box[0][0], box[0][0], box[1][0], box[1][0], box[0][0]],
         [box[0][1], box[0][1], box[1][1], box[1][1],
             box[0][1], box[0][1], box[1][1], box[1][1]],
         [box[0][2], box[0][2], box[0][2], box[0][2], box[1][2], box[1][2], box[1][2], box[1][2]]]

    return b

## Draw the current polygon bounding box.
def drawBbox():
    bcolor = 'grey'
    b = map.windowToViewport(*transpose(pbox))
    canvas.create_polygon(b[0], b[1], b[2], b[3],
                          outline=bcolor, fill='')   # front
    canvas.create_polygon(b[4], b[5], b[6], b[7],
                          outline=bcolor, fill='')   # back
    canvas.create_polygon(b[1], b[5], b[6], b[2],
                          outline=bcolor, fill='')   # right
    #canvas.create_polygon(b[2], b[6], b[7], b[3], outline=bcolor, fill='')  # top
    canvas.create_polygon(b[0], b[4], b[7], b[3],
                          outline=bcolor, fill='')   # left
    #canvas.create_polygon(b[1], b[5], b[4], b[0], outline=bcolor, fill='')  # bottom

##  Draw a polyhedron.
#   Not all faces are visible at the same time.
#   Use back face culling to eliminate invisible faces
#   from camera point of view.
#
#   @param obj vertex coordinate matrix.
#   @param col color of the edges.
#
def DrawObj(obj, col):
    """Draw a polyhedron."""

    canvas.delete(ALL)  # delete all edges
    nv = len(obj[0])    # number of vertices in obj

    if __debug:
        drawAxes()
        drawBbox()

    p = transpose(obj)  # transpose obj
    C = centroid(p)    # centroid of the polyhedron
    if outline:
        # plot the centroid
        c = map.windowToViewport(C)
        canvas.create_oval(c, c, width=5, outline='red')
        # draw the edges of the polyhedron
        for p1 in range(nv):
            for p2 in range(p1 + 1, nv):
                pc = map.windowToViewport(p[p1], p[p2])
                canvas.create_line(pc, fill=col)
    else:
        # draw the faces of the polyhedron
        pc = map.windowToViewport(*p)

        for f in faces:
            lp = [p[i] for i in f[:-1]]
            lpc = [pc[i] for i in f[:-1]]
            drawFace(lp, lpc, C, f[-1], col)

## Return a line corresponding to a face normal.
#
#  The circulation of the face in relation to the centroid of the polyhedron
#  is used to figure out the normal direction. Therefore, even if faces are
#  not consistently oriented, the normal will be right.
#
#  @param p face vertex list.
#  @param C centroid of the polyhedron.
#  @param col normal vector color.
#  @return normal line in screen coordinates and Z component of the normal for culling.
#
def getNormalLine(p, C, col):
    N = getNormal(p)
    n = normalize(N)
    nlen = (window[3] - window[1]) / 15  # or 200.0/height
    n = vecScale(n, nlen)
    c1 = centroid(p)

    # dot product between the normal vector and the
    # vector connecting the face centroid to the polyhedron centroid.
    tp = dotProd(N, vecSub(c1, C))

    if tp > 0:
        n = vecScale(n, -1)
    c2 = vecAdd(c1, n)

    nv = map.windowToViewport(c1, c2)

    return nv, n[2]

## Draw a face of the polyhedron, if it is visible.
#
#  @param p world coordinate points.
#  @param pc screen coordinate points.
#  @param cent centroid of the polyhedron.
#  @param col1 fill color.
#  @param col outline color.
#  @see https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
def drawFace(p, pc, cent, col1, col):
    """Draw a face of the polyhedron."""

    nv, nz = getNormalLine(p, cent, col)

    # back face culling.
    if nz > 0:
        canvas.create_polygon(*pc, fill=col1, outline=col, width=3)
        if faceNormal:
            canvas.create_line(*nv, fill=col, width=2, arrow='last')

def init():
    """Initialize global variables."""

    global ROT_X, ROT_Y, ROT_Z
    global eps, EPS, window, width, height, __debug
    global vertices, faces, olist, cobj, axe
    global lastX, lastY, objColor, bgColor, outline, faceNormal

    # axes
    axe = [[3, 0, 0],
           [0, 3, 0],
           [0, 0, 3]]

    # tetrahedron vertex matrix
    tet = [[-1, 1, 1, -1],
           [-1, 1, -1, 1],
           [-1, -1, 1, 1]]

    # cube vertex matrix
    cube = [[-1, -1, 1, 1, -1, -1, 1, 1],
            [-1, 1, 1, -1, -1, 1, 1, -1],
            [0, 0, 0, 0, 2, 2, 2, 2]]

    # octahedron vertex matrix
    oct = [[1, 0, -1, 0, 0, 0],
           [0, -1, 0, 1, 0, 0],
           [0, 0, 0, 0, 1, -1]]

    # icosahedron vertex matrix
    ico = [[0, 0.850651, 0.850651, -0.850651, -0.850651, -0.525731, 0.525731, 0.525731, -0.525731, 0, 0, 0],
           [-0.525731, 0, 0, 0, 0, 0.850651, 0.850651, -
               0.850651, -0.850651, -0.525731, 0.525731, 0.525731],
           [0.850651, 0.525731, -0.525731, -0.525731, 0.525731, 0, 0, 0, 0, -0.850651, -0.850651, 0.850651]]

    # dodecahedron vertex matrix
    dod = [[-0.356822, 0.356822, 0.57735, 0, -0.57735, -0.57735, 0, 0.57735, 0.934172, 0.934172,
            0, 0.57735, 0.57735, 0, -0.57735, -0.356822, 0.356822, -0.934172, -0.934172, -0.57735],

           [0, 0, 0.57735, 0.934172, 0.57735, -0.57735, -0.934172, -0.57735, -0.356822, 0.356822,
            -0.934172, -0.57735, 0.57735, 0.934172, -0.57735, 0, 0, -0.356822, 0.356822, 0.57735],

           [0.934172, 0.934172, 0.57735, 0.356822, 0.57735, 0.57735, 0.356822, 0.57735, 0, 0,
            -0.356822, -0.57735, -0.57735, -0.356822, -0.57735, -0.934172, -0.934172, 0, 0, -0.57735]]

    # tetrahedron face list
    tfaces = [[0, 1, 2, 'red'],
              [0, 2, 3, 'green'],
              [0, 3, 1, 'blue'],
              [2, 1, 3, 'yellow']]

    # cube face list
    cfaces = [[3, 2, 1, 0, 'grey'],
              #[4,5,6,7, 'blue'], # the order may be inconsistent
              [7, 6, 5, 4, 'blue'],  # it does not matter at all
              [2, 6, 5, 1, 'green'],
              [0, 4, 7, 3, 'yellow'],
              [7, 6, 2, 3, 'red'],
              [1, 5, 4, 0, 'purple']]

    # octahedron face list
    ofaces = [[4, 0, 1, 'red'],
              [4, 1, 2, 'green'],
              [4, 2, 3, 'blue'],
              [4, 3, 0, 'yellow'],
              [5, 1, 0, 'grey'],
              [5, 2, 1, 'purple'],
              [5, 3, 2, 'cyan'],
              [5, 0, 3, 'pink']]

    # dodecahedron face list
    dfaces = [[19, 18, 4, 3, 13, 'red'],
              [19, 13, 12, 16, 15, 'green'],
              [11, 16, 12, 9, 8, 'blue'],
              [5, 0, 4, 18, 17, 'yellow'],
              [14, 10, 6, 5, 17, 'grey'],
              [14, 17, 18, 19, 15, 'purple'],
              [14, 15, 16, 11, 10, 'cyan'],
              [12, 13, 3, 2, 9, 'pink'],
              [8, 7, 6, 10, 11, 'magenta'],
              [1, 7, 8, 9, 2, 'orange'],
              [1, 0, 5, 6, 7, 'tomato'],
              [0, 1, 2, 3, 4, 'violet']]

    # icosahedron face list
    ifaces = [[1, 2, 6, 'red'],
              [1, 7, 2, 'green'],
              [3, 4, 5, 'blue'],
              [4, 3, 8, 'yellow'],
              [6, 5, 11, 'grey'],
              [5, 6, 10, 'purple'],
              [9, 10, 2, 'cyan'],
              [10, 9, 3, 'pink'],
              [7, 8, 9, 'magenta'],
              [8, 7, 0, 'orange'],
              [11, 0, 1, 'tomato'],
              [0, 11, 4, 'violet'],
              [6, 2, 10, 'goldenrod'],
              [1, 6, 11, 'plum4'],
              [3, 5, 10, 'LightPink2'],
              [5, 4, 11, 'seashell2'],
              [2, 7, 9, 'sienna3'],
              [7, 1, 0, 'IndianRed3'],
              [3, 9, 8, 'light salmon'],
              [4, 8, 0, 'saddle brown']]

    # object list
    olist = ((cube, cfaces, 'Hexahedron'), (tet, tfaces, 'Tetrahedron'), (oct, ofaces,
             'Octahedron'), (dod, dfaces, 'Dodecahedron'), (ico, ifaces, 'Icosahedron'))
    # current object index
    cobj = 0

    # debugging state
    __debug = False

    # world coordinate space for defining polyhedron
    window = [-3, -3, 3, 3]
    # current viewport width
    width = 400
    # current viewport height
    height = 400

    # initialize cfaces and vertices
    toggleObj(0)
    # current object face set
    #faces = cfaces
    # current object vertex set
    #vertices = cube

    # whether to draw a wire or solid polyhedron
    outline = False
    faceNormal = False

    lastX = 0
    lastY = 0
    objColor = 'black'
    bgColor = 'light yellow'

def cbClicked(event):
    """Save current mouse position."""

    global lastX, lastY

    x = event.x
    y = height - event.y  # Y coordinate is upside down

    lastX = x
    lastY = y

    if __debug:
        p = map.viewportToWindow(x, y)
        pc = map.windowToViewport(p)
        print("WC = (%.2f,%.2f) \t (x,y) = (%d,%d) \t SC = (%d,%d)" %
              (p[0], p[1], event.x, event.y, pc[0][0], pc[0][1]))

def cbMotion(event):
    """Map mouse displacements in Y direction to rotations about X axis,
       and mouse displacements in X direction to rotations about Y axis."""

    global vertices, axes, pbox
    global lastX, lastY

    x = event.x
    y = height - event.y  # Y coordinate is upside down

    dx = -(y - lastY)
    dy = (x - lastX)
    if __debug:
        print("dx = %d, dy = %d" % (dx, dy))

    vertices = matMul(ROT_X(EPS(dx)), vertices)
    vertices = matMul(ROT_Y(EPS(dy)), vertices)
    axes = matMul(ROT_X(EPS(dx)), axes)
    axes = matMul(ROT_Y(EPS(dy)), axes)
    pbox = matMul(ROT_X(EPS(dx)), pbox)
    pbox = matMul(ROT_Y(EPS(dy)), pbox)

    DrawObj(vertices, objColor)
    cbClicked(event)

def wheelUp(event):
    """Map mouse wheel up displacements to rotations about Z axis."""

    global vertices
    vertices = matMul(ROT_Z(EPS(1)), vertices)
    DrawObj(vertices, objColor)

def wheelDown(event):
    """Map mouse wheel down displacements to rotations about Z axis."""

    global vertices
    vertices = matMul(ROT_Z(EPS(-1)), vertices)
    DrawObj(vertices, objColor)

def wheel(event):
    """Map mouse wheel displacements to rotations about Z axis."""

    global vertices
    vertices = matMul(ROT_Z(EPS(event.delta / 120)), vertices)
    DrawObj(vertices, objColor)

def resize(event):
    """Redraw the polyhedron, in case of a window change due to user resizing it."""

    global map, width, height
    width = canvas.winfo_width()
    height = canvas.winfo_height()

    # keep aspect ratio to avoid distortions
    box = window[:]
    aspect = float(width) / float(height)
    dbx = box[2] - box[0]
    dby = box[3] - box[1]
    if aspect > 1.0:
        w = dbx * aspect
        box[0] -= (w - dbx) * 0.5
        box[2] = box[0] + w
    else:
        h = dby / aspect
        box[1] -= (h - dby) * 0.5
        box[3] = box[1] + h

    map = mapper(box, [0, 0, width, height])
    DrawObj(vertices, objColor)

def toggleFill(event):
    """Toggle outline mode."""

    global outline
    outline = not outline
    DrawObj(vertices, objColor)

def toggleNormal(event):
    """Toggle normal mode."""

    global faceNormal
    faceNormal = not faceNormal
    DrawObj(vertices, objColor)

def toggleObj(event):
    """Toggle displayed object."""

    global cobj, vertices, faces, axes, window, pbox
    cobj = event if isinstance(event, int) else (cobj + 1) % len(olist)
    vertices = olist[cobj][0]
    # we want to rotate about the centroid
    c = centroid(transpose(vertices))
    vertices = translate(vertices, c)
    b = transpose(bbox(vertices))
    pbox = makeBox(b)
    scale = 1.8  # sqrt(3) = 1.732 is the unit cube diagonal
    window = vecScale(b[0][:2], scale) + vecScale(b[1][:2], scale)
    if __debug:
        print(b)
    faces = olist[cobj][1]
    axes = axe
    root.title(olist[cobj][2])
    if not isinstance(event, int):
        resize(event)

def toggleDebug(event):
    """Toggle debugging mode."""

    global __debug
    __debug = not __debug

def help(event):
    """Usage instructions."""

    print("")
    print("Press 'd' for turning debugging on or off.")
    print("Press 'i' for setting a wire or solid polyhedron.")
    print("Press 'h' for getting help.")
    print("Press 's' for switching polyhedron.")
    print("Press 'esc' for exiting.")

def exit(event):
    """Finishes this program."""

    sys.exit()

def main():
    global canvas, map, root
    root = Tk()
    root.geometry('+200+200')

    init()
    root.title(olist[cobj][2])

    map = mapper(window, [0, 0, width, height])

    canvas = Canvas(root, width=width, height=height, background=bgColor)
    canvas.pack(fill=BOTH, expand=YES)
    canvas.bind("<Button-1>", cbClicked)
    canvas.bind("<B1-Motion>", cbMotion)
    canvas.bind("<Configure>", resize)
    root.bind("<KeyPress-i>", toggleFill)
    root.bind("<KeyPress-n>", toggleNormal)
    root.bind("<KeyPress-s>", toggleObj)
    root.bind("<KeyPress-h>", help)
    root.bind("<Escape>", exit)
    root.bind("<KeyPress-d>", toggleDebug)

    from platform import uname
    os = uname()[0]
    if (os == "Linux"):
        canvas.bind('<Button-4>', wheelUp)      # X11
        canvas.bind('<Button-5>', wheelDown)
    elif (os == "Darwin"):
        canvas.bind('<MouseWheel>', wheel)      # MacOS
    else:
        canvas.bind_all('<MouseWheel>', wheel)  # windows

    DrawObj(vertices, objColor)

    mainloop()


if __name__ == '__main__':
    sys.exit(main())
