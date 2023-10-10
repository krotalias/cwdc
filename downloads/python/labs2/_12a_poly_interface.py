#!/usr/bin/env python
# -*- coding: UTF-8 -*-
#
## @package _12a_poly_interface
#
#  UFRJ - Departamento de Ciência da Computação
#  Computação Gráfica - 2019.2
#  Trabalho 1
#
#  @author Rodrigo Carvalho de Figueiredo
#  @since 18/09/2019
#
#  Descrição:
#  Desenha um dos cinco sólidos platônicos em 3D e possibilita
#  ao usuário rotacioná-lo (com o botão esquerdo e o scroll
#  do mouse), colorir suas faces e desenhar os vetores normais
#  de cada face (por meio de seleção na interface do programa).
#
#  Os sólidos são representados por matrizes, onde cada
#  coluna representa um vértice 3D.
#
#  Utiliza a biblioteca tkinter do python para gerar a janela,
#  a interface, e o desenho do sólido.
#  - Código base: @see https://code.activestate.com/recipes/578876-rotatable-tetrahedron/
#  - Classe mapper: @see http://orion.lcg.ufrj.br/python/public/mapper.py
#  - Arquivos PLY: @see https://people.sc.fsu.edu/~jburkardt/data/ply/ply.html
#
from __future__ import division
try:
    from tkinter import *     # python 3
except ImportError:
    from Tkinter import *     # python 2
from math import *
import sys

from mapper2 import mapper2 as mapper

import _12a_poly
from _12a_poly import init, matMul, DrawObj, toggleObj, wheel, wheelUp, wheelDown
from _12a_poly import ROT_X, ROT_Y, ROT_Y, EPS, resize, cbMotion, cbClicked

## Desenha um dado sólido na tela de acordo com as opções escolhidas na interface
def draw():
    _12a_poly.outline = not varColor.get()
    _12a_poly.faceNormal = varNormal.get()
    _12a_poly.__debug = varBox.get()
    DrawObj(_12a_poly.vertices, _12a_poly.objColor)

## Mapeia as teclas númericas de 1 a 5 para seleção de um dos sólidos
#  - Mapeia a tecla C para marcar/desmarcar a opção "Colorido"
#  - Mapeia a tecla N para marcar/desmarcar a opção "Normais"
#  - Mapeia a tecla B para marcar/desmarcar a opção "Box"
def keyPressed(event):
    if(event.keysym == 'c'):
        cb_color.toggle()
        _12a_poly.outline = not varColor.get()
        draw()
    elif(event.keysym == 'n'):
        cb_Normals.toggle()
        _12a_poly.faceNormal = varNormal.get()
        draw()
    elif(event.keysym == 'b'):
        cb_box.toggle()
        _12a_poly.__debug = varBox.get()
        draw()
    elif event.keysym in ['1', '2', '3', '4', '5']:
        setSolid(int(event.keysym) - 1)

## Define o sólido a ser desenhado de acordo com a seleção feita pelo usuário
def setSolid(selection):
    toggleObj(selection)
    draw()

def mainInterface():

    global varColor, varNormal, varBox
    global cb_color, cb_Normals, cb_box
    global root, canvas, map

    # cria a janela do programa
    root = Tk()
    root.title('Visualizador de Sólidos Platônicos')
    root.geometry('+0+0')

    initialWidth = initialHeight = 400
    bgColor = 'powder blue'
    labelColor = 'dark turquoise'

    # cria o canvas e faz as binds dos comandos que poderão ser feitos pelo usuário
    canvas = Canvas(root, width=initialWidth,
                    height=initialHeight, background=bgColor)
    _12a_poly.root = root
    _12a_poly.canvas = canvas

    canvas.focus_set()
    canvas.bind("<Button-1>", cbClicked)
    canvas.bind("<B1-Motion>", cbMotion)
    canvas.bind("<Configure>", resize)
    canvas.bind("<Key>", keyPressed)

    # inicializa as variáveis globais
    init()
    map = mapper(_12a_poly.window, [0, 0, initialWidth, initialHeight])
    _12a_poly.map = map

    from platform import uname
    os = uname()[0]
    if (os == "Linux"):
        canvas.bind('<Button-4>', wheelUp)      # X11
        canvas.bind('<Button-5>', wheelDown)
    elif (os == "Darwin"):
        canvas.bind('<MouseWheel>', wheel)      # MacOS
    else:
        canvas.bind_all('<MouseWheel>', wheel)  # Windows

    # cria e posiciona os labels na parte superior e inferior da janela
    label = Label(
        root, text="Selecione um sólido e as opções desejadas", bg=labelColor, bd=5)
    label.pack(side='top', fill=X)
    label = Label(
        root, text="Rodrigo Carvalho de Figueiredo - CG 2019.2", bg=labelColor)
    label.pack(side='bottom', fill=X)
    canvas.pack(side='left', fill=BOTH, expand=YES)  # posiciona o canvas

    # cria e posiciona os botões laterais que servirão para selecionar os sólidos
    bTetraedro = Button(root, text="Tetraedro (1)",
                        command=lambda: setSolid(1))
    bCubo = Button(root, text="Cubo (2)", command=lambda: setSolid(0))
    bOctaedro = Button(root, text="Octaedro (3)", command=lambda: setSolid(2))
    bDodecaedro = Button(root, text="Dodecaedro (4)",
                         command=lambda: setSolid(3))
    bIcosaedro = Button(root, text="Icosaedro (5)",
                        command=lambda: setSolid(4))
    bTetraedro.pack(fill=BOTH, pady=10)
    bCubo.pack(fill=BOTH, pady=10)
    bOctaedro.pack(fill=BOTH, pady=10)
    bDodecaedro.pack(fill=BOTH, pady=10)
    bIcosaedro.pack(fill=BOTH, pady=10)

    # cria e posiciona os checkbuttons que servirão para selecionar as opções de "Colorido" e "Normais"
    varColor = IntVar()
    varNormal = IntVar()
    varBox = IntVar()
    cb_color = Checkbutton(root, text="Color (C)",
                           command=lambda: draw(), variable=varColor)
    cb_Normals = Checkbutton(root, text="Normais (N)",
                             command=lambda: draw(), variable=varNormal)
    cb_box = Checkbutton(root, text="Box (B)",
                         command=lambda: draw(), variable=varBox)
    cb_color.pack(anchor=W, fill=BOTH)
    cb_Normals.pack(anchor=W, fill=BOTH, pady=20)
    cb_box.pack(anchor=W, fill=BOTH)

    # desenha o sólido inicial e inicia o loop do programa
    setSolid(0)
    root.mainloop()


if __name__ == '__main__':
    sys.exit(mainInterface())
