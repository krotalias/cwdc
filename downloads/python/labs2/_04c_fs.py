#!/usr/bin/env python
# coding: UTF-8
#
## @package _04c_fs
#
# Count lines, characters, bytes, sentences, words, and paragraphs of a text file.
#
# @author Paulo Roma
# @since 06/02/2012
# @see https://dzone.com/articles/count-lines-sentences-and

from __future__ import print_function
from builtins import input
import sys
try:
    from Getch import getch
except ImportError:
    sys.exit("There is no Getch module available. Download it!")

dashLen = 100

def fs(filename, prt=True):
    """Counts lines, setences, and words of "filename". 
       "prt" controls the echoing of the lines on the screen."""

    #set all the counters to zero
    lines, characters, bytes, blanklines, sentences, words = 0, 0, 0, 0, 0, 0
    paragraphs = []
    newline = True

    if (prt):
        print('-' * dashLen)

    try:
        textf = open(filename, 'r')
    except IOError:
        sys.exit('Cannot open file %s for reading' % filename)

    # reads one line at a time
    for line in textf:
        if (prt):
            print(line, end="")  # echo each line

        lines += 1
        characters += len(line)
        bytes += len(line.encode('utf-8'))

        if not line.strip():
            blanklines += 1
            newline = True
        else:
            # assume that each sentence ends with . or ! or ?
            # so simply count these characters
            sentences += line.count('.') + line.count('!') + line.count('?')

            if newline:
                paragraphs.append(line)
                newline = False
            else:
                paragraphs[-1] += line

            # create a list of words
            # use None to split at any whitespace regardless of length
            # so for instance double space counts as one space
            tempwords = line.split(None)
            # print (tempwords)  # test

            # word total count
            words += len(tempwords)
    textf.close()
    paragraphs.sort()
    return lines, characters, bytes, blanklines, sentences, words, paragraphs

def main(argv=None):
    """ Main function """

    if argv is None:
        argv = sys.argv

    if (len(argv) < 2):
        try:
            fn = input("Enter file name: ")
        except (EOFError, KeyboardInterrupt) as e:
            sys.exit("Invalid file name")
    else:
        fn = argv[1]

    (l, c, t, b, s, w, p) = fs(fn, len(argv) > 2)

    print('-' * dashLen)
    for i in p:
        print(i)
    print('-' * dashLen)

    print("Lines      : %d" % l)
    print("Characters : %d" % c)
    print("Bytes      : %d" % t)
    print("Blank lines: %d" % b)
    print("Sentences  : %d" % s)
    print("Words      : %d" % w)
    print("Paragraphs : %d" % len(p))

    print('-' * dashLen + "\n")

    # optional console wait for keypress
    getch()


if __name__ == "__main__":
    sys.exit(main())
