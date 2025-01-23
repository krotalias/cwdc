#!/usr/bin/env python
# coding: UTF-8
#
## @package _05a_roman
#
#  Roman to decimal translator.
#
#  @author Paulo Roma
#  @since 10/02/2011

import sys
import os
from tkinter import *
sys.path.insert(0, os.path.expanduser("~roma") + "/html/python/labs")
from _03a_roman2int import roman2int
from _03c_int2roman import int2roman
from validateRoman import validateRoman
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

    def doRoman2Int():
        e1.delete(0, END)
        try:
            s = validateRoman(e2Var.get())
            if s:
                raise ValueError("Invalid - %s" % s)
            #e1.insert(0, roman2int (e2Var.get()))
            e1Var.set(roman2int(e2Var.get()))
        except ValueError as msg:
            #e1.insert(0, msg)
            e1Var.set(msg)

    def doInt2Roman():
        e2.delete(0, END)
        cnum = e1Var.get()
        scnum = len(cnum)
        try:
            d = int(cnum)
            if (scnum > 7 or d > 4000000):
                #e2.insert (0, 'Número muito grande')
                e2Var.set('Número muito grande')
            else:
                #e2.insert (0, int2roman (d))
                e2Var.set(int2roman(d))
        except:
            #e2.insert(0, 'Não é número');
            e2Var.set('Não é número')

    root = Tk()
    root.title('Roman')
    root.resizable(False, False)
    root.geometry('+40+80')

    e1Var = StringVar(root)
    e2Var = StringVar(root)

    if hasPIL:
        imgPath = './images/Roman_Soldier.png'
        s = Image.open(imgPath)
        s = s.resize((262 // 4, 534 // 4), Image.LANCZOS)
        soldier = ImageTk.PhotoImage(s)
    else:
        imgPath = './images/Roman_Soldier.gif'
        soldier = PhotoImage(file=imgPath)
        # return a new PhotoImage based on the same image as this widget,
        # but use only every Xth or Yth pixel.
        soldier = soldier.subsample(4, 4)

    top = Frame()
    top.pack(fill='x')
    mid = Frame()
    mid.pack()
    bot = Frame()
    bot.pack(fill='x')

    l1 = Label(top, text='Decimal')
    l1.pack(side="left")

    l2 = Label(top, text='Romano')
    l2.pack(side="right")

    # the use of the textvariable is optional,
    # but there will be no "set" method otherwise (only "get")
    e1 = Entry(mid, font="Arial 12", width=14, textvariable=e1Var)
    e1.insert(0, '0')
    e1.pack(side="left")

    l3 = Label(mid, text='   =   ')
    l3.pack(side="left")

    e2 = Entry(mid, font="Arial 12", width=28, textvariable=e2Var)
    e2.insert(0, '')
    e2.pack(side="left")

    Button(bot, text="Romano -->", command=doInt2Roman).pack(side="left")
    #if hasPIL:
    label = Label(bot, image=soldier)
    label.pack(side='left', fill=BOTH, expand=1)
    Button(bot, text="<-- Decimal", command=doRoman2Int).pack(side="right")

    root.mainloop()


if __name__ == "__main__":
    sys.exit(main())
