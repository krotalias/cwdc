#!/opt/local/bin/python3
# coding: UTF-8
#
## @package showpng
#
#  How to replace VBA with Python: OpenPyxl, Pandas, xlWings
#
#  MacOS:
#  - py310-xlrd
#  - py310-openpyxl
#  - py27-xlrd
#  - py27-xlsxwriter
#
#  Ubuntu:
#  - python3-xlrd
#  - python3-openpyxl
#  - python-xlrd
#  - python-xlsxwriter
#
# @author Paulo Roma
# @since 04/04/2022
# @see <a href="/python/provas/AP1X_PI_22_1.pdf">doc</a>
# @see <a href="/python/labs2/pandas/students.xlsx">planilha</a>
# @see https://divisbyzero.com/2008/12/22/how-to-curve-an-exam-and-assign-grades/
# @see https://www.dataquest.io/blog/excel-and-pandas/
# @see https://www.youtube.com/watch?v=6qo3ly3-_I8&t=1342s
# @see https://support.apple.com/guide/numbers/insert-formulas-and-functions-tan727173a8/mac
# @see https://www.zamzar.com
#

import os
import sys
import cgitb
import numpy as np
from math import sqrt

# set HOME environment variable to a directory the httpd server can write to
os.environ['HOME'] = '/tmp/'
os.environ['MPLCONFIGDIR'] = '/tmp/'

import matplotlib
# chose a non-GUI backend
matplotlib.use('Agg')

import matplotlib.pyplot as plt

try:
    sys.path.append(os.environ.get("DOCUMENT_ROOT") +
                    '/cwdc/downloads/python/labs2/pandas')
except TypeError:
    sys.path.insert(0, os.path.expanduser(
        "~roma") + "/html/python/labs2/pandas")
from bell import plot, plot2, plot3, showPlot
from data import readSheet, toGPA

## Main function for testing.
#
#  @param argv command line arguments.
#  - argv[0]: script name.
#  - argv[1]: subject.
#  - argv[2]: action.
#  - argv[3]: curve.
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    cgitb.enable()

    print("Content-type: image/png\n")
    sys.stdout.flush()

    dic_curve = {'sqrt': [(lambda x: 10 * sqrt(x)), u'10 × √ \u0305n\u0305o\u0305t\u0305a\u0305'],
                 'high': [None, None],
                 'linear': [None, None]
                 }

    df, subjects = readSheet()

    subject = 'Maths'
    action = 'gpa'
    mingrade = 64.0
    target_mean = 80.0
    curve = 'sqrt'

    if len(argv) >= 4:
        if argv[1] in subjects:
            subject = argv[1]
        if argv[2] in ('gpa', 'grades', 'bell', 'curve'):
            action = argv[2]
        if argv[3] in dic_curve.keys():
            curve = argv[3]

    # higher grade goes to 100.0
    H = max(df[subject])
    # mean goes to target_mean
    x0, y0 = df[subject].mean(), target_mean
    # lower grade goes to mingrade
    x1, y1 = min(df[subject]), mingrade
    dic_curve['high'][0] = lambda x: 100 * x / H
    dic_curve['high'][1] = '100 * nota / {}'.format(H)
    dic_curve['linear'][0] = (
        lambda x: min(y0 + (y1 - y0) / (x1 - x0) * (x - x0), 100))
    dic_curve['linear'][1] = '{:.1f} + {:.1f} * (nota - {:.1f})'.format(y0,
                                                                        (y1 - y0) /
                                                                        (x1 - x0),
                                                                        x0)

    if action == 'grades':
        # plot the subject curve
        grades = df[subject]
        plot2(grades, 'Grades')
    elif action == 'curve':
        # plot the subject curve
        grades = df[subject]
        plot(grades, 'nota', 'densidade de probabilidade')
    elif action == 'gpa':
        fig, (ax_raw, ax_adj) = plt.subplots(2)

        # set the spacing between subplots
        plt.subplots_adjust(left=0.1,
                            bottom=0.1,
                            right=0.9,
                            top=0.9,
                            wspace=0.4,
                            hspace=0.6)

        dfgpa = toGPA(df, subjects)
        grades = dfgpa[subject]
        # plot GPA histogram
        plot3(grades, 'Raw Score - ' + subject, 'GPA - ' + subject,
              'Frequency - Number of students', fig=fig, ax=ax_raw)

        # apply a curve
        gradesAdjusted = df[subject].apply(dic_curve[curve][0])
        # replace the subject column of the data frame for the adjusted values
        df[subject] = gradesAdjusted
        # reset total column
        df['Total'].values[:] = 0
        # for each row, sum all columns
        df['Total'] = df.sum(axis=1, numeric_only=True)
        dfgpa = toGPA(df, subjects)
        # plot the adjusted GPA histogram
        plot3(dfgpa[subject], dic_curve[curve][1], 'GPA adjusted',
              'Frequency - Number of students', fig=fig, ax=ax_adj)
    elif action == 'bell':
        # construct your plot
        x = np.random.randn(2000)
        plot2(x, "{} {} values".format(len(x), 'random'))

    # save the plot as a png and output directly to webserver
    showPlot(False, sys.stdout)


if __name__ == "__main__":
    sys.exit(main())
