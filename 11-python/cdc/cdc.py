#!/usr/bin/env python3
# coding: UTF-8
#
## @package cdc
#
#  Python interface for CDC calculations.
#
#  Usage:
#  - <a href="/cwdc/11-python/cdc/cdc.py?np=12&tax=4.55&pv=23000&pp=30500&pb=0">cdc.py?np=12&tax=4.55&pv=23000&pp=30500&pb=0</a>
#
#  @author Paulo Roma
#  @date 29/06/2020
#  @see <a href="/cwdc/11-python/showCodePython.php?f=cdc/cdc">source</a>
#  @see <a href="/cwdc/11-python/cdc/cdc.html">link</a>
#  @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code

from __future__ import print_function

# Import modules for CGI handling
import cgi
import cgitb

import sys
import os

from rational import *

# we want some error messages
cgitb.enable()

# Create instance of FieldStorage
form = cgi.FieldStorage()

# Get data from fields
np = int(form.getvalue("np"))
t = float(form.getvalue("tax")) / 100
pp = float(form.getvalue("pp"))
pv = float(form.getvalue("pv"))
pb = float(form.getvalue("pb"))
nb = int(form.getvalue("nb"))
dp = form.getvalue("dp") is not None
setDownPayment(dp)

pmt = pp / np
cf = 0
i = 0
ti = 0
message = ""
try:
    if t == 0:
        if pmt >= pv:
            raise Exception("Prestação é maior do que o empréstimo...".format(pmt))
        ti, i = getInterest(pp, pv, np)
        t = 0.01 * ti

    if pv == 0:
        pv = presentValue(pp, np, t)[1]

    cf = CF(t, np)
    pmt = pv * cf
    # there is no sense in a montly payment greater than the loan...
    if pmt >= pv:
        raise Exception("Prestação é maior do que o empréstimo...".format(pmt))
except Exception as e:
    message += str(e)
    # exit()
finally:
    if getDownPayment():
        np -= 1  # uma prestação a menos
        pmt /= 1 + t
        pv -= pmt  # preço à vista menos a entrada
        cf = pmt / pv  # recalcula cf

ptb = priceTable(np, pv, t, pmt)

if pb == 0 and nb > 0:
    pb = pmt * nb

print(
    """Content-type: text/html;charset=utf-8\r\n\r\n
    <html>
    <h6>{}</h6>
    <head>
        <title>CDC - Crédito Direto ao Consumidor CGI Program</title>
        <link rel="stylesheet" href="cd.css">
        <style>
            body {{
                background-image: url("/cwdc/mainPage/IMAGEM/stone/yell_roc.jpg");
            }}
        </style>
    </head>
    <body>
""".format(
        "Python {0[0]}.{0[1]}.{0[2]} - Encoding: {1}".format(
            sys.version_info[:3], setEncodingUTF8()
        )
    )
)

print(
    """
    <div id=greenBox class=rectangle>
        <h4>Parcelamento: {} {} meses</h4>
        <h4>Taxa: {:.2f}% ao mês = {:.2f}% ao ano</h4>
        <h4>Valor Financiado: ${:.2f}</h4>
        <h4>Valor Final: ${:.2f}</h4>
        <h4>Valor a Voltar: ${:.2f}</h4>
        <h4>Meses a Voltar: {}</h4>
        <h4>Entrada: {}</h4>
    </div>
""".format(
        "1 +" if dp else "",
        np,
        100 * t,
        (((1 + t) ** 12) - 1) * 100.0,
        pv,
        pp,
        pb,
        nb,
        getDownPayment(),
    )
)

print(
    """
    <div id=blueBox class=rectangle>
        <h2><mark>{}</mark></h2>
        <h4>Coeficiente de Financiamento: {:.6f}</h4>
        <h4>Prestação: {:.6f} * ${:.2f} = ${:.2f} ao mês</h4>
        <h4>Valor Pago: ${:.2f}</h4>
        <h4>Taxa Real ({} iterações): {:.4f}% ao mês</h4>
        <h4>Valor Corrigido: ${:.2f}</h4>
    </div>
""".format(
        message,
        cf,
        cf,
        pv,
        pmt if t > 0 else pp / np,
        ptb[-1][1],
        i,
        ti,
        presentValue(pb, nb, t, False)[1] if nb > 0 else 0,
    )
)

print(
    """
    <div id=redBox class=rectangle>
        {content}
    </div>
    </body>
    </html>
""".format(
        content=htmlPriceTable(ptb)
    )
)
