#!/usr/bin/env python
# coding: UTF-8
#
## @package _01d_AgendaTest
#
#  Class for testing the expanded Agenda.
#
#  @author Paulo Roma
#  @since 07/09/2020
#  @see https://docs.python.org/3/library/unittest.html
#

from _01d_Agenda import Agenda, personalData
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

        self.a1.putPhone("Tony Stark", ['2274-4635'], 'Leblon')
        self.a1.putPhone("Eva", ['9087-1234'], 'UFRJ')
        self.a1.putPhone("Tony Stark", ['9876-1234'])
        self.a1.putPhone("Chris Evans", ['2111-0000'], 'Ilha do Governador')
        self.a1.putPhone("Steve Rogers", personalData(
            ['3568-8799', '2234-4333'], 'CCMN'))

        self.a2.putPhone("Chris Evans", ['2111-0000'], 'Ilha do Governador')
        self.a2.putPhone("Tony Stark", ['2274-4635'], 'Leblon')
        self.a2.putPhone("Tony Stark", ['9876-1234'])

    def test_eq(self):
        self.a2.putPhone("Eva", ['9087-1234'], 'UFRJ')
        self.a2.putPhone("Steve Rogers", personalData(
            ['3568-8799', '2234-4333'], 'CCMN'))
        self.assertTrue(self.a1 == self.a2)
        self.a2.putPhone("Eva", ['9387-5634'])
        self.assertFalse(self.a1 == self.a2, 'test_eq: Eva has a new phone')

    def test_eq2(self):
        self.a2.putPhone("Chris Evans", ['2111-0000'], 'Ilha do Governador')
        self.a2.putPhone("Tony Stark", ['2274-4635'], 'Leblon')
        self.a2.putPhone("Tony Stark", ['9876-1234'])
        self.a2.putPhone("Eva", ['9087-1234'], 'UFRJ')
        self.a2.putPhone("Steve Rogers", ['3568-8799', '2234-4333'], 'CCMN')
        self.assertTrue(self.a1 == self.a2)
        self.a2.putPhone("Eva", ['9387-5634'])
        self.assertFalse(self.a1 == self.a2, 'test_eq2: Eva has a new phone')

    def test_str(self):
        agd1 = "Chris Evans: \nEndereço: Ilha do Governador\n2111-0000\nEva: \nEndereço: UFRJ\n9087-1234\nSteve Rogers: \nEndereço: CCMN\n3568-8799 | 2234-4333\nTony Stark: \nEndereço: Leblon\n2274-4635 | 9876-1234\n"
        self.assertEqual(str(self.a1), agd1, 'str')

    def test_repr(self):
        agd2 = "\nChris Evans: Endereço: Ilha do Governador, Tel: 2111-0000\nEva: Endereço: UFRJ, Tel: 9087-1234\nSteve Rogers: Endereço: CCMN, Tel: 3568-8799 | 2234-4333\nTony Stark: Endereço: Leblon, Tel: 2274-4635 | 9876-1234\n"
        self.assertEqual("%r" % self.a1, agd2, 'repr')

    def test_putPhone(self):
        self.assertTrue(("Chris Evans", personalData(
            ['2111-0000'], 'Ilha do Governador')) in self.a1.dic.items(), 'Chris')
        self.assertTrue(("Tony Stark", personalData(
            ['2274-4635', '9876-1234'], 'Leblon')) in self.a1.dic.items(), 'Tony Stark')
        self.assertTrue(("Eva", personalData(
            ['9087-1234'], 'UFRJ')) in self.a1.dic.items(), 'Eva')
        self.assertTrue(("Steve Rogers", personalData(
            ['3568-8799', '2234-4333'], 'CCMN')) in self.a1.dic.items(), 'Steve')

    def test_getPhone(self):
        self.assertEqual(self.a1.getPhone("Tony Stark", 1), "2274-4635")
        self.assertIsNone(self.a1.getPhone("Paul", 2))

    def test_getPhone2(self):
        self.assertEqual(self.a1.getPhone("Tony Stark", 2), "9876-1234")
        self.assertIsNone(self.a1.getPhone("Tony Stark", 3))

    def test_getAddr(self):
        self.assertEqual(self.a1.getAddr("Tony Stark"), "Leblon")
        self.assertEqual(self.a1.getAddr("Eva"), "UFRJ")
        self.assertIsNone(self.a1.getAddr("Paul"))

    def test_remContact(self):
        agd = "Chris Evans: \nEndereço: Ilha do Governador\n2111-0000\nTony Stark: \nEndereço: Leblon\n2274-4635 | 9876-1234\n"

        self.a1.remContact("Eva")
        self.a1.remContact("Steve Rogers")
        self.assertEqual(str(self.a1), agd)
        self.assertFalse(("Eva", personalData(
            ['9087-1234'], 'UFRJ')) in self.a1.dic.items(), 'Eva')
        self.a1.remContact("Peter")  # Peter is not in the agenda
        self.assertTrue(self.a1 == self.a2)

    def test_remContact2(self):
        self.a1.remContact("Eva")
        self.a1.remContact("Tony Stark")
        self.a1.remContact("Steve Rogers")
        self.assertFalse("Tony Stark" in self.a1.dic, 'Tony Stark')
        self.assertTrue(("Chris Evans", personalData(
            ['2111-0000'], 'Ilha do Governador')) in self.a1.dic.items(), 'Chris')
        self.assertEqual(
            str(self.a1), "Chris Evans: \nEndereço: Ilha do Governador\n2111-0000\n")

        self.a1.remContact("Chris Evans")
        self.assertFalse(str(self.a1))  # bool('') is False


if __name__ == "__main__":
    unittest.main()
