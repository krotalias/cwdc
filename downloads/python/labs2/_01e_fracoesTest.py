#!/usr/bin/env python
# coding: UTF-8
#
## @package _01e_fracoesTest
#
#  Class for testing Fracoes.
#
#  @author Paulo Roma
#  @since 08/09/2020
#  @see https://docs.python.org/3/library/unittest.html
#

from _01e_fracoes import Fracoes, Fracao
import sys
import unittest
import contextlib

##
# Class for testing certain aspects of the behavior of
# the Fracoes.
#
class FracaoTest(unittest.TestCase):
    ##
   # Two fraction objects to be used in the tests.
   #
   # setUp is executed before EVERY test is run.
   #
    def setUp(self):
        self.f1 = Fracao(15, 45)
        self.f2 = Fracao(50, 75)
        # no printing messages during reading file
        with contextlib.redirect_stdout(None):
            self.f3 = Fracoes("fracoes.txt")

    def test_str(self):
        self.assertEqual(str(self.f3), "Soma: 11801/840\nProduto: 15/98\n")

    def test_repr(self):
        fr = map(str, self.f3.lfracoes)
        sf = ['Fracao %d: ' % i for i in range(len(self.f3.lfracoes))]
        self.assertEqual(repr(self.f3), ''.join(
            [i + j + '\n' for (i, j) in list(zip(sf, fr))]))

    def test_eq(self):
        self.assertEqual(str(self.f1), '1/3')
        self.assertEqual(str(-self.f1), '-1/3')
        self.assertEqual(str(self.f2), '2/3')
        self.assertEqual(str(-self.f2), '-2/3')
        self.assertFalse(self.f1 == self.f2)

    def test_reduce(self):
        Fracao(self.f1.num * 6, self.f1.den * 6) == self.f1
        Fracao(self.f2.num * 67, self.f2.den * 67) == self.f2

    def test_rdiv(self):
        self.assertEqual(2 / self.f1, Fracao(6, 1))
        self.assertEqual(2 // self.f1, Fracao(6, 1))
        self.assertFalse((1 / self.f1 - Fracao(3, 1)).num)

    def test_rop(self):
        self.assertTrue(2 * self.f1 == self.f2)
        self.assertEqual(2 + self.f1, Fracao(7, 3))
        self.assertEqual(2 - self.f1, Fracao(5, 3))
        self.assertEqual(2 * self.f1, Fracao(2, 3))

    def test_add(self):
        self.assertEqual(self.f1 + self.f2, Fracao(1))
        self.assertEqual(self.f1 + 2, Fracao(7, 3))

    def test_iadd(self):
        self.f1 += self.f2
        self.assertEqual(self.f1, Fracao(1))
        self.f1 += 2
        self.assertEqual(self.f1, Fracao(3))

    def test_sub(self):
        self.assertEqual(self.f1 - self.f2, Fracao(-1, 3))
        self.assertEqual(self.f1 - 2, Fracao(-5, 3))

    def test_mul(self):
        self.assertEqual(self.f1 * self.f2, Fracao(2, 9))
        self.assertEqual(self.f1 * 2, Fracao(2, 3))
        self.assertTrue(self.f1 * 2 == self.f2)

    def test_div(self):
        self.assertEqual(self.f1 / self.f2, Fracao(1, 2))
        self.assertEqual(self.f1 // self.f2, Fracao(1, 2))
        self.assertEqual(self.f1 / 2, Fracao(1, 6))

    def test_getitem(self):
        self.assertEqual(self.f3[2], Fracao(1, 4))

    def test_setitem(self):
        self.f3[2] = Fracao(3, 5)
        self.assertEqual(self.f3[2], Fracao(3, 5))

    def test_zeroden_Exception(self):
        with self.assertRaises(ValueError):
            Fracao(5, 0)

    def test_float_Exception(self):
        with self.assertRaises(TypeError):
            Fracao(5, 3) * 2.3

    def test_ioerror_Exception(self):
        with self.assertRaises(IOError):
            Fracoes('abc')


if __name__ == "__main__":
    unittest.main()
