#!/usr/bin/env python
# coding: UTF-8
#
## @package air
#
#  How to replace VBA with Python: OpenPyxl, Pandas, xlWings
#  - py39-xlrd
#  - py39-xlsxwriter
#  - py39-openpyxl
#
# @author Paulo Roma
# @since 07/11/2021
# @see https://www.datacamp.com/community/tutorials/moving-averages-in-pandas
# @see https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.iloc.html
# @see https://archive.ics.uci.edu/ml/datasets/air+quality
#
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import datetime

print('\nAir quality dataset\n')

df = pd.read_csv("AirQualityUCI/AirQualityUCI.csv", sep=";", decimal=",")
df = df.iloc[:, 0:14]
print(df.head())
print()

# there are around 114 NaN values across all columns,
# however you will figure out that they are all at the end of the time-series,
# so let's quickly drop them.

print('\nReplace Null values for 0\n')

df.dropna(inplace=True)
print(df.isna().sum())
print()

print('\nCumulative moving average on the Temperature column (T)\n')
# so let's quickly separate that column out from the complete data.
df_T = pd.DataFrame(df.iloc[:, -2])
print(df_T.head())
print()

print('\nCumulative Moving Average\n')

# use the pandas expanding method fo find the cumulative average of the above data.
# Unlike the simple moving average,
# the cumulative moving average considers all of
# the preceding values when calculating the average.
df_T['CMA_4'] = df_T.expanding(min_periods=4).mean()
print(df_T.head(10))

df['DateTime'] = (df.Date) + ' ' + (df.Time)
df.DateTime = df.DateTime.apply(
    lambda x: datetime.datetime.strptime(x, '%d/%m/%Y %H.%M.%S'))

df_T.index = df.DateTime
plt.figure(figsize=[15, 10])
plt.grid(True)
plt.plot(df_T['T'], label='temperature')
plt.plot(df_T['CMA_4'], label='CMA_4')
plt.legend(loc=2)

plt.show()

print('\nExponential Moving Average\n')

df_T['EMA'] = df_T.iloc[:, 0].ewm(span=40, adjust=False).mean()
print(df_T.head())

plt.figure(figsize=[15, 10])
plt.grid(True)
plt.plot(df_T['T'], label='temperature')
plt.plot(df_T['CMA_4'], label='CMA_4')
plt.plot(df_T['EMA'], label='EMA')
plt.legend(loc=2)

plt.show()
