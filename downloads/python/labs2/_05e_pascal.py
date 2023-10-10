#!/usr/bin/env python
# coding: UTF-8
#
## @package _05e_pascal
#  Showing a range of rows of a Pascal triangle.
#   <pre>
#   0       1                                 C(0,0)
#   1      1 1                            C(1,0)  C(1,1)
#   2     1 2 1                        C(2,0)  C(2,1)  C(2,2)
#   3    1 3 3 1                   C(3,0)  C(3,1)  C(3,2)  C(3,3)
#   4   1 4 6 4 1              C(4,0)  C(4,1)  C(4,2)  C(4,3)  C(4,4)
#   5  1 5 10 10 5 1       C(5,0)  C(5,1)  C(5,2)  C(5,3)  C(5,4)  C(5,5)
#
#      0 1 2  3  4 5
#  </pre>
#
#   @author Paulo Roma
#   @since 26/08/2018
#   @see http://en.wikipedia.org/wiki/Pascal_triangle

import sys
import os
import cgi
form = cgi.FieldStorage()

from math import factorial
try:
    from scipy.special import comb
except:
    from scipy.special import binom as comb

## Class for generating and applying pascal triangles on some applications,
#  such as probability and statistics.
#
class Pascal(object):
    ## Create a binomial array as a list of lines.
    def __init__(self, first_level, last_level, newline='\n', center=True):
        ## first level of the triangle to be shown.
        self.first_level = abs(first_level)
        ## last level of the triangle to be shown.
        self.last_level = abs(last_level)
        self.binomialArray(self.last_level)
        ## whether to center the lines of the triangle.
        self.center = center
        ## string used to signify the end of a line of text and the start of a new one.
        self.lineFeed = newline
        try:
            ## translation table for creating superscript.
            self.superscript = str.maketrans("0123456789", "⁰¹²³⁴⁵⁶⁷⁸⁹")
            ## translation table for creating subscript.
            self.subscript = str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉")
        except:
            self.superscript = {ord(c): ord(t)
                                for c, t in zip(u"0123456789", u"⁰¹²³⁴⁵⁶⁷⁸⁹")}
            self.subscript = {ord(c): ord(t)
                              for c, t in zip(u"0123456789", u"₀₁₂₃₄₅₆₇₈₉")}

    ## Compute n lines of the binomial array.
    #  Complexity is @f$1 + 2\ +\ ...\ +\ n@f$ elements.
    #  This is arithmetic progression that sums to @f${n*(n+1)}\over{2}@f$,
    #  which is in @f$O(n^2)@f$.
    #   <PRE>
    #   0 - 1
    #   1 - 1 1
    #   2 - 1 2 1
    #   3 - 1 3 3 1
    #   4 - 1 4 6 4 1
    #   5 - 1 5 10 10 5 1
    #   </PRE>
    #
    #  @param n number of lines.
    #
    def binomialArray(self, n):
        bc = []  # table of binomial coefficients
        for i in range(n + 1):
            bc.append([0] * (i + 1))
            bc[i][0] = 1
            bc[i][i] = 1
        for i in range(1, n + 1):
            for j in range(1, i):
                bc[i][j] = bc[i - 1][j - 1] + bc[i - 1][j]
        ## Binomial array.
        self.binomial_array = bc

    ## Compute @f$n@f$ choose @f$m@f$ or Combination @f$(n,m)@f$.
    #
    #  @param n number of objects to choose from.
    #  @param m number of places.
    #  @param method how to get the result.
    #  @return @f$C{{n}\choose{m}} = {{n!} \over {(n-m)!\ m!}} = {{n (n-1) ... (n-m+1)} \over {m!}}@f$, number of ways of choosing m objects from n.
    #  @see https://en.wikipedia.org/wiki/Combination
    #  @see https://docs.scipy.org/doc/scipy/reference/tutorial/special.html
    #  @see https://docs.scipy.org/doc/scipy/reference/generated/scipy.special.comb.html#scipy.special.comb
    #
    def binomial_coefficient(self, n, m, method=0):
        if m > n:
            return 0

        if method == 0:
            return self.binomial_array[n][m]
        elif method == 1:
            return factorial(n) // (factorial(m) * factorial(n - m))
        else:
            return comb(n, m, exact=True)

    ## Compute the probability of getting at most @f$x@f$ successes in @f$n@f$ trials,
    #  which is the sum of the first @f$x@f$ terms of the binomial expansion @f$(p+q)^n@f$.
    #
    #  In other words, the probability of obtaining at most @f$x@f$ successes in @f$n@f$ independent trials,
    #  each of which has a probability @f$p@f$ of success, and @f$q = (1-p)@f$ of failure.
    #
    #  That is, if @f$X@f$ denotes the number of successes, it returns:
    #  - @f$P(X \le x) = \sum_{i=0}^{x} {C {{n}\choose{i}}\ p^i\ (1-p)^{n-i}}@f$.
    #
    #  @param p probability of success.
    #  @param n number of trials.
    #  @param x number of successes.
    #  @return the probability of getting at most x successes in n independent trials.
    #  @see https://www.khanacademy.org/math/ap-statistics/probability-ap/probability-multiplication-rule/v/getting-at-least-one-heads
    #  @see http://www.wolframalpha.com/widgets/view.jsp?id=d821210668c6cc5a02db1069cc52464f
    #  @see https://mat.iitm.ac.in/home/vetri/public_html/statistics/binomial.pdf
    #  @see https://www.khanacademy.org/math/statistics-probability/random-variables-stats-library/binomial-random-variables/v/visualizing-a-binomial-distribution
    #
    def binomial_cumulative_distribution(self, p, n, x=None):
        if n == 0:
            return 1
        if x is None:
            x = n
        if x > n:
            return 0
        if p < 0 or p > 1:
            return 0
        q = 1.0 - p
        value = 0
        for i in range(0, x + 1):
            value += self.binomial_coefficient(n, i) * p**(n - i) * q**i
        return value

    ## Return a superscript string for the given value.
    #
    #  @param val a numeric string.
    #  @param type select the superscript method.
    #  @return a new superscript string.
    #
    def exponent(self, val, type=False):
        if type:
            return '<sup>' + val + '</sup>'
        elif self.superscript is not None:
            if isinstance(val, bytes):
                val = unicode(val, 'utf-8')
            return val.translate(self.superscript)
        else:
            return '^' + val

    ## Compute the binomial expansion of @f$(x+y)^n@f$.
    #
    #  For e = 5, return: <br>
    #  - @f$x^5 + 5x^4y + 10x^3y^2 + 10x^2y^3 + 5xy^4 + y^5@f$ (html)
    #  - x⁵ + 5x⁴y + 10x³y² + 10x²y³ + 5xy⁴ + y⁵ (unicode translation table)
    #  - x^5 + 5x^4y + 10x^3y^2 + 10x^2y^3 + 5xy^4 + y^5 (None)
    #
    #  @param e exponent n.
    #  @param html exponent creation method. True for html.
    #  @return a string representing the expansion.
    #  @see https://www.khanacademy.org/math/precalculus/prob-comb/prob-combinatorics-precalc/v/exactly-three-heads-in-five-flips
    #  @see https://www.khanacademy.org/math/precalculus/prob-comb/combinations/v/combination-formula
    #  @see https://www.khanacademy.org/math/statistics-probability/random-variables-stats-library/binomial-random-variables/v/binomial-distribution
    #
    def binomial_expansion(self, e, html=False):
        if e == 0:
            return '1'
        bstr = ''
        s = str(e)
        bstr = 'x'
        if s != '1':
            bstr += self.exponent(s, html)
        bstr += ' + '
        for i in range(1, e):
            sx = str(e - i)
            sy = str(i)
            b = str(self.binomial_coefficient(e, i))
            bstr += b + 'x'
            if sx != '1':
                bstr += self.exponent(sx, html)
            bstr += 'y'
            if sy != '1':
                bstr += self.exponent(sy, html)
            bstr += ' + '
        bstr += 'y'
        if s != '1':
            bstr += self.exponent(s, html)
        return bstr

    ##
    #   Computes the next row of a Pascal triangle, given the current row.
    #
    #   @param curr_row current row.
    #   @return next_row: list(map(sum, zip([0] + curr_row, curr_row + [0])))
    #
    def getNextRow(self, curr_row):
        # 1 on the left side
        next_row = [1]
        for i in range(1, len(curr_row)):
            next_row += [curr_row[i - 1] + curr_row[i]]     # sum of parents
        next_row += [1]

        return next_row

    ##
    #   Formats a row of the Pascal triangle.
    #
    #   @param r           row to be printed.
    #   @param pad         whether to pad the row with blanks to the left.
    #   @return string representing the row.
    #
    def fmtRow(self, r, pad=True):
        # adds some blanks for getting the triangle shape
        txt = ' ' * (self.last_level - len(r) + 2) if pad else ''
        txt += ' '.join(map(str, r))                          # show it
        return txt.rstrip()

    ##
    #   Creates the pascal triangle between two levels.
    #
    #   @return a string with the lines of this pascal triangle.
    #   @see https://www.cut-the-knot.org/arithmetic/combinatorics/PascalTriangleProperties.shtml
    #   @see https://www.johndcook.com/blog/2016/07/05/distribution-of-numbers-in-pascals-triangle/
    #
    def __repr__(self):
        # the sum of numbers in each line is 2**n
        ndig = len(str(2**self.last_level)) + 1
        # therefore, it is an upper estimate for the number of digits
        maxlen = (self.last_level + 1) * ndig
        if self.last_level > 11:
            maxlen -= 4 * (ndig + 1)

        st = ""
        row = [1]                            # Top of Pascal triangle
        # level begins at "0"
        for l in range(self.last_level + 1):
            # l is now in the range [first_level, last_level].
            if l >= self.first_level:
                if self.center:
                    st += self.fmtRow(row, False).center(maxlen) + \
                        self.lineFeed
                else:
                    st += self.fmtRow(row) + self.lineFeed
            row = self.getNextRow(row)       # new row
        return st

    ##
    #   Creates the pascal triangle between two levels, using the binomial array.
    #   The lines are centered in respect to the last line of the triangle.
    #
    #   @return a string with the lines of this pascal triangle.
    #
    def __str__(self):
        st = ""
        ba = self.binomial_array
        # get length of last line
        lenmax = len(' '.join(map(str, ba[self.last_level])))
        for i in range(self.first_level, self.last_level + 1):
            if self.center:
                st += self.fmtRow(ba[i], False).center(lenmax) + self.lineFeed
            else:
                st += self.fmtRow(ba[i]) + self.lineFeed
        return st

