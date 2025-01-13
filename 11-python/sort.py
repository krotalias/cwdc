#!/usr/bin/env python3
# coding: UTF-8
#
## @package sort
#
#   An n log n Sort algorithm based on Binary search.
#
#   Usage:
#   - \ref /cwdc/11-python/sort.py?20
#
#   @author Paulo Roma
#   @since 03/10/2020
#   @see <a href="/cwdc/11-python/sort.py?20">link</a>
#   @see https://epydoc.sourceforge.net/stdlib/cgitb-module.html
#   @see https://epydoc.sourceforge.net/stdlib/cgi.FieldStorage-class.html
#   @see https://www.cs.princeton.edu/courses/archive/spring20/cos510/sf/vfa/toc.html
#
from __future__ import print_function
import sys
import os
import random
import cgi
import cgitb

# More comprehensive traceback formatting for Python scripts.
cgitb.enable()

## Efficient sorter based on binary search.
class sorter:
    ## Return a random list of integers.
    #  @param k list size.
    #
    @staticmethod
    def randomList(k):
        if k > 0:
            lista = []
            limit = random.randint(10, 300)
            for _ in range(0, k):
                n = random.randint(-limit, limit)
                lista.append(n)
        else:
            lista = [9, 3, 4, 10, 100, -5, 2, 1, 4, 0, -12]
        return lista

    ## Print a list.
    #  @param lst list.
    #  @param lf line feed character.
    #  @param nl maximum number of elements per line.
    #
    @staticmethod
    def printList(lst, lf='\n', nl=25):
        for i in range(0, len(lst), nl):
            print(*lst[i:i + nl], sep=' ')

        print(lf)

    ## Constructor. Save the debugging state.
    def __init__(self, lf='\n', debug=False):
        ## Debugging state.
        self.debug = debug
        ## Line feed character.
        self.lf = lf

    ## Print a string on the console.
    def console_log(self, st):
        if not HTML:
            print(st)
        else:
            print('<script> console.log("{}") </script>'.format(st))

    ## Iterative Binary Search Function.
    #  It returns the index of x in the given array arr if present,
    #  or else returns low.
    #
    #  @param arr an ordered list.
    #  @param larr arr length.
    #  @param x value to search for.
    #  @return index of x or the position it should be.
    #
    def binarySearch(self, arr, larr, x):
        low = 0
        high = larr - 1
        mid = 0

        lf = self.lf

        if self.debug:
            self.console_log('search: x = %d, arr = %s%s' % (
                x, list(filter(lambda x: x is not None, arr)), 2 * lf))

        while low <= high:

            mid = (high + low) // 2
            if self.debug:
                self.console_log('low = %d, mid = %d, high = %d%s' %
                                 (low, mid, high, lf))

            # If x is greater, ignore left half
            if arr[mid] < x:
                low = mid + 1
                if self.debug:
                    self.console_log('right: low = %d, mid = %d, high = %d%s' % (
                        low, mid, high, 2 * lf))

            # If x is smaller, ignore right half
            elif arr[mid] > x:
                high = mid - 1
                if self.debug:
                    self.console_log('left: low = %d, mid = %d, high = %d%s' % (
                        low, mid, high, 2 * lf))

            # x is present at mid
            else:
                if self.debug:
                    self.console_log('found: low = %d, mid = %d, high = %d%s' % (
                        low, mid, high, 2 * lf))
                return mid

        # If we reach here, then the element was not present
        if self.debug:
            self.console_log('not found: low = %d%s' % (low, 2 * lf))
        return low

    ## Sorts an array using @f$\sum_{i=1}^{n} log(i) = log (\prod_{i=1}^{n} i) = log (n!) \approx n\ log(n)@f$ comparisons.
    #
    #  However, this algorithm has high (quadratic) data movement costs.
    #  - Therefore, the overall asymptotic cost of this algorithm will be @f$O(n^{2})@f$.
    #
    #  Each element of the source list 'x' is inserted at the appropriate position 'p', given by a binary search.
    #  - If inplace is False, the elements are inserted into another list 'a'.
    #
    #  - Consecutive elements are moved, from position 'p' up, on the sorted portion of the list,
    #  one position to the right, to open room for the new element.
    #
    #  @param x list to be sorted.
    #  @param inplace whether to sort in place or return a new sorted array.
    #  @return a sorted list.
    #  @see https://en.wikipedia.org/wiki/Stirling's_approximation
    #  @see https://www.cl.cam.ac.uk/teaching/1314/Algorithms/students/2014-stajano-algs-students-handout.pdf#page=22
    #  @see <a href='../../sort.txt'>sort example</a>
    #
    def sort(self, x, inplace=False):
        if inplace:
            a = x
        else:
            a = [None] * len(x)
            a[0] = x[0]
        n = len(x)

        for i in range(1, n):
            k = self.binarySearch(a, i, x[i])
            b = x[i]
            for j in range(i, k - 1, -1):  # i, i-1, i-2, ..., k
                a[j] = a[j - 1]
            a[k] = b

        return a

