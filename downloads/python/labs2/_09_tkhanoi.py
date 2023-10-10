#!/usr/bin/env python
#
## @package _09_tkhanoi
#
# Towers of Hanoi, Python/Tk style.
#
# @author Paulo Roma
# @since 2009/08/08

import time, sys
try:
   from Tkinter import *
   from Tkinter import HORIZONTAL
   import Dialog
except ImportError:
   from tkinter import *
   from tkinter import HORIZONTAL
   import tkinter.dialog as Dialog
try:
   from Getch import getch
except ImportError:
   sys.exit ( "There is no Getch module available. Download it!" )

colors       = []         # list of graduated ring colors
fly_y        = 32         # canvas Y-coord along which rings fly
max_rings    = 24         # be nice and keep colors count-consistent
num_moves    = 0          # total ring moves
pole         = {}         # tracks pole X-coord and ring count
ring         = {}         # tracks ring canvas ID, width and pole
ring_base    = 0          # canvas Y-coord of base of ring pile
ring_spacing = 0          # pixels between adjacent rings
stopped      = False      # True if simulation is stopped
single_move  = False      # runs step by step
velocity     = 0          # delta pixel move while flying the rings

mw = Tk()
mw.geometry('+0+0')
canvas = Canvas()         # the Hanoi playing field

def do_hanoi (n):
    """ Initialize for a new simulation.
        n: number of rings
    """

    global stopped, num_moves
    global ring_base, ring_spacing
    global colors

    if not stopped: return
    
    stopped = False           # start ...
    num_moves = 0             # ... new simulation

    ring_height = 26
    ring_spacing = 0.67 * ring_height

    ring_width = 96 + n * 12

    canvas_width = 3 * ring_width + 4 * 12
    canvas_height = ring_spacing * n + fly_y + 2 * ring_height

    ring_base = canvas_height - 32

    # Remove all rings from the previous run and resize the canvas.

    if ( ring ):
         for i in range(0, max_rings):
             if ((i,'id') in ring):
                 canvas.delete (ring[(i, 'id')]) 
    
    canvas.configure(width = canvas_width, height = canvas_height)

    # Initialize the poles: no rings, updated X coordinate.

    for i in range (0, 3):
        pole[(i, 'x')] = (i * canvas_width / 3) + (ring_width / 2) + 8
        pole[(i, 'ring_count')] = 0
    
    # Initialize the rings: canvas ID, pole number, and width.

    for i in range(0, n): 
        color = '#' + colors[i % 24]
        w = ring_width - (i * 12)
        y = ring_base - i * ring_spacing
        x = pole[(0, 'x')] - w / 2
        r = n - i
        ring[(r, 'id')] = canvas.create_oval( x, y, x + w, y + ring_height,
                          fill = color, outline = 'black', width = 1)
        ring[(r, 'width')] = w
        ring[(r, 'pole')] = 0
        pole[(0, 'ring_count')] += 1
    
    # Start the simulation.

    mw.update()
    hanoi (n, 0, 2, 1)
    stopped = True

def hanoi (n, ffrom, to, work):
    """Recursively move rings until complete or stopped by the user."""

    if stopped: return

    if n > 0:
       hanoi (n - 1, ffrom, work, to)
       if ( not stopped ): move_ring (n, to)
       hanoi (n - 1, work, to, ffrom)

