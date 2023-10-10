#!/usr/bin/env python
# coding: UTF-8
#
## @package data2
#
# @author Paulo Roma
# @since 04/11/2021
#

import openpyxl

book = openpyxl.load_workbook(r'students.xlsx')

sheet = book["Marks"]

# just the cell’s value
for row in sheet.iter_rows(min_row=1, max_row=5, values_only=True):
    print(row)


print(sheet["A10"].value)