## Main program for testing.
#
#  @param argv command line arguments.
#  - argv[0]: script name.
#  - argv[1]: number of random elements.
#  - argv[2]: turn debugging ON.
#  - argv[3]: select an in place sorting.
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    global HTML

    HTML = 'REQUEST_METHOD' in os.environ
    if HTML:
        newline = '\\n'

        ## The form object.
        #  Store a sequence of fields, reading multipart/form-data.
        form = cgi.FieldStorage()

        narray = form.getvalue("narray") if "narray" in form else argv[1]

        debug = form.getvalue("debug")
        inplace = form.getvalue("inplace")

        k = int(narray)
    else:
        newline = '\n'
        k = int(argv[1]) if len(argv) > 1 else 0
        debug = len(argv) > 2
        inplace = len(argv) > 3

    s = sorter(newline, debug)
    lista1 = sorter.randomList(k)
    lista = lista1[:]  # necessary a copy for an in place sorting

    if HTML:
        message = "How many random numbers for sorting?"

        print("""Content-type: text/html; charset=utf-8\r\n\r\n
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
                <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
                <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">
                <title> Sorter </title>
                <style>
                    body {
                        background-color: #f0f0f2;
                        display: none;
                    }
                    .sort-container {
                        width: auto;
                        display: inline-block;
                        height: auto;
                        padding: 10px;
                        text-align: center;
                        background-color: antiquewhite;
                        border: 5px solid lightblue;
                        cursor: move;
                    }
                    #draggable {
                        cursor: n-resize;
                    }
                </style>
            </head>
            <body>
        """)

        # if debug is on, prints should be executed after header has been sent
        lista2 = s.sort(lista, inplace)

        # When the parameter action is not specified, the data is sent to the page that contains the form
        print(
            """
        <div class="sort-container">
            <h1><a href="https://www.cl.cam.ac.uk/teaching/1314/Algorithms/students/2014-stajano-algs-students-handout.pdf#page=22">Binary Insertion Sort</a></h1>
            <form method="post">
                <label for="original" style="display:block">Original</label>
                <textarea id="original" name="original" rows="4" cols="50" style="background-color:orange;">{}</textarea><br><br>
                <label for="sorted" style="display:block">Sorted</label>
                <textarea id="sorted" name="sorted" rows="4" cols="50" style="background-color:orange;">{}</textarea><br><br>
                <h4> {} </h4>
                <label for="asize">Size</label>
                <input type="number" name="narray" id="asize" min=0 max=9999 value = {} autofocus>
                <input type="submit" value="Sort!">
                <label for="debug">Debug?</label>
                <input type="checkbox" id="debug" name="debug" value="on">
                <label for="inplace">In place?</label>
                <input type="checkbox" id="inplace" name="inplace" value="on" checked>
            </form>
        </div>
        """.format(lista1, lista2, message, narray))

        # Blocks the pop up asking for form resubmission on refresh once the form is submitted.
        # Just place this javascript code at the footer of your file and see the magic.
        print(
            """
            <script src="../mainPage/LCG.js"></script>
            <script>
                // Shorthand for $( document ).ready()
                $(function() {
                    $('body').css('display','block'); // create hidden and show later onDomReady. Flicker-free!
                    dragAndSave(".sort-container");
                    window.onkeydown = function (event) {   // redefine onkeydown from dragAndSave
                        if (event.key == 'Escape') {
                            alert ("%s");
                        } else if (event.key == 'b') {
                            window.location.href = "../11-python";
                        }
                    }
                });
                if ( window.history.replaceState ) {
                    window.history.replaceState( null, null, window.location.href );
                }
            </script>

            </body>
            </html>
        """ % ("Debugging in the console"))
    else:
        print('Original List: ')
        s.printList(lista1, newline)
        print('Sorted List: ')
        lista2 = s.sort(lista, inplace)
        s.printList(lista2, newline)

        n = lista1[len(lista1) // 2]
        b = s.binarySearch(lista2, len(lista2), n)
        print("pos({}) -> sorted list[{}] and found = {}"
              .format(n, b, lista2[b] == n))

        print(newline)

        n = 6
        b = s.binarySearch(lista2, len(lista2), n)
        print("pos({}) -> sorted list[{}] and found = {}"
              .format(n, b, b < len(lista2) and lista2[b] == n))


if __name__ == "__main__":
    sys.exit(main())
