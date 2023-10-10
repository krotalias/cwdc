#!/usr/bin/env python
# coding: UTF-8
#
## @package _01b_AgendaTest
#
#  Class for testing the Agenda.
#
#  @author Paulo Roma
#  @since 19/08/2020
#  @see https://docs.python.org/3/library/unittest.html
#

from _01b_Agenda import Agenda
import sys
import unittest

##
# Class for testing certain aspects of the behavior of
# the Agenda.
#
class AgendaTest(unittest.TestCase):
    ##
    # Two Agenda objects to be used in the tests.
    #
    # setUp is executed before EVERY test is run.
    #
    def setUp(self):
        self.a1 = Agenda()
        self.a2 = Agenda()
        self.assertFalse(str(self.a2))  # bool('') is False

        self.a1.putPhone("Tony Stark", ['2274-4635'])
        self.a1.putPhone("Eva", ['9087-1234'])
        self.a1.putPhone("Tony Stark", ['9876-1234'])
        self.a1.putPhone("Chris Evans", ['2111-0000'])

        self.a2.putPhone("Chris Evans", ['2111-0000'])
        self.a2.putPhone("Tony Stark", ['2274-4635'])
        self.a2.putPhone("Tony Stark", ['9876-1234'])

    def test_eq(self):
        self.a2.putPhone("Eva", ['9087-1234'])
        self.assertTrue(self.a1 == self.a2)
        self.a2.putPhone("Eva", ['9387-5634'])
        self.assertFalse(self.a1 == self.a2, 'test_eq: Eva has a new phone')

    def test_eq2(self):
        self.a2.putPhone("Chris Evans", ['2111-0000'])
        self.a2.putPhone("Tony Stark", ['2274-4635'])
        self.a2.putPhone("Tony Stark", ['9876-1234'])
        self.a2.putPhone("Eva", ['9087-1234'])
        self.assertTrue(self.a1 == self.a2)
        self.a2.putPhone("Eva", ['9387-5634'])
        self.assertFalse(self.a1 == self.a2, 'test_eq2: Eva has a new phone')

    def test_str(self):
        agd1 = "Chris Evans: 2111-0000\nEva: 9087-1234\nTony Stark: 2274-4635 \ 9876-1234\n"
        self.assertEqual(str(self.a1), agd1)

    def test_repr(self):
        agd2 = "\nChris Evans: 2111-0000\nEva: 9087-1234\nTony Stark: 2274-4635 | 9876-1234\n"
        self.assertEqual("%r" % self.a1, agd2)

    def test_putPhone(self):
        self.assertTrue(
            ("Chris Evans", ['2111-0000']) in self.a1.dic.items(), 'Chris Evans')
        self.assertTrue(("Eva", ['9087-1234']) in self.a1.dic.items(), 'Eva')

    def test_putPhone2(self):
        self.assertTrue(
            ("Tony Stark", ['2274-4635', '9876-1234']) in self.a1.dic.items(), 'Tony Stark')

    def test_getPhone(self):
        self.assertEqual(self.a1.getPhone("Tony Stark", 1), "2274-4635")
        self.assertEqual(self.a1.getPhone("Tony Stark", 2), "9876-1234")

    def test_getPhone2(self):
        self.assertIsNone(self.a1.getPhone("Tony Stark", 3))
        self.assertIsNone(self.a1.getPhone("Paul", 2))

    def test_remContact(self):
        agd = "Chris Evans: 2111-0000\nTony Stark: 2274-4635 \ 9876-1234\n"

        self.a1.remContact("Eva")
        self.assertEqual(str(self.a1), agd)
        self.assertFalse(("Eva", ['9087-1234']) in self.a1.dic.items(), 'Eva')
        self.a1.remContact("Peter")  # Peter is not in the agenda
        self.assertTrue(self.a1 == self.a2)

    def test_remContact2(self):
        self.a1.remContact("Eva")
        self.a1.remContact("Tony Stark")
        self.assertFalse("Tony Stark" in self.a1.dic, 'Tony Stark')
        self.assertTrue(
            ("Chris Evans", ['2111-0000']) in self.a1.dic.items(), 'Chris Evans')
        self.assertEqual(str(self.a1), "Chris Evans: 2111-0000\n")

        self.a1.remContact("Chris Evans")
        self.assertFalse(str(self.a1))  # bool('') is False


if __name__ == "__main__":
    unittest.main()
