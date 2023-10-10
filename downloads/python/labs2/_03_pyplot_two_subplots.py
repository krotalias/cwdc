#!/usr/bin/env python
#
## @package _03_pyplot_two_subplots
#
#  A matplotlib example.
#
#  @author Paulo Roma
#  @since 04/08/2009
#  @see http://matplotlib.sourceforge.net/users/pyplot_tutorial.html

import numpy as np
try:
    import matplotlib.pyplot as plt
except:
    import matplotlib.pylab as plt

def f(t):
    return np.exp(-t) * np.cos(2 * np.pi * t)


# evenly sampled time at 0.1 intervals
t1 = np.arange(0.0, 5.0, 0.1)
# evenly sampled time at 0.02 intervals
t2 = np.arange(0.0, 5.0, 0.02)

plt.figure(1)                        # the first figure
plt.subplot(211)                     # the first subplot in the first figure
plt.plot(t1, f(t1), 'bo', t2, f(t2), 'k')  # blue balls
plt.title('exp(-t) cos(2pi*t)')      # subplot 211 title

# make the second subplot in the first figure current
plt.subplot(212)
# red and green dashes
plt.plot(t2, np.exp(-t2), 'r--', t2, np.cos(2 * np.pi * t2), 'g--')
#plt.title('exp(-t) and cos(2pi*t)')  # subplot 212 title

plt.show()
