#!/usr/bin/env python3
# coding: UTF-8
#
## @package cdc.cgi
#
#  CGI interface for CDC calculations.
#
#  Should be copied to:
#  - /Library/WebServer/CGI-Executables/ (MacOS)
#  - /usr/lib/cgi-bin/ (Ubuntu)
#  - /var/www/cgi-bin (Fedora)
#
#  Usage:
#  - http://localhost:80/cgi-bin/cdc.cgi?np=12&tax=4.55&pv=23000&pp=30500&pb=0
#
#  @author Paulo Roma
#  @date 29/06/2020
#
#  @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code

from __future__ import print_function
# Import modules for CGI handling
import cgi
import cgitb

import sys
import os
sys.path.append(os.environ.get("DOCUMENT_ROOT") + '/python/labs/hidden')
from _02f_rational import *

# we want some error messages
cgitb.enable()

# Create instance of FieldStorage
form = cgi.FieldStorage()

# Get data from fields
np = int(form.getvalue('np'))
t = float(form.getvalue('tax')) / 100
pp = float(form.getvalue('pp'))
pv = float(form.getvalue('pv'))
pb = float(form.getvalue('pb'))
dp = form.getvalue('dp')
if dp:
    setDownPayment()

print("""Content-type: text/html;charset=utf-8\r\n\r\n
    <html>
    <h6>{}</h6>
    <head>
        <title>CDC - Crédito Direto ao Consumidor CGI Program</title>
        <link rel="stylesheet" href="/python/html/cd.css">
    </head>
    <body>
""".format("Python {0[0]}.{0[1]}.{0[2]} - Encoding: {1}"
           .format(sys.version_info[:3], setEncodingUTF8())))

if pv == 0:
    pv = presentValue(pp, np, t)[1]

ti, i = getInterest(pp, pv, np)

print("""
    <div id=greenBox class=rectangle>
        <h4>Parcelamento: {} meses</h4>
        <h4>Taxa: {:.2f}% ao mês = {:.2f}% ao ano</h4>
        <h4>Valor Financiado: ${:.2f}</h4>
""".format(np, 100 * t, (((1 + t)**12) - 1) * 100.0, pv))

if t > 0:
    if pp > pv:
        print("<h4>Valor Final: ${:.2f}</h4>".format(pp))
else:
    print("<h4>Prestação: ${:.4f}</h4>".format(pp / np))
    t = 0.01 * ti

print("""
        <h4>Valor a Voltar: ${:.2f}</h4>
        <h4>Entrada: {}</h4>
    </div>
""".format(pb, getDownPayment()))

try:
    cf = CF(t, np)
    pmt = pv * cf
    if getDownPayment():
        pmt /= (1 + t)
        np -= 1    # uma prestação a menos
        pv -= pmt  # preço à vista menos a entrada
except ZeroDivisionError as e:
    print("""
        <div id=blueBox class=rectangle>" )
            <h4>{}</h4>"
            <h4>Juros e Valor Final não podem ser ambos 0</h4>'
        </div>
    """.format(e))
    exit()

ptb = priceTable(np, pv, t, pmt)

val = " + ${:.2f} = ${:.2f}".format(pmt,
                                    ptb[-1][1] + pmt) if getDownPayment() else ""

print("""
    <div id=blueBox class=rectangle>
        <h4>Prestação: ${:.2f} ao mês</h4>
        <h4>Coeficiente de Financiamento: {:.6f}</h4>
        <h4>Valor Pago: ${:.2f} {}</h4>
        <h4>Taxa Real ({} iterações): {:.4f}% ao mês</h4>
        <h4>Valor Corrigido: ${:.2f}</h4>
    </div>
    <div id=redBox class=rectangle>
        <h2>Tabela Price</h2>
""".format(pmt, cf, ptb[-1][1], val, i, ti, presentValue(pb, np, t)[1]))

table = ""
for i in range(len(ptb)):
    table += "<tr>"
    for j in range(len(ptb[0])):
        col = "{:.2f}".format(ptb[i][j]) if i > 0 and j > 0 else str(ptb[i][j])
        table += ("<td style='text-align:center'>" if i >
                  0 else "<th>") + col + ("</td>" if i > 0 else "</th>")
    table += "</tr>"

print("""
<table border=1>
{content}
</table>
""".format(content=table))

if False:
    # html suppresses spaces
    print("<pre>")
    # monospaced font
    print("<code>")

    printTable(ptb)

    print("</code>")
    print("</pre>")

print("</div>")

print("</body>")
print("</html>")
