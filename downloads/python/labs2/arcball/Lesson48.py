#!/usr/bin/env python
#
##  @package Lesson48
#
#  Draw function for Lesson 48.
#
## http://pydoc.net/Python/PyOpenGL-Demo/3.0.1b1/PyOpenGL-Demo.NeHe.lesson48.Lesson48/

from OpenGL.GL import *
from OpenGL.GLUT import *
from OpenGL.GLU import *
import sys
import copy
from math import cos, sin

# ArcBallT and this tutorials set of points/vectors/matrix types
from ArcBall import *

PI2 = 2.0 * 3.1415926535  # 2 * PI (not squared!)

# *********************** Globals ***********************

g_Transform = Matrix4fT()
g_LastRot = Matrix3fT()
g_ThisRot = Matrix3fT()

g_ArcBall = ArcBallT(640, 480)
g_isDragging = False
g_quadratic = None


# A general OpenGL initialization function.  Sets all of the initial parameters.
# We call this right after our OpenGL window is created.
def Initialize(Width, Height):
    global g_quadratic

    # This Will Clear The Background Color To Black
    glClearColor(0.0, 0.0, 0.0, 1.0)
    glClearDepth(1.0)						# Enables Clearing Of The Depth Buffer
    glDepthFunc(GL_LEQUAL)					# The Type Of Depth Test To Do
    glEnable(GL_DEPTH_TEST)					# Enables Depth Testing
    # Select Flat Shading (Nice Definition Of Objects)
    glShadeModel(GL_FLAT)
    # Really Nice Perspective Calculations
    glHint(GL_PERSPECTIVE_CORRECTION_HINT, GL_NICEST)

    g_quadratic = gluNewQuadric()
    gluQuadricNormals(g_quadratic, GLU_SMOOTH)
    gluQuadricDrawStyle(g_quadratic, GLU_FILL)
    # Why? this tutorial never maps any textures?! ?
    # gluQuadricTexture(g_quadratic, GL_TRUE)		# Create Texture Coords

    glEnable(GL_LIGHT0)
    glEnable(GL_LIGHTING)

    glEnable(GL_COLOR_MATERIAL)

    return True


def Upon_Drag(cursor_x, cursor_y):
    """ Mouse cursor is moving
            Glut calls this function (when mouse button is down)
            and pases the mouse cursor postion in window coords as the mouse moves.
    """
    global g_isDragging, g_LastRot, g_Transform, g_ThisRot

    if (g_isDragging):
        mouse_pt = Point2fT(cursor_x, cursor_y)
        # Update End Vector And Get Rotation As Quaternion
        ThisQuat = g_ArcBall.drag(mouse_pt)
        # Convert Quaternion Into Matrix3fT
        g_ThisRot = Matrix3fSetRotationFromQuat4f(ThisQuat)
        # Use correct Linear Algebra matrix multiplication C = A * B
        # Accumulate Last Rotation Into This One
        g_ThisRot = Matrix3fMulMatrix3f(g_LastRot, g_ThisRot)
        # Set Our Final Transform's Rotation From This One
        g_Transform = Matrix4fSetRotationFromMatrix3f(g_Transform, g_ThisRot)
    return

def Upon_Click(button, button_state, cursor_x, cursor_y):
    """ Mouse button clicked.
            Glut calls this function when a mouse button is
            clicked or released.
    """
    global g_isDragging, g_LastRot, g_Transform, g_ThisRot

    g_isDragging = False
    if (button == GLUT_RIGHT_BUTTON and button_state == GLUT_UP):
        # Right button click
        g_LastRot = Matrix3fSetIdentity()				# Reset Rotation
        g_ThisRot = Matrix3fSetIdentity()				# Reset Rotation
        g_Transform = Matrix4fSetRotationFromMatrix3f(
            g_Transform, g_ThisRot)  # Reset Rotation
    elif (button == GLUT_LEFT_BUTTON and button_state == GLUT_UP):	  # Left button released
        # Set Last Static Rotation To Last Dynamic One
        g_LastRot = copy.copy(g_ThisRot)
    elif (button == GLUT_LEFT_BUTTON and button_state == GLUT_DOWN):  # Left button clicked down
        # Set Last Static Rotation To Last Dynamic One
        g_LastRot = copy.copy(g_ThisRot)
        g_isDragging = True								# Prepare For Dragging
        mouse_pt = Point2fT(cursor_x, cursor_y)
        # Update Start Vector And Prepare For Dragging
        g_ArcBall.click(mouse_pt)

    return


def Torus(MinorRadius, MajorRadius):
    # Draw A Torus With Normals
    glBegin(GL_TRIANGLE_STRIP)			# Start A Triangle Strip
    for i in range(20): 				# Stacks
        for j in range(-1, 20):			# Slices
            # NOTE, python's definition of modulus for negative numbers returns
            # results different than C's
            #       (a / d)*d  +  a % d = a
            if (j < 0):
                wrapFrac = (-j % 20) / 20.0
                wrapFrac *= -1.0
            else:
                wrapFrac = (j % 20) / 20.0
            phi = PI2 * wrapFrac
            sinphi = sin(phi)
            cosphi = cos(phi)

            r = MajorRadius + MinorRadius * cosphi

            glNormal3f(sin(PI2 * (i % 20 + wrapFrac) / 20.0) * cosphi,
                       sinphi, cos(PI2 * (i % 20 + wrapFrac) / 20.0) * cosphi)
            glVertex3f(sin(PI2 * (i % 20 + wrapFrac) / 20.0) * r,
                       MinorRadius * sinphi, cos(PI2 * (i % 20 + wrapFrac) / 20.0) * r)

            glNormal3f(sin(PI2 * (i + 1 % 20 + wrapFrac) / 20.0) * cosphi,
                       sinphi, cos(PI2 * (i + 1 % 20 + wrapFrac) / 20.0) * cosphi)
            glVertex3f(sin(PI2 * (i + 1 % 20 + wrapFrac) / 20.0) * r,
                       MinorRadius * sinphi, cos(PI2 * (i + 1 % 20 + wrapFrac) / 20.0) * r)
    glEnd()					# Done Torus
    return

def Draw():
    # Clear Screen And Depth Buffer
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
    glLoadIdentity()				# Reset The Current Modelview Matrix
    # Move Left 1.5 Units And Into The Screen 6.0
    glTranslatef(-1.5, 0.0, -6.0)

    glPushMatrix()					# NEW: Prepare Dynamic Transform
    glMultMatrixf(g_Transform)		# NEW: Apply Dynamic Transform
    glColor3f(0.75, 0.75, 1.0)
    Torus(0.30, 1.00)
    glPopMatrix()					# NEW: Unapply Dynamic Transform

    glLoadIdentity()				# Reset The Current Modelview Matrix
    # Move Right 1.5 Units And Into The Screen 7.0
    glTranslatef(1.5, 0.0, -6.0)

    glPushMatrix()					# NEW: Prepare Dynamic Transform
    glMultMatrixf(g_Transform)		# NEW: Apply Dynamic Transform
    glColor3f(1.0, 0.75, 0.75)
    gluSphere(g_quadratic, 1.3, 20, 20)
    glPopMatrix()					# NEW: Unapply Dynamic Transform

    glFlush()					    # Flush The GL Rendering Pipeline
    glutSwapBuffers()
    return
