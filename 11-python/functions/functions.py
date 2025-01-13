#!/usr/bin/env python3
# coding: UTF-8
#
## @package functions
#
#   Multiplication using shifts.
#
#   Thinking binary:
#   <pre>
#       1011 &times;         11
#       1101           13
#       ----     --------
#       1011 +   1*1*1011  1011 << 0
#      00000     0*2*1011  0000 << 1
#     101100     1*4*1011  1011 << 2
#    1011000     1*8*1011  1011 << 3
#    -------     --------
#   10001111          143
#   </pre>
#
#   @author Paulo Roma
#   @since 15/10/2011
#   @see <a href="/cwdc/11-python/functions/functions.py?35+1134">link</a> (35+1134)
#   @see <a href="/cwdc/11-python/showCodePython.php?f=functions/functions">source</a>
#   @see <a href="/python/labs/doc/html/__10__factorize2_8py.html">_10_factorize2.py</a>
#   @see https://css-tricks.com/multiple-class-id-selectors/
#   @see https://wiki.python.org/moin/BitwiseOperators
#   @see https://archive.org/details/1958-02_IF/page/n5/mode/2up?view=theater
#   @see https://developer.mozilla.org/en-US/docs/Web/CSS/white-space
#   @see https://en.wikipedia.org/wiki/Binary_multiplier
#

from functools import reduce
import sys
import os
sys.path.insert(0, os.path.expanduser("~roma") + "/html/python/labs")
from _10_factorize2 import toString, factorize, condense

##
#   Multiplies two integers by using only the + operation.
#
#   @param a first factor.
#   @param b second factor.
#   @param debug print each step.
#   @return a*b
#
def Product(a, b, debug=False):
    p = 0

    if debug:
        print("<pre><code>")
        def w(t=0): return len(bin(a)) + len(bin(b)) + 4 + t    # add a tab
        wm = max(len(bin(a)), len(bin(b))) - 2            # remove 0b
        line = wm * '-'
        print("{:>{width0}} &times; <br> {:>{width}} <br> {:>{width}}".
              format(bin(a)[2:], bin(b)[2:], line, width0=w(2), width=w(1)))

    while (b != 0):
        if (b & 1):
            p += a

        if debug:
            c = bin(a)[2:] if (b & 1) else '0'
            print("{:>{width}}".format(c, width=w(2)))

        a <<= 1
        b >>= 1

    if debug:
        wp = len(bin(p)) - 2
        line = wp * '-'
        print(" {:>{width}} <br> {:>{width}} = {}".
              format(line, bin(p)[2:], p, width=w()))
        print("</code></pre>")

    return p

## Greatest Common Divisor, which returns the highest
#  number that divides into two other numbers exactly.
#  @param x first integer.
#  @param y second integer.
#  @param debug print each step.
#  @return GCD.
#
def gcd(x, y, debug=False):
    if debug:
        print("<pre><code>")
    while x:
        if debug:
            print("\t{}, {} = {} % {}, {}".format(x, y, y, x, x))

        x, y = y % x, x

    if debug:
        print("\t{}, {} => return {}\n\n".format(x, y, y))
        print("</code></pre>")

    return y

## Least Common Multiple, which returns the smallest
#  number that can be divided by x and y without any remainder.
#  @param x first integer.
#  @param y second integer.
#  @return LCM.
#  @see https://en.wikipedia.org/wiki/Least_common_multiple
#  @see https://www.w3resource.com/python-exercises/challenges/1/python-challenges-1-exercise-37.php
#
def lcm(x, y): return x * y // gcd(x, y)

## Print "Hello!".
#  @param lf line feed character.
#
def sayHello(lf="\n"):
    print("<h1>Hello Functions!</h1>" + lf)

## Print a string.
#  @param something a string.
#
def saySomething(something):
    print("<h2>" + something + "</h2>")

## Smallest integer number with all factors from 1 to n.
#  @param n limit.
#  @return smallest integer.
#
def LCM(n): return reduce(lcm, range(1, n + 1))

## Function for multiplying two numbers.
def multiplyTwoNumbers(x, y): return x * y

## Factorize the smallest integer number with all factors from 1 to n.
def allFactors(n):
    f = LCM(int(n))
    g = toString(condense(factorize(f)))
    return f, g

