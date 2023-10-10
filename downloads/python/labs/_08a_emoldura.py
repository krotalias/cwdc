#!/usr/bin/python
#
## @package _08a_emoldura
#   Formatting prints.
#
#   @author Paulo Roma

import sys

# Python 2 fix
try:
    input = raw_input
except NameError:
    pass

##   Frames text lines.
#
#   <PRE>
#    **************************
#    *Python enables programs *
#    *to be written           *
#    *compactly and readably  *
#    **************************
#   </PRE>
#
#   @param l list of strings.
#   @param max_n maximum length of all strings in l.
#
def emoldura(l, max_n):
    print("*" * (max_n + 2))
    for st in l:
        print("*" + st + " " * (max_n - len(st)) + "*")
    print("*" * (max_n + 2))

##  Main function for testing.
#   Reads text lines until an empty "enter" is pressed.
#
def main():
    st = input("Digite linhas de texto (linha nula termina)\n")
    l = []
    max_n = 0
    while (st != ""):
        max_n = max(len(st), max_n)
        l.append(st)
        st = input()

    emoldura(l, max_n)


if __name__ == "__main__":
    sys.exit(main())
