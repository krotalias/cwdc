#!/usr/bin/env python3
# coding: UTF-8
#
## @package primes
#  Primality Testing.
#
#  @author Paulo Roma
#  @date 26/02/2021
#  @see <a href="/cwdc/11-python/12.5.py?55">link</a>
#  @see <a href="/python/laboratorios.html#prime">labs</a>
#  @see https://docs.python.org/3/library/itertools.html
#

import sys
import os
import cgi
from math import sqrt
from itertools import islice, count

# Fix Python 2.x.
try:
    input = raw_input
except NameError:
    pass

## Checks if a number is prime.
#  @param n given number to be tested.
#  @return 0 if number is prime or one of its factors, otherwise.
#
def isPrime(n):
    if (n == 1):
        return 1                                 # 1 is not prime
    elif n < 4:
        return 0                                 # 2 and 3 are primes
    elif n % 2 == 0:
        return 2                                 # composite
    else:
        for i in range(3, int(sqrt(n)) + 1, 2):  # only odd numbers
            if n % i == 0:
                return i                         # composite

    return 0

## Prime generator.
def primeGenerator():
    yield 2
    for n in count(3, 2):
        if isPrime(n) == 0:
            yield n

## Generates the first n primes.
 # @param n number of primes to be generated.
 # @return list of primes.
 #
def getPrimes(n):
    return [x for x in islice(primeGenerator(), n)]

## Main program for testing.
def main(argv=None):
    if argv is None:
        argv = sys.argv

    HTML = 'REQUEST_METHOD' in os.environ

    if HTML:
        form = cgi.FieldStorage()

        nprimes = form.getvalue("nprimes") if "nprimes" in form else argv[1]
        nprimes = int(nprimes)
        message = "How many primes for printing?"

        print("""Content-type: text/html; charset=utf-8\r\n\r\n
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
                <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
                <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">
                <title> Primes </title>
                <style>
                    body {
                        background-color: #f0f0f2;
                    }
                    .prime-container {
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

        print("""
        <div class="prime-container">
            <h1><a href="../../python/laboratorios.html#prime">Primes</a></h1>
            <form method="post">
                <textarea id="tprimes" name="tprimes" rows="4" cols="50" style="background-color:orange;">{}</textarea><br><br>
                <h4> {} </h4>
                <label for="nprimes">Size</label>
                <input type="number" name="nprimes" id="nprimes" min=1 max=9999 value = {} autofocus>
                <input type="submit" value="Primes!">
            </form>
        </div>
        """.format(getPrimes(nprimes), message, nprimes))

        # Blocks the pop up asking for form resubmission on refresh once the form is submitted.
        # Just place this javascript code at the footer of your file and see the magic.
        print("""
            <script src="../mainPage/LCG.js"></script>
            <script>
                if ( window.history.replaceState ) {
                    window.history.replaceState( null, null, window.location.href );
                }
                dragAndSave(".prime-container");
            </script>

            </body>
            </html>
        """)

    else:
        nprimes = argv[1] if len(argv) > 1 else 50

        try:
            nprimes = int(nprimes)
        except ValueError as e:
            print(e)
            sys.argv[1] = input("Please enter a whole number: ")
            main()
        else:
            print(getPrimes(nprimes))


if __name__ == '__main__':
    sys.exit(main())
