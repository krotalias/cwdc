#!/usr/bin/env python3
# coding: UTF-8
#
## @package cdi.cgi
#
#  CGI interface for CDI calculations.
#
#  Shoud be copied to:
#  - /Library/WebServer/CGI-Executables/ (MacOS)
#  - /usr/lib/cgi-bin/ (Ubuntu)
#  - /var/www/cgi-bin (Fedora)
#
#  Usage:
#  - http://localhost:80/cgi-bin/cdi.cgi
#
#  @author Paulo Roma
#  @date 20/02/2020
#

from __future__ import print_function
# Import modules for CGI handling
import cgi
import cgitb

import sys
import os
sys.path.append(os.environ.get("DOCUMENT_ROOT") + '/python/labs/hidden')
from cdi import CDB, jc, month2year, year2month, year2day, doublePrincipal

# Create instance of FieldStorage
form = cgi.FieldStorage()

# Get data from fields
cap = float(form.getvalue('cap'))
sel = float(form.getvalue('sel')) / 100
cdi = float(form.getvalue('cdi')) / 100
i = float(form.getvalue('ir')) / 100
t = float(form.getvalue('tcdi')) / 100
m = int(form.getvalue('meses'))

s = 0.70 * sel if sel <= 0.085 else month2year(0.005) / 100
cdim = year2month(cdi) * 0.01
p = year2month(s) * 0.01

mc, mp, ir, rend, rend2, tl, T = CDB(cap, cdi, s, t, i, m)

# rendimento anual com imposto
rapp = month2year(tl / (1 - i)) * (1 - i)

print("""Content-type:text/html;charset=utf-8\r\n\r\n
    <html>
    <h6>{}</h6>
    <head>
        <title>CDI - Market CGI Program</title>
        <link rel="stylesheet" href="/python/html/cd.css">
    </head>
    <body>
""".format("Python {0[0]}.{0[1]}.{0[2]} - Encoding: {1}"
           .format(sys.version_info[:3], sys.getdefaultencoding())))

print("""
    <div id=greenBox class=rectangle>
        <h3>Capital: ${:.2f}</h3>
        <h3>Taxa Selic: {:.2f}% ao ano</h3>
        <h3>CDI: {:.2f}% ao ano = {:.4f}% ao mês = {:.6f}% ao dia</h3>
        <h3>Taxa Poupança: {:.2f}% ao ano = {:.4f}% ao mês</h3>
""".format(cap, 100 * sel, 100 * cdi, 100 * cdim, year2day(cdi, 252), 100 * s, 100 * p))

print("""
        <h3>IR: {:.1f}%</h3>
        <h3>Rentabilidade: {}% CDI = {:.2f}% ao ano<br>
         Com impostos: {:.2f}% CDI = {:.2f}% ao ano</h3>
        <h3>Meses: {}</h3>
    </div>
""".format(100 * i, 100 * t, 100 * t * cdi, 100 * t * (1 - i), rapp, m))

print("""
    <div id=blueBox class=rectangle>
        <h3>Montante Aplicação = ${:.2f}</h3>
        <h3>Montante Poupança = ${:.2f}</h3>
        <h3>Apl - Poup ({} meses) = ${:.2f}</h3>
        <h3>Imposto = ${:.4f}</h3>
        <h3>Rendimento em {} meses = {:.4f}%</h3>
    </div>
""".format(mc, mp, m, mc - mp, ir, m, rend))

print("""
    <div id=redBox class=rectangle>
        <h3>Apl - Poup ({} meses) = {:.4f}%</h3>
        <h3>Apl &#x224d Poup = {:.2f}% CDI</h3>
        <h3>Tempo 2 &times; Poupança = {:.2f} anos</h3>
        <h3>Tempo 2 &times; Aplicação &#x224d {:.2f} anos</h3>
    </div>
""".format(m, 100 * (rend2 - jc(p, m)), T, doublePrincipal(s), doublePrincipal(rapp * 0.01)))

print("</body>")
print("</html>")
