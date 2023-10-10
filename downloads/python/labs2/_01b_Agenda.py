#!/usr/bin/env python
# coding: UTF-8
#
## @package _01b_Agenda
#
# A very simple address book.
#
# @author Miguel Jonathan e Paulo Roma
# @since 16/09/2009

import sys

## Class for holding an address book.
#
class Agenda:
    ## Constructor. Just creates an empty dictionary.
    #
    def __init__(self):
        ## Dictionary for associating a contact name to a telephone list.
        self.dic = {}

    ## Associates new phones to the given name.
    #
    #  @param nome contact name.
    #  @param lista contact phone list.
    #
    def putPhone(self, nome, lista):
        if nome in self.dic:
            self.dic[nome] += [i for i in lista if i not in self.dic.get(nome)]
        else:
            self.dic[nome] = lista  # primeira vez

    ## Retrieves the index-th phone of a given contact.
    #
    #  @param nome contact name.
    #  @param index selects a certain phone from the contact phone list.
    #  @return a phone number or None, if the contact does not exist.
    #
    def getPhone(self, nome, index):
        lt = self.dic.get(nome)
        if lt:
            if index > 0 and index <= len(lt):
                return lt[index - 1]
        return None

    ## Compares two agendas.
    def __eq__(self, other):
        return self.dic == other.dic

    ## Removes a given contact from the address book.
    #
    #  @param nome contact name.
    #
    def remContact(self, nome):
        if nome in self.dic:
            self.dic.pop(nome)

    ## Used to print a human readable presentation of an object.
    #  In this case, it prints the contact name and his phone numbers.
    #
    #  @return a multi line string.
    #
    def __repr__(self):
        txt = ""
        # items() returns a **copy** of the dictionary’s list of (key, value) tuple pairs.
        for name, lphone in self.dic.items():
            txt += "{}: {}\n".format(name, " | ".join(lphone))
        if txt:
            txt = txt.split("\n")
            txt.sort()
            txt = "\n".join(txt) + "\n"
        return txt

    ## For printing an address book x by using just print x.
    #  Each line is made up of a name followed by its corresponding phones.
    #  Names are listed in alphabetical order.
    #
    #  @return a multi line string.
    #
    def __str__(self):
        texto = ""
        # Python 3 returns a dict_keys object instead of a list
        # name list (the keys) from the dictionary
        nomes = list(self.dic.keys())
        nomes.sort()  # sorted name list
        for nome in nomes:
            texto += "{}: {}\n".format(nome, " \ ".join(self.dic[nome]))
        return texto

## Main program for testing.
#
def main():
    a = Agenda()
    a.putPhone("Tony Stark", ['2274-4635'])
    a.putPhone("Eva", ['9087-1234'])
    a.putPhone("Tony Stark", ['9876-1234'])
    a.putPhone("Chris Evans", ['2111-0000'])
    print("\nAgenda(str):\n%s" % a)
    print("Agenda(repr):%s" % repr(a))
    print("getPhone Tony Stark - 1: %s" % a.getPhone("Tony Stark", 1))
    print("getPhone Tony Stark - 2: %s" % a.getPhone("Tony Stark", 2))
    print("getPhone Tony Stark - 3: %s" % a.getPhone("Tony Stark", 3))
    print("getPhone Paul - 2: %s" % a.getPhone("Paul", 2))
    print("Removed Eva and Peter")
    a.remContact("Eva")
    a.remContact("Peter")
    print("\nAgenda(str):\n%s" % a)


if __name__ == "__main__":
    sys.exit(main())
