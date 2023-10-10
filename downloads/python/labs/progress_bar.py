#!/usr/bin/env python
#
## @package progress_bar
#
#   Progress bar.
#
#   @author Paulo Roma
#   @since 04/03/2011
#   @see http://www.python.org.br/wiki/ReceitaBarraDeProgresso

import sys
import time

##
#   @brief Displays a progress bar on the console made of '#'.
#
#   @param value   current value of the parameter controlling the bar.
#   @param max     maximum value of the parameter.
#   @param barsize number of characters to fill the bar.
#
def progress_bar(value, max, barsize):
    chars = int(value * barsize / float(max))
    percent = int((value / float(max)) * 100)
    sys.stdout.write("#" * chars)
    sys.stdout.write(" " * (barsize - chars + 2))
    if value >= max:
        sys.stdout.write("done. \n\n")
    else:
        sys.stdout.write("[%3i%%]\r" % (percent))
    sys.stdout.flush()


def main():
    print("processing...")
    for i in range(11):
        progress_bar(i, 10, 40)
        time.sleep(1)
    print("ok")


if __name__ == "__main__":
    sys.exit(main())
