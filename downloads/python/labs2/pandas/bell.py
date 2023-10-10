#!/usr/bin/env python
# coding: UTF-8
#
## @package bell
#
# How to Make a Bell Curve in Python?
#
# A bell-shaped curve in statistics corresponds to a normal distribution or
# a Gaussian distribution which has been named after German mathematician Carl Friedrich Gauss. <br>
# In a normal distribution, the points are concentrated on the mean values and most of the points lie near the mean.
#
# The orientation of the bell-curve depends on the mean and standard deviation values of a given set of input points. <br>
# By changing the value of the mean we can shift the location of the curve on the axis and the shape of the curve
# can be manipulated by changing the standard deviation values.
#
# In a normal distribution, mean, median, and mode are all equal and the bell-shaped curve is symmetric about the mean i.e., the y-axis.
#
# The probability density function for a normal distribution is calculated using the formula:
#
# \f$f(x,\mu,\sigma) = {{1} \over {\sigma \sqrt{2\pi}}} \exp^{{{-1} \over{2}} \times {\left({{x-\mu} \over {\sigma}}\right)}^{2}},\ -\infty < x < \infty\f$
# - f(x) is the probability density function.
# - &mu; is the mean.
# - &sigma; is the standard deviation.
#
# Packages required:
# macOS:
#  - py310-numpy
#  - py310-matplotlib
#
# Ubuntu:
# - python3-numpy
# - python3-matplotlib
#
# @author Paulo Roma
# @since 24/03/2022
# @see https://www.geeksforgeeks.org/how-to-make-a-bell-curve-in-python/
# @see https://www.statology.org/bell-curve-google-sheets/
# @see https://trumpexcel.com/bell-curve/
# @see https://www.automateexcel.com/charts/bell-curve-plot-template/
#
import sys
import os

# Importing packages
import numpy as np
import seaborn as sns
import matplotlib
import matplotlib.pyplot as plt

## A custom function to calculate the
#  probability distribution function.
#
#  @param x list of values.
#  @return function to calculate the y coordinate for each x in the list of values.
#
def pdf(x):
    mean = np.mean(x)
    std = np.std(x)
    y_out = 1 / (std * np.sqrt(2 * np.pi)) * \
        np.exp(- (x - mean)**2 / (2 * std**2))
    return y_out


## Plot the curve by using matplotlib.
#
#  @param x list of values.
#  @param xlabel x axis label.
#  @param ylabel y axis label.
#  @see https://matplotlib.org/3.5.1/api/_as_gen/matplotlib.pyplot.plot.html
#  @see https://matplotlib.org/3.5.1/api/_as_gen/matplotlib.pyplot.scatter.html
#  @see https://numpy.org/doc/stable/reference/generated/numpy.sort.html
#
def plot(x, xlabel="", ylabel=""):
    x = np.sort(x)

    # To generate an array of y-values using corresponding x-values
    y = pdf(x)

    # Plotting the bell-shaped curve
    plt.style.use('seaborn-pastel')
    fig = plt.figure(figsize=(6, 6))
    fig.suptitle('Curve')
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.plot(x, y, color='black', linestyle='dashed', label='gaussiana')
    plt.plot(np.mean(x), 0, marker='s', color='crimson', label=u'média')

    plt.scatter(x, y, marker='o', s=25, color='red',
                label=x.name if hasattr(x, 'name') else "")

    # To fill in values under the bell-curve
    plt.fill_between(x, y, 0, alpha=0.2, color='blue')

    plt.legend(prop={'size': 12})


## Plot the curve by using seaborn.
#
#  @param x list of values (pandas.DataFrame, numpy.ndarray, mapping, or sequence).
#  @param title curve title.
#  @see https://seaborn.pydata.org/generated/seaborn.histplot.html
#  @see https://seaborn.pydata.org/generated/seaborn.boxplot.html
#  @see https://seaborn.pydata.org/generated/seaborn.distplot.html
#
def plot2(x, title=""):
    sns.set(style="ticks")
    fig, (ax_box, ax_hist) = plt.subplots(2, sharex=True,
                                          gridspec_kw={"height_ratios": (.15, .85)})
    sns.boxplot(data=x, ax=ax_box, showmeans=True, orient='h')
    fig.suptitle(title)
    try:
        sns.histplot(data=x, ax=ax_hist, kde=True, stat="density", linewidth=1)
        sns.rugplot(x=x)
    except:
        p = sns.distplot(x, ax=ax_hist, kde=True, rug=True,
                         bins=5, hist_kws={"linewidth": 1, "histtype": "bar", "color": "g"}, kde_kws={"lw": 2})
        p.set(xlabel='Value', ylabel='Density')

    ax_box.set(yticks=[])
    sns.despine(ax=ax_hist)
    sns.despine(ax=ax_box, left=True)

## Plot the histogram by using matplotlib.
#
#  @param x list of values.
#  @param title curve title.
#  @param xlabel x axis label.
#  @param ylabel y axis label.
#  @param fig figure containing subplots.
#  @param ax axis for drawing.
#  @see https://matplotlib.org/3.5.1/api/_as_gen/matplotlib.pyplot.hist.html
#
def plot3(x, title="", xlabel="", ylabel="", fig=None, ax=None):
    if ax is None:
        fig = plt.figure()
        ax = plt

    ax.hist(x.sort_values(),
            histtype='barstacked',
            align='left',
            bins=range(len(x.unique()) + 1),
            edgecolor='white',
            linewidth=1)

    ax.set_title(title)
    try:
        ax.set_xlabel(xlabel)
    except AttributeError:
        plt.xlabel(xlabel)
    try:
        fig.supylabel(ylabel)
    except AttributeError:
        fig.text(0.03, 0.5, ylabel, ha='center',
                 va='center', rotation='vertical')

## Draw the graphics.
#
#  @param show whether draw or save the graphics.
#  @param file_name name of the file to save the figure.
#  @see https://matplotlib.org/3.5.1/api/_as_gen/matplotlib.pyplot.show.html
#  @see https://matplotlib.org/3.5.1/api/figure_api.html#matplotlib.figure.Figure.savefig
#
def showPlot(show=True, file_name="bell.png"):
    if show:
        plt.show()
    else:
        plt.savefig(file_name, format='png')

## Main program for plotting the curve.
#
#  @param argv commnad line arguments.
#  - argv[0]: script path.
#  - argv[1]: number of random values.
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    random_data = False
    try:
        n = int(argv[1])
        random_data = True
    except:
        n = 1000

    print("Python {0[0]}.{0[1]}.{0[2]} - Encoding: {1}".format(
        sys.version_info[:3], sys.getdefaultencoding()))  # works with python2
    print("numpy - {}".format(np.version.version))
    print("seaborn - {}".format(sns.__version__))
    print("matplotlib - {}".format(matplotlib.__version__))
    print(sys.path)

    # To generate an array of x-values
    x = np.random.randn(n) if random_data else np.arange(-2, 2, 0.1)
    plot(x, 'value', 'probability density')
    plot2(x, "{} {} values".format(len(x), 'random' if random_data else ""))
    showPlot()


if __name__ == "__main__":
    sys.exit(main())
