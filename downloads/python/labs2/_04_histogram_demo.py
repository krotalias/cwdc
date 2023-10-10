#!/usr/bin/env python
#
## @package _04_histogram_demo
#
#  A histogram displays numerical data by grouping data into "bins" of equal width.
#  Each bin is plotted as a bar whose height corresponds to how many data points are in that bin.
#
#  @author Paulo Roma
#  @since 29/10/2016
#  @see http://matplotlib.org/1.2.1/examples/pylab_examples/histogram_demo.html
#  @see https://numpy.org/doc/stable/reference/random/generated/numpy.random.randn.html
#  @see https://matplotlib.org/3.3.3/api/_as_gen/matplotlib.pyplot.hist.html
#  @see https://www.khanacademy.org/math/statistics-probability/displaying-describing-data/quantitative-data-graphs/a/histograms-review
#  @see https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.norm.html

import numpy as np
import matplotlib.mlab as mlab
import matplotlib.pyplot as plt
from scipy.stats import norm

mu, sigma = 100, 15

## Holds a sample (or samples) from the “standard normal” distribution.
x = mu + sigma * np.random.randn(10000)

##  Number of counts in each bin of the histogram
n = 0
##  Left hand edge of each bin
bins = None
## The individual patches used to create the histogram, e.g a collection of rectangles
patches = None

# The histogram of the data
n, bins, patches = plt.hist(x, 50, density=True, facecolor='green', alpha=0.75)

print('n (%d) = \n%s' % (len(n), n))
print('bins (%d) = \n%s' % (len(bins), bins))

# add a 'best fit' line
y = norm.pdf(bins, mu, sigma)
l = plt.plot(bins, y, 'r--', linewidth=1)

plt.xlabel('Smarts')
plt.ylabel('Probability')
plt.title(r'$\mathrm{Histogram\ of\ IQ:}\ \mu=100,\ \sigma=15$')
plt.axis([40, 160, 0, 0.03])
plt.grid(True)

plt.show()
