# For compiling for windows:
#    make OS="win32"
# For cross-compiling for windows:
#    make OS="cross"

ARCH = $(shell getconf LONG_BIT)
OS = linux
CC = cc
WARCH=w64

ifeq ($(OS),linux)
   OGLLIBS = -lGLU -lGL -lglut -lm
   EXT = "-linux$(ARCH)"
else
   ifeq ($(OS),win32)
       OGLLIBS = -lglut32 -lglu32 -lopengl32
       EXT=".exe"
   else
       ifeq ($(OS),osx)
          OGLINC = -I/usr/X11/include/
          OGLPATH = -L/usr/X11/lib/
          #OGLPATH = -L/opt/local/lib/
          #OGLINC = /opt/local/include/
          OGLLIBS = $(OGLPATH) -lGLU -lGL -lglut
          EXT=".osx"
       else
          CC=i686-$(WARCH)-mingw32-gcc
          OGLLIBS = -lglut -lglu32 -lopengl32
          ifeq ($(WARCH),w64)
                EXT="64.exe"
          else
                EXT=".exe"
          endif
       endif
   endif
endif

PROG=blobbyGL
CFLAGS=-I. $(OGLINC) -g $(ALL)

OBJS= $(PROG).o

.c.o:
	$(CC) $(CFLAGS) -c -o $*.o $*.c

$(PROG):$(OBJS)
	$(CC) -o $(PROG)$(EXT) $(OBJS) $(OGLLIBS)
