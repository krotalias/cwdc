#!/usr/bin/env python
# coding: UTF-8
# vim: tabstop=4:softtabstop=4:shiftwidth=4
#
## @package VideoTest
#
#  A class for testing the Video Store.
#
#  @author Paulo Roma
#  @since 07/12/2018

import unittest
import sys
from Customer import Customer
from PremierMember import PremierMember
from ClubMember import ClubMember
from NewReleaseDVD import NewReleaseDVD
from DVD import DVD
from Game import Game
from SimpleDate import SimpleDate
from StatusException import StatusException
from TitleKeywordSearch import TitleKeywordSearch
from GenreSearch import GenreSearch
from OverDueItemSearch import OverDueItemSearch
from VideoStore import VideoStore

class VideoTest(unittest.TestCase):

    first = True

    def setUp1(self):
        self.c1 = Customer("João")
        self.c2 = PremierMember("Maria")
        self.c3 = ClubMember("Pedro")
        self.store.addCustomer(self.c1)
        self.store.addCustomer(self.c2)
        self.store.addCustomer(self.c3)
        print("User %s" % self.store.findUser("João"))
        self.c1.rentItem(self.store.addItem(
            DVD("Matrix", "Science Fiction", 3)), self.today)
        self.c2.rentItem(self.store.addItem(
            NewReleaseDVD("Ladyhawke", "Fantasy", 2)), self.today)
        self.c3.rentItem(self.store.addItem(Game("The Sims", 4)), self.today)
        print("Store AFTER rentals\n%r" % self.store)
        self.c1.bringBackItem(3, self.today2)
        self.c2.bringBackItem(2, self.today2)
        self.c3.bringBackItem(4, self.today + 24)

    def setUp2(self):
        self.pm = PremierMember("Flavia")
        self.cm = ClubMember("Paulo")
        self.cu = Customer("Iva")
        self.store.addCustomer(self.pm)
        self.store.addCustomer(self.cm)
        self.store.addCustomer(self.cu)
        dvd = DVD("Avengers", "Action", 12)
        dvd2 = DVD("Avengers", "Action", 12)
        self.pm.rentItem(self.store.addItem(dvd), self.today)
        self.assertEqual(self.store.addItem(dvd2), None)  # item already added
        with self.assertRaises(StatusException):
            # renting an item already rented
            self.pm.rentItem(dvd, self.today)
        self.pm.rentItem(self.store.addItem(
            DVD("My Fair Lady", "Romance", 13)), self.today)
        self.pm.rentItem(self.store.addItem(
            DVD("The Mark of Zorro", "Action", 14)), self.today)
        self.pm.rentItem(self.store.addItem(
            DVD("Zatura", "Action", 15)), self.today)
        self.pm.rentItem(self.store.addItem(NewReleaseDVD(
            "The Last Stand", "Action", 16)), self.today)

        self.pm.rentItem(self.store.addItem(
            Game("Harry Potter", 17)), self.today)

        self.cm.rentItem(self.store.addItem(NewReleaseDVD(
            "Gangster Squad", "Action", 26)), self.today)

        self.cu.rentItem(self.store.addItem(
            NewReleaseDVD("Black Swan", "Thriler", 27)), self.today)
        print("Customers AFTER rentals:")
        print(self.pm)
        print(self.cm)
        print(self.cu)
        self.pm.bringBackItem(12, self.today2)
        self.pm.bringBackItem(13, self.today2)
        self.pm.bringBackItem(14, self.today2)
        self.pm.bringBackItem(15, self.today2)
        self.pm.bringBackItem(16, self.today2)
        date = self.today + 6
        print("Over due items in %s:" % date)
        od = []
        for i in self.store.search(OverDueItemSearch(date)):
            od.append(i)
        od = list(map(str, od))
        print(od)
        self.assertListEqual(
            od, ['NewReleaseDVD: Gangster Squad', 'NewReleaseDVD: Black Swan'])
        self.assertEqual(len(od), 2)
        print("\n")
        # there is a late item (3 days) - Premier no fee
        self.pm.bringBackItem(17, self.today + 10)
        # there is a late item (6 days)
        self.cu.bringBackItem(27, self.today + 8)
        self.cm.rentItem(self.store.addItem(
            NewReleaseDVD("Gattaca", "Sci-Fi", 28)), self.today + 8)
        self.cm.bringBackItem(26, self.today + 7)

    def setUp(self):
        self.store = VideoStore()
        self.today = SimpleDate.today()
        self.today2 = self.today + 2
        print(self.today)
        if VideoTest.first:
            self.setUp1()
        else:
            self.setUp2()

    def tearDown(self):
        VideoTest.first = False

    def testBalances(self):
        print("Store AFTER returns\n%r" % self.store)
        # 1 DVD - 3.50
        self.assertEqual(self.c1.getBalance(), 3.50)
        print(self.c1)
        # 1 NewDVD - 4.00
        self.assertEqual(self.c2.getBalance(), 4.00)
        print(self.c2)
        # 1 Game -> 500 + 17 dias de atraso -> 1500 = 20.00
        self.assertEqual(self.c3.getBalance(), 20.00)
        print(self.c3)
        print("\n")

    def testReturns(self):
        print("Customers AFTER returns:")

        # 350*4 (DVD) + 400 (New DVD) + 500 (Game) = 2300 for the rentals, plus bonus: 4*3 (4 DVD não atrasados) -> 150
        # 2300 - 150 = 21.50
        self.assertEqual(self.pm.getBalance(), 21.50)
        print(self.pm)
        # 2 new dvd 2 days  = 800 -> 7-2 = 5 days -> bonus 1 day = 4 days late = 400+600
        # 800 + 1000 = 18.00
        self.assertEqual(self.cm.getBalance(), 18.00)
        print(self.cm)
        # new dvd 2 days  = 400 -> 8-2 = 6 days -> bonus 1 day = 5 days late = 400+750
        # 400 + 1150 = 15.50
        self.assertEqual(self.cu.getBalance(), 15.50)
        print(self.cu)

        self.cu.makePayment(50)
        print("Payment: 0.50")
        self.assertEqual(self.cu.getBalance(), 15.00)
        print(self.cu)

        ts = TitleKeywordSearch("Vendetta", False)
        self.assertTrue(ts, "Vendetta does not match")
        print("\"Vendetta\" matches \"V For Vendetta\": %r" %
              ts.matches(DVD("V For Vendetta", "Sci-Fi", 30)))

        print("\nAction Movies:")
        am = []
        for i in self.store.search(GenreSearch("Action")):
            am.append(i)

        am = list(map(str, am))
        self.assertListEqual(am, ['DVD: Avengers', 'DVD: The Mark of Zorro', 'DVD: Zatura',
                             'NewReleaseDVD: The Last Stand', 'NewReleaseDVD: Gangster Squad'])
        print(am)

        n = self.store.findUser('Flavia')
        print("\nUser %s" % n)
        self.assertEqual(n, self.pm)


if __name__ == "__main__":
    unittest.main()
