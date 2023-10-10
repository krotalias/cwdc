#!/usr/bin/env python
# coding: UTF-8

from _01a_fracao import Fracao

Fracao(1, 2)
print(Fracao(1, 2))
a = Fracao(1, 2)
b = Fracao(2, 4)
a == b
a.__eq__(b)
c = Fracao(1, 3)
a == c
a.__eq__(c)

a + b
print(a + b)
print(a * b)
print(a / b)
print(a // b)
print(a + 1)

print(a)
a += b
print(a)

print(1 + a)

print(a + b + c)
print(a.__add__(b).__add__(c))
