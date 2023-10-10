#!/usr/bin/env python
# coding: UTF-8
#
## @package web_scraper
#
# Extrai as temperaturas mínima e máxima de uma cidade do site Climatempo.
#
# Web scraping é uma coleta de dados da web,
# onde são usados scripts e programas para “raspar” informações de certos sites,
# que poderão ser usadas para análises futuras.
#
# Temperatura em RIODEJANEIRO-RJ:
# - • Mínima: 19°
# - • Máxima: 23°
#
# Usage:
# - web-scraper [cidade: 0..12]
#
# Climatempo source page:
# \image html safari2.png
#
# @author Paulo Roma
# @since 09/11/2021
#
# @see https://realpython.com/beautiful-soup-web-scraper-python/
# @see https://www.edureka.co/blog/web-scraping-with-python/
# @see https://blog.geekhunter.com.br/como-fazer-um-web-scraping-python/
# @see https://www.crummy.com/software/BeautifulSoup/bs4/doc/index.html?highlight=find#find
# @see https://www.climatempo.com.br
# @see <a href="/python/labs2/images/safari2.png">Source page in Safari</a>
# @see <a href="/roma/cederj/AP/2021-2/AP2X_PI_21_2.pdf">cederj</a>
#

# UnicodeEncodeError: 'ascii' codec can't encode character u'\xb0' in position 2: ordinal not in range(128)
from __future__ import unicode_literals

from bs4 import BeautifulSoup

import requests

import sys

##
# Retorna uma tupla com o nome da cidade indicada,
# e suas temperaturas mínima e máxima.
#
# @param index índice de uma cidade [0..12]
# @param offline quando usar uma página pré-baixada.
# @param debug estado de depuração: imprime o código html do site.
# @return (nome da cidade, temperatura mínima, temperatura máxima)
#
def get_city_tmin_and_tmax(index, offline=False, debug=False):
    # cidades que podem ser selecionadas
    cidades = ["558/saopaulo-sp",
               "321/riodejaneiro-rj",
               "94/saoluis-ma",
               "313/niteroi-rj",
               "259/recife-pe",
               "39/macapa-ap",
               "41/oiapoque-ap",
               "4382/chui-rs",
               "377/florianopolis-sc",
               "271/curitiba-pr",
               "107/belohorizonte-mg",
               "363/portoalegre-rs",
               "540/santos-sp",
               "61/brasilia-df"]

    index = min(abs(int(index)), len(cidades) - 1)

    if not offline:
        html = requests.get("https://www.climatempo.com.br/previsao-do-tempo/cidade/" + cidades[index],
                            headers={'Cache-Control': 'no-cache', "Pragma": "no-cache"}).content

    else:
        # saved html in case Climatempo is down: print(soup)
        html = open("../public/riodejaneiro-rj.html", 'r').read()
        index = 1

    soup = BeautifulSoup(html, 'html.parser')

    if debug:
        print(soup.prettify())

    temperatura = soup.find('span', string='Temperatura')
    p = temperatura.find_next("p").get_text()

    cidade = cidades[index].split('/')[1].upper()

    temps = p.split()

    return cidade, temps[0], temps[1]

## Programa principal.
def main(argv=None):
    if argv is None:
        argv = sys.argv

    code = argv[1] if len(argv) > 1 else 1

    cidade, tmin, tmax = get_city_tmin_and_tmax(
        code, len(argv) > 2, len(argv) > 3)

    print('Temperatura em {}: '.format(cidade.upper()))

    print("• Mínima: {}\n• Máxima: {}".format(tmin, tmax))


if __name__ == "__main__":
    sys.exit(main())
