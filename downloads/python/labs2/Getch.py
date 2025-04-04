#!/usr/bin/env python
#
## @package Getch
#
# Gets a single character from standard input.
#
# @author Paulo Roma
# @since 09/07/2010
# @see http://code.activestate.com/recipes/134892-getch-like-unbuffered-character-reading-from-stdin/

class _Getch:
    """Gets a single character from standard input.
       Does not echo to the screen."""

    def __init__(self):
        try:
            self.impl = _GetchWindows()
        except ImportError:
            self.impl = _GetchUnix()

    def __call__(self): return self.impl()


class _GetchUnix:
    def __init__(self):
        import sys
        import tty
        import termios

    def __call__(self):
        import sys
        import tty
        import termios
        fd = sys.stdin.fileno()
        old_settings = termios.tcgetattr(fd)
        try:
            tty.setraw(sys.stdin.fileno())
            ch = sys.stdin.read(1)
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
        return ch


class _GetchWindows:
    def __init__(self):
        import msvcrt

    def __call__(self):
        import msvcrt
        return msvcrt.getch()


getch = _Getch()