## Main function for testing.
#
#  Usage:
#  - <a href="/cwdc/11-python/functions/functions.py?2+3">link</a> (2+3) or
#  - <a href="/cwdc/11-python/functions/functions.py?12">link</a> (AJAX allFactors(12))
#
#  @param argv command line arguments.
#  argv:
#  - argv[0]: /Library/WebServer/Documents/cwdc/11-python/functions/functions.py (macOS)
#  - argv[1]: an integer that will set the range to get all factors.
#  - argv[2]: another integer that will be the second for Product. (optional)
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    HTML = 'REQUEST_METHOD' in os.environ
    AJAX = len(argv) == 2

    if not HTML:
        try:
            a, b = str(input('Type two positive integers: ')).split()
            print(Product(int(a), int(b)))
        except ValueError:
            main()
    else:
        # Entry point for the ajax call.
        if AJAX:
            print("Content-Type: text/html\n")
            n, f = allFactors(argv[1])
            print("%s = %s" % (n, f))
            return
        print("""Content-type: text/html; charset=utf-8\r\n\r\n
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="stylesheet" type="text/css" href="/cwdc/mainPage/LCG.css">
                <title>Functions</title>
                <style>
                    label {
                        display: block;
                        text-align:center;
                        width: 600px;
                    }
                    ins {
                        color:red;
                        text-decoration: none;
                    }
                    span.subsup {
                        position: relative;
                    }
                    span.subsup sub {
                        position: absolute;
                        left: 0em;
                        bottom: -0.4em;
                    }
                    .heading span {
                        display: inline-block;
                    }
                    .heading span:first-letter {
                        color: red;
                    }
                    .heading {
                        float: left;
                        margin: 0 auto;
                        width: 350px;
                        vertical-align: top;
                        white-space: pre;
                        font-family: monospace;
                    }
                </style>
            </head>
            <body>
        """)

        newline = '<br>'

        try:
            a = int(argv[1])
            b = int(argv[2])
        except ValueError as e:
            print(e)
            a = 11
            b = 13

        sayHello(newline)

        saySomething(
            '<a href="https://www.youtube.com/watch?v=MfLw72g2DYE">Good Morning, CWDC students!</a>' + newline)

        print(2 * newline)

        # -------------------------------------------------------------------------------------------------------

        print("An anonymous <b><a href='../../python/laboratorios.html#lambda'>lambda function</a></b>: {} * {} = {}{}".
              format(a, b, multiplyTwoNumbers(a, b), newline))

        print("""
        <pre>
        # A lambda function can take any number of arguments,
        # but can only have one expression.

        multiplyTwoNumbers = lambda x, y: x * y
        print(multiplyTwoNumbers({}, {}))
        </pre>
        """.format(a, b))

        print(2 * newline)

        # -------------------------------------------------------------------------------------------------------

        print("<b>Greatest Common Divisor</b> of {}, {} = {} (Euclides' <a href='/python/laboratorios.html#gcd'>GCD</a>){}".
              format(a, b, gcd(a, b), newline))

        print("""
        <pre>
        def <mark>gcd</mark>(x, y):
            <q>""<a href="https://www.khanacademy.org/computing/computer-science/cryptography/modarithmetic/a/the-euclidean-algorithm">gcd(x, y) = gcd(y, x%y)</a>""</q>

            while x:
                x, y = y % x, x
            return y
        </pre>
        """)
        gcd(a, b, True)

        # -------------------------------------------------------------------------------------------------------

        print("""
            <h3>
                <a href="http://www.keypersonofinfluence.com/binary-thinking-vs-directional-thinking/">Thinking binary</a> and the
                <a href="https://en.wikipedia.org/wiki/The_Feeling_of_Power">The Feeling of Power</a>, by
                <a href="https://archive.org/details/1958-02_IF/page/n5/mode/2up?view=theater">Isaac Azimov.</a>
            </h3>
        """)
        print("{} * {} = {} (Ladislas Aub's example){}".
              format(17, 23, Product(17, 23), newline))

        print("""
    <div class="heading">
        def <mark>Product</mark>(a, b):
            <q>""Product using <a href="https://wiki.python.org/moin/BitwiseOperators">bitwise</a> operators and additions only.""</q>

            p = 0

            while (b != 0):
                if (b & 1):  # get the first (rightmost) bit of 'b'
                    p += a
                a <<= 1  # shift to the left (inserts a 0 bit on the right)
                b >>= 1  # shift to the right (drops the rightmost bit)

            return p
    </div>

    <div style="clear: both;"></div>

    <div class="heading">
        &larr; 10001 &times;   17 &times; (2<sup>4</sup>+2<sup>0</sup>)
         <span style="color:red;"> 10111 </span>&rarr;   23   (2<sup>4</sup>+2<sup>2</sup>+2<sup>1</sup>+2<sup>0</sup>)
          -----    ----------
          10001 &#43; <span> 1* 1*10001 &#43; 10001 << 0 </span>
         100010   <span> 1* 2*10001   10001 << 1 </span>
        1000100   <span> 1* 4*10001   10001 << 2 </span>
              0   <span> 0* 8*10001   10001 << 3 </span>
      100010000   <span> 1*16*10001   10001 << 4 </span>
      ---------    ----------
      110000111    391
    </div>

    <div class="heading">
         17 &times;
        <span style="color:red"> 23 </span>   (2*10+3)
        ----   --------
         51 + <span> 3* 1*17 &#43; 17 << 0 </span>
        34    <span> 2*10*17   17 << 1 </span>
        ----   --------
        391    391
    </div>

    <div style="clear: both;"></div>

    <h3>
        <a href="/python/_01 - Programando em Python - Sistemas de Numeracao.pdf">Thinking decimal</a>
    </h3>

    <div class="heading">
        def <mark>Product</mark>(a, b, base=10):
            <q>""Product using integer division/product, mod and additions.""</q>

            p = 0
            while (b != 0):
                d = b &#37; base  # rightmost bit of b (<a href="https://www.askpython.com/python/python-modulo-operator-math-fmod">mod</a>)
                if (d):
                    p += <span>d * a</span>
                a *= base     # shift to the left
                b //= base    # shift to the right (integer division)
            return p
    </div>

    <div style="clear: both;"></div>
        """)

        print("{} * {} = {} (Product using shifts){}".
              format(a, b, Product(a, b), newline))
        Product(a, b, True)

        # -------------------------------------------------------------------------------------------------------

        print("""
            <h1>
                Python is an Object Oriented
                <a href="https://en.wikipedia.org/wiki/Imperative_programming">Imperative</a> language.
            </h1>
            <h1>However, ...</h1>
            <h1>
                <a href="https://realpython.com/python-functional-programming/">Functional programming</a>
                is possible in Python!!
            </h1>

            <p><a href='iterables.jpg'> <img src='iterables.jpg' width=550px></a></p>

            <h3>
                <a href="https://nvie.com/posts/iterators-vs-generators/">Iterables vs. Iterators vs. Generators</a>
            </h3>

            <p><a href='generators.png'> <img src='generators.png' width=550px></a></p>
            <p><a href='iter.jpg'> <img src='iter.jpg' width=250px></a></p>
        """)

        print("""
            <h2><a href="https://www.calculatorsoup.com/calculators/math/lcm.php">Least Common Multiple</a></h2>
            The smallest integer divisible by all integers in the range(1, <ins>i</ins>+1=<span id="i1"> </span>) is:
            <ul>
                <li>LCM = lambda m: <a href="https://realpython.com/python-reduce-function/">reduce</a>
                (lambda a, b: a*b//<mark>gcd</mark>(a, b), range(1, m+1))</li>
                <ul>
                    <li>res = 1 * 2 // gcd(1, 2)</li>
                    <li>res = res * 3 // gcd(res, 3)</li>
                    <li>res = res * 4 // gcd(res, 4)</li>
                    <li>...</li>
                    <li>res = res * m // gcd(res, m)</li>
                </ul>
                <li> LCM(1, m) → res  </li>
                <li>The iterable (range) has been reduced to a single value,
                by repetitively applying a function to all of its members.</li>
            </ul>

            Unification of <a href="https://portingguide.readthedocs.io/en/latest/numbers.html">int and long</a>:
            <ul>
                <li>Python 3 does not have a <strong>long</strong> type.</li>
                <li><strong>int</strong> itself allows large values (limited only by available memory).</li>
                <li>Python 2’s long was renamed to <strong>int</strong>.</li>
            </ul>

            <br>
            <p>LCM(<ins><span id="i">i</span></ins>) = <code><span id="prod"> </span></code></p>

            <form id="form">
                <label style="z-index: 1; left: -100px; position: absolute;" for="n"><ins>i</ins> <span id="range"></span></label><br>
                1<input type="range" min="1" max="100" value="43" step="1" id="n" name="n" style="width: 400px;" oninput="getFactors()">100
            </form>
        """)

        print("""
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
        <script>
            /*
             * Updates LCM's value and factors according to the slider position.
             *
             * Python2's long was renamed to int.
             *
             * Python2's sys.maxint = 9223372036854775807
             * factors = 43-46   →    9419588158802421600
             */
            function getFactors() {
                let n = $("#n")[0];
                let m = $('ins');
                if (n) {
                    let factors = n.value;
                    let mcolor = factors > 46 ? "red" : "green";
                    for ( i of m ) {
                        i.style.color = mcolor;
                    }
                    // python runs on the server, and javascript on the browser
                    $.ajax({
                        type: "GET",
                        url: "./functions.py",
                        data: factors,
                    })
                        .done(function(factors) {
                            $("#prod").html(`${factors}`);
                            let lcmValue = factors.split(" = ")[0];
                            let bits = Math.trunc(Math.log2(lcmValue)) + 1
                            let decs = Math.trunc(Math.log10(lcmValue)) + 1
                            $("#range").html(`(${bits} bits or ${decs} digits)`);
                        })
                        .fail(function() {
                            console.log("Could not get data");
                        });
                    $("#i1").html((n.valueAsNumber+1).toString());
                    $("#i").html(n.valueAsNumber.toString());
                }
            }
            getFactors();
        </script>

        </body>
        </html>
        """)


if __name__ == "__main__":
    sys.exit(main())
