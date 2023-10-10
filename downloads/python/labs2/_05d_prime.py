#!/usr/bin/env python
# coding: UTF-8
#
## @package _05d_prime
#
#  Prime number testing.
#
#  @author Paulo Roma
#  @since 06/10/2020

import sys
import os
from tkinter import *
sys.path.insert(0, os.path.expanduser("~roma") + "/html/python/labs")
from _04a_prime import isPrime, isPrime2
hasPIL = True
try:
    from PIL import Image, ImageTk
except ImportError:
    hasPIL = False

def main(argv=None):
    """Main Program."""

    global hasPIL

    if argv is None:
        argv = sys.argv

    if len(argv) > 1:
        hasPIL = False

    WIDTH = "30"

    # Callback function called when button isPrime is pressed.
    def doPrimeTest():
        try:
            s = abs(int(e1Var.get()))
            s = isPrime(s)
            s = 'prime' if not s else 'divisible by ' + str(s)
            l3.config(text=s, width=WIDTH)
        except ValueError as msg:
            l3.config(text=msg, width=WIDTH)

    root = Tk()
    root.title('Prime')
    root.resizable(False, False)
    root.geometry('+40+80')

    e1Var = StringVar(root)

    if hasPIL:
        imgPath = './images/Optimus.png'
        s = Image.open(imgPath)
        s = s.resize((796 // 8, 1372 // 8), Image.ANTIALIAS)
        soldier = ImageTk.PhotoImage(s)
    else:
        imgPath = './images/Optimus.gif'
        soldier = PhotoImage(file=imgPath)
        # return a new PhotoImage based on the same image as this widget,
        # but use only every Xth or Yth pixel.
        soldier = soldier.subsample(8, 8)

    top = Frame()
    top.pack(fill='x')
    mid = Frame()
    mid.pack()
    bot = Frame()
    bot.pack(fill='x')

    l1 = Label(top, text='Whole Number')
    l1.pack(side="left")

    # the use of the textvariable is optional,
    # but there will be no "set" method otherwise (only "get")
    e1 = Entry(mid, font="Arial 12", width=14, textvariable=e1Var)
    e1.insert(0, '1')
    e1.pack(side="left")

    # Label for displaying the answer.
    l3 = Label(mid, text="Type a number", width=WIDTH)
    l3.pack(side="left")
    l3.config(font=("Courier", 22))

    # Button to perform the prime testing.
    Button(bot, text="is Prime?", command=doPrimeTest).pack(side="left")
    #if hasPIL:
    label = Label(bot, image=soldier)
    label.pack(side='left', fill=BOTH, expand=1)

    root.mainloop()


if __name__ == "__main__":
    sys.exit(main())