## Main function for testing.
#
#  @param argv command line arguments.
#  - argv[0]: script name.
#  - argv[1]: first level.
#  - argv[2]: last level.
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    newline = '\n'

    HTML = 'REQUEST_METHOD' in os.environ

    try:
        if (len(argv) > 2):
            first_level = int(argv[1])
            last_level = int(argv[2])

        else:
            first_level, last_level = eval(str(input(
                "Enter first and last levels of Pascal triangle, separated by ',': ")), {}, {})
    except Exception as e:
        print("Invalid values. %s. Assuming 3,12" % e)
        first_level = 3
        last_level = 12

    if HTML:
        newline = '<br>'
        print('Content-type: text/html')
        print('')
        print('<title> Pascal </title>')
        # html suppresses spaces
        print("<pre>")
        print("<code>")
        if "flevel" in form and "llevel" in form:
            flevel = form.getvalue("flevel")
            llevel = form.getvalue("llevel")
            try:
                first_level = int(flevel)
                last_level = int(llevel)
            except ValueError as e:
                print('Please enter a whole number' + newline)
                first_level = 0
                last_level = 12
        else:
            first_level = 0
            last_level = 12
            flevel = '0'
            llevel = '12'

    pascal = Pascal(first_level, int(last_level), newline)
    print("This is str(pascal):%s%s" % (newline, pascal))

    print("%sThe mean of the coefficients of the last row is: %f" %
          (newline, 2**last_level / float(last_level + 1)))

    pascal2 = Pascal(first_level, last_level, newline)
    print("This is repr(pascal2):%s%r" % (newline, pascal2))

    for i in range(last_level + 1):
        print(pascal.binomial_expansion(i, HTML))

    # in general, head is associated with success and tail to fail.
    heads = first_level
    flips = last_level
    print("Probability of getting at most %d heads in %d flips is: %f%s" % (
        heads, flips, pascal.binomial_cumulative_distribution(0.5, flips, heads), newline))

    if HTML:
        print("</code>")
        print("</pre>")
        message = "What are the first and last levels of the Pascal triangle?"

        print('<title> Pascal Triangle </title>')
        print('<h1>Pascal Triangle</h1>')
        print("<p>" + message + "</p>")
        # When the parameter action is not specified, the data is sent to the page that contains the form
        print('<form method="post">')
        print('<input type="text" name="flevel" value = "' +
              flevel + '" autofocus>')
        print('<input type="text" name="llevel" value = "' +
              llevel + '" autofocus>')
        print('<input type="submit" value="Pascalize!">')
        print('</form>')
        # Blocks the pop up asking for form resubmission on refresh once the form is submitted.
        # Just place this javascript code at the footer of your file and see the magic.
        print("<script> \
                    if ( window.history.replaceState ) { \
                        window.history.replaceState( null, null, window.location.href ); \
                    } \
                </script>")


if __name__ == "__main__":
    sys.exit(main())
