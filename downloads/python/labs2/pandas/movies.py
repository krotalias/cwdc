#!/usr/bin/env python
# coding: UTF-8
#
## @package movies
#
# Pandas is not a replacement for Excel. Both tools have their place in
# the data analysis workflow and can be very great companion tools.
#
# As we will demonstrate, pandas can do a lot of complex data analysis and manipulations,
# which depending on your need and expertise, can go beyond what you can achieve,
# if you are just using Excel.
#
# One of the major benefits of using Python and pandas over Excel is that
# it helps you automate Excel file processing by writing scripts and integrating
# with your automated data workflow.
#
# Pandas also has excellent methods for reading all kinds of data from Excel files.
# You can export your results from pandas back to Excel too,
# if that’s preferred by your intended audience.
#
# On the other hand, Excel is a such a widely used data tool, it’s not a wise to ignore it.
# Acquiring expertise in both pandas and Excel and making them work together gives you skills
# that can help you stand out in your organization.
#
#  @author Paulo Roma
#  @since 05/11/2021
#  @see https://www.dataquest.io/blog/excel-and-pandas/
#

import pandas as pd
import matplotlib.pyplot as plt

excel_file = 'movies.xls'
movies = pd.read_excel(excel_file)

# display first five rows of our DataFrame.
print(movies.head())

# display the bottom five rows.
print(movies.tail())

# read the first sheet in a DataFrame.
# pandas automatically assign a numeric index or row
# (or col) label starting with zero.
movies_sheet1 = pd.read_excel(excel_file, sheet_name=0, index_col=0)
print(movies_sheet1.head())

# With ExcelFile, you only need to pass the Excel file once,
# and then you can use it to get the DataFrames.
xlsx = pd.ExcelFile(excel_file)
movies_sheets = []
for sheet in xlsx.sheet_names:
    movies_sheets.append(xlsx.parse(sheet))
movies = pd.concat(movies_sheets)

# the number of rows and columns.
print(movies.shape)

# in Excel, you’re able to sort a sheet based on the values in one or more columns.
# In pandas, you can do the same thing with the sort_values method.
sorted_by_gross = movies.sort_values(['Gross Earnings'], ascending=False)
# display the top 10 movies by Gross Earnings.
sorted_by_gross = sorted_by_gross["Gross Earnings"].head(10)
print(sorted_by_gross)

# draw a horizontal bar plot.
sorted_by_gross.plot(kind="barh")
plt.show()

# create a histogram of IMDB Scores to check the distribution
# of IMDB Scores across all movies.
movies['IMDB Score'].plot(kind="hist")
plt.show()

# get a statistical summary of the data set.
# the count or number of values:
# - mean
# - standard deviation
# - minimum, maximum
# - 25%, 50%, and 75% quantile
print(movies.describe())