def init ():
    global stopped, max_rings
    global velocity, colors

    stopped = True

    def stop (e=None): 
        """Stops the animation."""
        global stopped
        stopped = True

    def about (e=None):
        Dialog.Dialog (None, {
                       'title'        : 'About tkhanoi',
                       'bitmap'       : 'info',
                       'default'      : 'OK',
                       'strings'      : ['OK'],
                       'text'         : "tkhanoi version version\n\n" +
                                        "r - run  simulation\n"       +
                                        "p - run step by step\n"      +
                                        "s - stop simulation\n"       +
                                        "h - help\n"                  +
                                        "q - quit program\n",
                       'wraplength'   : '6i' })
    
    def fini (e=None):
        """Terminates Hanoi."""
        stop()
        sys.exit (0)

    def run(e=None): 
        """Runs Hanoi in a single step."""
        global single_move
        single_move = False
        do_hanoi(rscale.get())

    def step(e=None): 
        """Runs Hanoi step by step, by pressing any key on the console."""
        global single_move
        single_move = True
        # disable the menus for not losing the cursor
        # if one is clicked while in step mode
        menubar.entryconfig ('File', state='disable')
        menubar.entryconfig ('Game', state='disable')
        menubar.entryconfig ('Help', state='disable')
        do_hanoi(rscale.get())
        menubar.entryconfig ('File', state='normal')
        menubar.entryconfig ('Game', state='normal')
        menubar.entryconfig ('Help', state='normal')

    def vel(shift): 
        """Sets the number (increment) of pixels to be used for drawing."""  
        global velocity
        velocity = int(shift)

    # Menubar and menubuttons.

    mw.title("Towers of Hanoi")
    # do not resize Hanoi
    mw.resizable(False,False)
    menubar = Menu(mw)
    mw.config(menu = menubar)
    file = Menu ( menubar )
    file.add_command(label = 'Quit', command = fini, accelerator = 'q')
    menubar.add_cascade(label = 'File', menu=file)

    game = Menu(menubar)
    game.add_command(label = 'Run',  command = run,  accelerator = 'r')
    game.add_command(label = 'Step', command = step, accelerator = 'p')
    game.add_command(label = 'Stop', command = stop, accelerator = 's')
    menubar.add_cascade(label = 'Game', menu=game)

    help = Menu(menubar)
    help.add_command(label = 'About', command = about, accelerator = 'h')
    menubar.add_cascade(label = 'Help', menu=help)

    # display the menu
    mw.update()

    info = Frame(mw)
    info.pack()

    # The simulation is played out on a canvas.

    canvas.config(relief=SUNKEN)
    canvas.pack(expand=TRUE, fill=BOTH)
    canvas.create_text(70, 10, text = "",tags="nmoves")

    # Number of rings scale.

    rframe = Frame(info,borderwidth=2, relief=RAISED)
    rlabel = Label(rframe, text = 'Number of Rings')
    rscale = Scale(rframe,orient=HORIZONTAL, from_=1, to=24, length=200)
    rscale.set(4)

    rframe.pack(side="left")
    rscale.pack(side="right", expand=True, fill=X)
    rlabel.pack(side="left")

    # Ring velocity scale.

    vframe = Frame(info,borderwidth=2, relief=RAISED)
    vlabel = Label(vframe,text = 'Ring Velocity %')

    vscale = Scale(vframe,orient=HORIZONTAL, from_=1, to=100, length=200, command = vel)
    vscale.set(2)

    vframe.pack(side="left")
    vscale.pack(side="right", expand=True, fill=X)
    vlabel.pack(side="left")

    # Each ring has a unique color, hopefully.

    colors = [ "ffff0000b000", "ffff00006000", "ffff40000000", "ffff60000000",
               "ffff80000000", "ffffa0000000", "ffffc0000000", "ffffe0000000",
               "ffffffff0000", "d000ffff0000", "b000ffff0000", "9000ffff0000",
               "6000ffff3000", "0000ffff6000", "0000ffff9000", "0000ffffc000",
               "0000ffffffff", "0000e000ffff", "0000c000ffff", "0000a000ffff",
               "00008000ffff", "00006000ffff", "00004000ffff", "00000000ffff" ]

    if max_rings > len(colors):
       print ("Too few colors for max_rings rings!")

    # Global key bindings that emulate menu commands.

    mw.bind('<KeyPress-r>', run)
    mw.bind('<KeyPress-p>', step)
    mw.bind('<KeyPress-q>', fini)
    mw.bind('<KeyPress-h>', about)
    mw.bind('<KeyPress-s>', stop)

def move_ring (n, to):
    """Move ring n - its bounding box coordinates - to pole to."""

    global num_moves, velocity, single_move
    global ring_spacing, ring_base

    if ( single_move ): 
         if ( getch() == 'q' ):
              sys.exit (0)
    else:
         if ( velocity == 1 ): 
              time.sleep (0.5)

    num_moves += 1
    canvas.itemconfig ("nmoves", text="moves = "+str(num_moves))
    r = ring[(n, 'id')]
    l = tuple(canvas.coords(r))
    x0 = int( l[0] + 0.5 )
    y0 = int( l[1] + 0.5 )
    x1 = int( l[2] + 0.5 )
    y1 = int( l[3] + 0.5 )

    # Float the ring upwards to the flying Y-coordinate, and decrement
    # this pole's count.

    while (y0 > fly_y):
         if y0 - fly_y > velocity:
            delta = velocity
         else: 
            delta = y0 - fly_y
         y0 -= delta
         y1 -= delta
         canvas.coords(r, x0, y0, x1, y1)
         mw.update()
    
    pole[(ring[(n, 'pole')], 'ring_count')] -= 1

    # Determine the target X coordinate based on destination pole, and
    # fly the ring over to the new pole. The first while moves rings
    # left-to-right, the second while moves rings right-to-left.

    x = pole[(to, 'x')] - ring[(n, 'width')] / 2

    while (x0 < x):
         if x - x0 > velocity:
            delta = velocity 
         else: 
            delta = x - x0
         x0 += delta
         x1 += delta
         canvas.coords(r, x0, y0, x1, y1)
         mw.update()
    
    while (x0 > x): 
         if x0 - x > velocity:
             delta = velocity  
         else: 
             delta = x0 - x
         x0 -= delta
         x1 -= delta
         canvas.coords(r, x0, y0, x1, y1)
         mw.update()
    
    # Determine ring's target Y coordinate, based on the destination
    # pole's ring count, and float the ring down.

    y = ring_base - pole[(to, 'ring_count')] * ring_spacing

    while (y0 < y):
         if y - y0 > velocity:
            delta = velocity 
         else: 
            delta = y - y0
         y0 += delta
         y1 += delta
         canvas.coords(r, x0, y0, x1, y1)
         mw.update()
    
    pole[(to, 'ring_count')] += 1
    ring[(n, 'pole')] = to

def main():
    """Main program."""

    init()
    mainloop()

if __name__=="__main__":
   sys.exit(main()) 
