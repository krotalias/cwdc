#!/usr/bin/env python
# coding: UTF-8
#
## @package calcTest
#
#  Class for testing the Calculator.
#
#  @author Paulo Roma
#  @since 23/08/2021
#  @see https://docs.python.org/2/library/unittest.html
#

from _02f_rational import getInterest, CF, priceTable, setDownPayment
import sys
import unittest

##
# Class for testing certain aspects of the behavior of
# the calculator.
#
class CalcTest(unittest.TestCase):
    ##
    # setUp is called automatically before every test is executed.
    #
    def setUp(self):
        setDownPayment(False)

    ## Test getInterest.
    def testTaxa(self):
        """_02f_rational.py -n 96 -t 0 -x 134788.8 -y 63816.24"""

        t, iter = getInterest(134788.8, 63816.24, 96)
        self.assertEqual(round(t, 4), 1.8052)

    ## Test priceTable.
    def testPriceTable(self):
        """_02f_rational.py -n 12 -t 0 -x 134788.8 -y 63816.24 -v"""

        np = 12
        pp = 134788.8
        pv = 63816.24
        t, iter = getInterest(pp, pv, np)
        t *= 0.01
        cf = CF(t, np)
        pmt = pv * cf
        pt = priceTable(np, pv, t, pmt)

        table = [['Mês', 'Prestação', 'Juros', 'Amortização', 'Saldo Devedor'],
                 [1,  11232.400178356344, 8880.06618026338,   2352.333998092963,  61463.90600190703],
                 [2,  11232.400178356344, 8552.737563266373,  2679.66261508997,   58784.24338681706],
                 [3,  11232.400178356344, 8179.860982590724,  3052.5391957656193, 55731.704191051445],
                 [4,  11232.400178356344, 7755.098413121783,  3477.3017652345607, 52254.40242581689],
                 [5,  11232.400178356344, 7271.229889936626,  3961.1702884197175, 48293.23213739717],
                 [6,  11232.400178356344, 6720.030785876906,  4512.369392479438,  43780.86274491774],
                 [7,  11232.400178356344, 6092.132012225994,  5140.2681661303495, 38640.594578787386],
                 [8,  11232.400178356344, 5376.8607662306395, 5855.539412125704,  32785.05516666168],
                 [9,  11232.400178356344, 4562.059118549473,  6670.34105980687,   26114.71410685481],
                 [10, 11232.400178356344, 3633.8773570415374, 7598.522821314806,  18516.191285540008],
                 [11, 11232.400178356344, 2576.5385742251715, 8655.861604131172,  9860.329681408835],
                 [12, 11232.400178356344, 1372.0704969475762, 9860.329681408768,6.730260793119669e-11],
                 ['Total', 134788.80214027612, 70972.56214027619, 63816.23999999995, 0]]

        self.assertEqual(pt, table)

    ## Another test.
    # def test...


if __name__ == "__main__":
    unittest.main()
