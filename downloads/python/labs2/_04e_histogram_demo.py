#!/usr/bin/env python
#
## @package _04e_histogram_demo
#
#  A matplotlib example.
#
#  @author Paulo Roma
#  @since 29/10/2016
#  @see http://stackoverflow.com/questions/33381330/histogram-with-boxplot-above-in-python
#  @see http://matplotlib.org/users/gridspec.html

import numpy as np
import seaborn as sns
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec

sns.set(style="ticks")

x = np.random.randn(100)

if matplotlib.__version__ < '1.5':
	print ( "matplotlib version = %s" % matplotlib.__version__ )
	f=plt.figure(1)
	gs = gridspec.GridSpec(2, 1, height_ratios=[.15,.85])
	ax_hist = plt.subplot(gs[1])
	ax_box  = plt.subplot(gs[0],sharex=ax_hist)
else:
	f, (ax_box, ax_hist) = plt.subplots(2, sharex=True, gridspec_kw={"height_ratios": (.15, .85)})

sns.boxplot(x=x, ax=ax_box, orient='h') # vert=False)
#sns.distplot(x=x, ax=ax_hist)
sns.histplot(x=x, ax=ax_hist, kde=True, stat="density", linewidth=0)

ax_box.set(yticks=[])
sns.despine(ax=ax_hist)
sns.despine(ax=ax_box, left=True)

plt.show()
