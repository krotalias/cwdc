#!/usr/bin/env python
# coding: UTF-8
#
## @package _01d_Agenda
#
# A simple address book.
#
# @author Paulo Roma
# @since 11/09/2014

import sys

## Class for aggregating all personal data in a single object.
#
class personalData:
    ## Constructor from a phone list and an address.
    #
    #  @param listOfPhones phone list.
    #  @param addr address.
    #
    def __init__(self, listOfPhones=None, addr=''):
        if (listOfPhones is None):
            listOfPhones = []
        # check for duplicate phones
        if len(listOfPhones) == len(set(listOfPhones)):
            ## Contact phone list.
            self.lPhone = listOfPhones
            self.setAddress(addr)
        else:
            raise(ValueError('Duplicate phone found'))

    ## Returns the phone list of this contact.
    #
    #  @return the contact phone list.
    #
    def getlPhone(self):
        return self.lPhone

    ## Returns the address of this contact.
    #
    #  @return the contact address.
    #
    def getAddress(self):
        return self.address

    ## Sets the address of this contact.
    #
    #  @param addr the contact address.
    #
    def setAddress(self, addr):
        ## Contact address.
        self.address = addr

    ## Appends a phone list to this contact phone list.
    #
    #  @param l a phone list.
    #
    def setlPhone(self, l):
        self.lPhone += [i for i in l if i not in self.lPhone]

    ## Compares two personal data.
    def __eq__(self, other):
        return (self.lPhone == other.lPhone) and (self.address == other.address)

    ## Used to print a human readable presentation of an object.
    #  In this case, it prints the contact name and his personal data.
    #
    #  @return a string.
    #
    def __repr__(self):
        txt = ""
        txt += "Endereço: {}, Tel: {}".format(self.address,
                                              " | ".join(self.lPhone))
        return txt

    ## Used to print a human readable presentation of an object.
    #  In this case, it prints the contact name and his personal data.
    #
    #  @return a multi line string.
    #
    def __str__(self):
        txt = ""
        txt += "\nEndereço: {}\n{}".format(self.address,
                                           " | ".join(self.lPhone))
        return txt

## Class for holding an address book.
#
class Agenda:
    ## Constructor. Just creates an empty dictionary.
    #
    def __init__(self):
        ### Dictionary for associating a contact name to a personalData object.
        self.dic = {}

    ## Associates new phones and an address to the given name.
    #
    #  @param nome contact name.
    #  @param phones a personalData or the contact phone list.
    #  @param addr contact address.
    #
    def putPhone(self, nome, phones=None, addr=''):
        if isinstance(phones, personalData):  # já é um personalData?
            self.dic[nome] = phones
            return

        if nome in self.dic:
            self.dic[nome].setlPhone(phones)
            if addr != '':
                self.dic[nome].setAddress(addr)
        else:
            self.dic[nome] = personalData(phones, addr)  # primeira vez

    ## Retrieves the index-th phone of a given contact.
    #
    #  @param nome contact name.
    #  @param index selects a certain phone from the contact phone list.
    #  @return a phone number or None, if the contact does not exist.
    #
    def getPhone(self, nome, index):
        if nome in self.dic:
            data = self.dic[nome]
            if data:
                lt = data.getlPhone()
                if index > 0 and index <= len(lt):
                    return lt[index - 1]
        return None

    ## Retrieves the address of a given contact.
    #
    #  @param nome contact name.
    #  @return an address or None, if the contact does not exist.
    #
    def getAddr(self, nome):
        if nome in self.dic:
            data = self.dic[nome]
            if data:
                return data.getAddress()
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
    #  In this case, it prints the contact name and his personal data.
    #
    #  @return a multi line string.
    #
    def __repr__(self):
        txt = ""
        # items() returns a **copy** of the dictionary’s list of (key, value) tuple pairs.
        for name, pdata in self.dic.items():
            txt += "{}: {}\n".format(name, repr(pdata))
        if txt:
            txt = txt.split("\n")
            txt.sort()
            txt = "\n".join(txt) + "\n"
        return txt

    ## For printing an address book x by using just print x.
    #  Each line is made up of a name followed by its corresponding personal data.
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
            texto += "{}: {}\n".format(nome, str(self.dic[nome]))
        return texto

## Main program for testing.
#
def main():
    a = Agenda()
    p = personalData(['3568-8799'], 'CCMN')
    a.putPhone("Tony Stark", ['2274-4635'], 'Leblon')
    a.putPhone("Eva", ['9087-1234', '2267-6767'], 'UFRJ')
    a.putPhone("Tony Stark", ['9876-1234'])
    a.putPhone("Chris Evans", ['2111-0000'], 'Ilha do Governador')
    a.putPhone("Steve Rogers", p)
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
