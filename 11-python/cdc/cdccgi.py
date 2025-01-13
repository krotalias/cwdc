#!/usr/bin/env python3
# coding: UTF-8
#
## @package cdccgi
#
# CGI interface for CDC calculations.
#
# Should be copied to:
# - /Library/WebServer/CGI-Executables/ (MacOS)
# - /usr/lib/cgi-bin/ (Ubuntu)
# - /var/www/cgi-bin (Fedora)
#
# @author Paulo Roma
# @date 29/06/2020
#
# @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code
# @see <a href="/cwdc/11-python/showCodePython.php?f=cdc/cdccgi">source</a>
# @see <a href="/cwdc/11-python/cdc/cdccgi.py?np=12&tax=4.55&pv=23000&pp=30500&e=0">link</a>

# Import modules for CGI handling
import cgi
import cgitb
import sys

from rational import (
    getInterest,
    CF,
    priceTable,
    nodePriceTable,
    setEncodingUTF8,
    setDownPayment,
    getDownPayment,
    htmlPriceTable,
    nodePriceTable,
    rational_discount,
)

# When Python prints Unicode strings to the console it usually detects
# the console encoding and automatically encodes the Unicode strings
# using that encoding.
# For CGI there is no terminal so the default is ascii.
# One can change stdout to another encoding by using:
# sys.stdout = codecs.getwriter('utf8')(sys.stdout.buffer) # requires python3

# we want some error messages
cgitb.enable()

# Create instance of FieldStorage
form = cgi.FieldStorage()

errmsg = ""

# Get data from fields
try:
    np = int(form.getvalue("np"))
    t = float(form.getvalue("tax")) / 100
    pp = float(form.getvalue("pp"))
    pv = float(form.getvalue("pv"))
    dp = int(form.getvalue("e"))
    verbose = int(form.getvalue("v"))
except Exception as err:
    errmsg = "Invalid Parameters: {}".format(err)

print(
    """Content-type: text/html;charset=utf-8\r\n\r\n
    <html>
    <h6>{}</h6>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>CDC - Crédito Direto ao Consumidor CGI Program</title>
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
)  # works with python2

if errmsg:
    print(errmsg)
    sys.exit(1)

print(
    """
    <h4>Parcelas: {}{:d}</h4>
    <h4>Taxa: {:.2f}%</h4>
    <h4>Preço a Prazo: ${:.2f}</h4>
    <h4>Preço à Vista: ${:.2f}</h4>
""".format(
        "1+" if dp else "", np - 1 if dp else np, 100 * t, pp, pv
    )
)

setDownPayment(dp)  # com ou sem entrada

pmt = 0
i = 0
ti = 0
try:
    if t <= 0:
        ti, i = getInterest(pp, pv, np)
        t = ti * 0.01
    cf = CF(t, np)
    pmt = pv * cf
except Exception as e:
    errmsg = "<h2><mark>{}</mark></h2>".format(str(e))
finally:
    if getDownPayment():
        pmt /= 1 + t
        np -= 1  # uma prestação a menos
        pv -= pmt  # preço à vista menos a entrada
        cf = pmt / pv  # recalculate cf
        print(
            "<h4>Valor financiado = ${:.2f} - ${:.2f} = ${:.2f}</h4>".format(
                pv + pmt, pmt, pv
            )
        )

ptb = priceTable(np, pv, t, pmt)

if errmsg:
    print(errmsg)
    sys.exit(1)

print(
    """
    <h4>Taxa Real ({} iterações): {:.4f}%</h4>
    <h4>Coeficiente de Financiamento: {:.6f}</h4>
    <h4>Prestação: ${:.2f}</h4>
""".format(
        i, ti, cf, pmt
    )
)

print(
    """
{content}
""".format(
        content=htmlPriceTable(ptb)
    )
)

if verbose:
    if dp:
        np += 1
        pv += pmt

    rational_discount(np, t, pp, pv, True, True)
    print(
        """
        <pre>
        <code>
        {content}
        </code>
        </pre>
        """.format(
            content=nodePriceTable(ptb)
        )
    )

print("</body>")
print("</html>")
