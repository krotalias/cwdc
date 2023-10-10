#!/usr/bin/env python
# coding: UTF-8
#
## @package data
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
# @since 04/11/2021
# @see <a href="/python/provas/AP1X_PI_22_1.pdf">doc</a>
# @see <a href="/python/labs2/pandas/students.xlsx">planilha</a>
# @see https://divisbyzero.com/2008/12/22/how-to-curve-an-exam-and-assign-grades/
# @see https://www.dataquest.io/blog/excel-and-pandas/
# @see https://www.youtube.com/watch?v=6qo3ly3-_I8&t=1342s
# @see https://support.apple.com/guide/numbers/insert-formulas-and-functions-tan727173a8/mac
# @see https://www.zamzar.com
#
from __future__ import print_function
import sys
import getopt
import pandas as pd
import matplotlib.pyplot as plt

from bell import plot, plot2, plot3, showPlot
from math import sqrt

## Read the spreadsheet.
#
# @return data frame and subject list.
# @see https://pandas.pydata.org/docs/reference/api/pandas.read_excel.html
#
def readSheet():
    # create a data frame
    try:  # python2
        df = pd.read_excel(r'students.xls', sheet_name='Marks', engine='xlrd')
    except (ValueError, OSError, IOError):
        try:
            df = pd.read_excel(r'students.xlsx', sheet_name='Marks',
                               engine="openpyxl")
        except (ValueError, OSError, IOError) as e:
            print(e)
            exit(1)

    return df, list(filter(lambda col: df[col].dtypes == "int64", list(df)))[:-1]

## Change numerical grades for letters.
#
#  @param df data frame.
#  @param subjects list of subject names.
#  @return new GPA data frame.
#
def toGPA(df, subjects):
    dfg = df.copy()
    for col in dfg:
        if dfg[col].name in subjects:
            dfg[col] = pd.cut(x=dfg[col],
                              bins=[0, 60, 63.3, 66.7, 70, 73.3, 76.7,
                                    80, 83.3, 83.7, 90, 93.3, 93.7, 100.1],
                              labels=['F', 'D-', 'D', 'D+', 'C-', 'C',
                                      'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'],
                              right=False)

    return dfg

## Main program for plotting the curve.
#
# @param argv command line arguments
# - h help
# - s subject
# - c class
# - g minimum grade
# - f curve
# - v verbose mode (plot graphics)
#
# Usage:
#  - data.py -s Maths -c B -v -f sqrt
#  - data.py --subject Literature --class=C --grade=87
#
# @see https://divisbyzero.com/2008/12/22/how-to-curve-an-exam-and-assign-grades/
# @see https://matplotlib.org/3.5.0/api/_as_gen/matplotlib.pyplot.subplots_adjust.html
# @see https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.sort_values.html
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    print("pandas - {}".format(pd.__version__))

    dic_curve = {'sqrt': [(lambda x: 10 * sqrt(x)), u'10 × √ \u0305n\u0305o\u0305t\u0305a\u0305'],
                 'high': [None, None],
                 'linear': [None, None]
                 }

    subject = 'Geography'
    Class = 'A'
    show = False
    mingrade = 64.0
    target_mean = 80.0
    curve = 'sqrt'

    df, subjects = readSheet()
    print('Grade spreadsheet')
    print(df)
    print()

    try:
        try:
            # options that require an argument should be followed by a colon (:).
            # Long options, which require an argument should be followed by an equal sign ('=').
            opts, args = getopt.getopt(
                argv[1:], "hs:c:g:f:v", ["help", "subject=", "class=", "grade=", "function=", "verbose"])
        except getopt.GetoptError as msg:
            raise ValueError(str(msg))
        # opts is an option list of pairs [(option1, argument1), (option2, argument2)]
        # args is the list of program arguments left after the option list was stripped
        # for instance, "move.py -h --help 1 2", sets opts and args to:
        # [('-h', ''), ('--help', '')] ['1', '2']
        # something such as [('-h', '')] or [('--help', '')]
        for opt, arg in opts:
            if opt in ("-h", "--help"):
                print(
                    "Usage {} -s <subject> -c <class> -g <grade> -v".format(argv[0]))
                print()
                print("Subjects = {}".format(subjects))
                return 1
            elif opt in ("-s", "--subject"):
                if arg in subjects:
                    subject = arg
                else:
                    print("Invalid Subject '{}'".format(arg))
                    raise ValueError
            elif opt in ("-f", "--function"):
                if arg in dic_curve.keys():
                    curve = arg
                else:
                    print("Invalid Function '{}'".format(arg))
                    raise ValueError
            elif opt in ("-c", "--class"):
                if arg in ['A', 'B', 'C']:
                    Class = arg
                else:
                    print("Invalid Class '{}'".format(arg))
                    raise ValueError
            elif opt in ("-g", "--grade"):
                mingrade = min(max(float(arg), 0), 100)
            elif opt in ("-v", "--verbose"):
                show = True
    except ValueError as err:
        print(str(err) + "\nFor help, type: %s --help" % argv[0])
        return 2

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

    # set the number of decimal places for float values
    pd.options.display.float_format = "{:,.1f}".format

    # filter subject grades > mingrade
    results = df.loc[df[subject] > mingrade]
    print("{} > {}".format(subject, mingrade))
    print(results)
    print()

    # all students in class Class
    results = df[df['Class'].str.match(Class)]
    print('Students in Class {}'.format(Class))
    print(results)
    print()

    # all students with a 2 digit: 2, 12, 22 ...
    results = df[df['Students'].str.contains('2')]
    print('Students with a 2 digit')
    print(results)
    print()

    # group by Class
    results = df.groupby('Class')

    results = results.get_group(Class).mean(numeric_only=True)
    print('Mean Grouped by Class {}'.format(Class))
    print(results)
    print()

    fig, (ax_raw, ax_adj) = plt.subplots(2)

    # set the spacing between subplots
    plt.subplots_adjust(left=0.1,
                        bottom=0.1,
                        right=0.9,
                        top=0.9,
                        wspace=0.4,
                        hspace=0.6)

    # plot the subject curve
    grades = df[subject]
    plot(grades, 'nota', 'densidade de probabilidade')
    plot2(grades, 'Grades')

    # get the gpa data frame
    dfgpa = toGPA(df, subjects)
    print(dfgpa)
    print()

    # plot GPA histogram
    plot3(dfgpa[subject], 'Raw Score',
          'GPA - ' + subject, 'Frequency - Number of students', fig=fig, ax=ax_raw)

    # apply a curve
    gradesAdjusted = df[subject].apply(dic_curve[curve][0])
    # replace the subject column of the data frame for the adjusted values
    df[subject] = gradesAdjusted
    # reset total column
    df['Total'].values[:] = 0
    # for each row, sum all columns
    df['Total'] = df.sum(axis=1, numeric_only=True)
    # get the adjusted gpa data frame
    dfgpa = toGPA(df, subjects)

    # plot the adjusted GPA histogram
    plot3(dfgpa[subject], dic_curve[curve][1], 'GPA - {} adjusted'.format(subject),
          'Frequency - Number of students', fig=fig, ax=ax_adj)

    plot(gradesAdjusted, dic_curve[curve][1], 'densidade de probabilidade')
    plot2(gradesAdjusted, 'Grades Adjusted')

    print('Applied curve {}'.format(curve))
    print(gradesAdjusted)
    print()

    print(df)
    print()

    print(dfgpa)
    print()

    # draw
    showPlot(show)

    # write to another workbook
    dfgpa.to_excel(r'gpa.xlsx', sheet_name='gpa')


if __name__ == "__main__":
    sys.exit(main())
