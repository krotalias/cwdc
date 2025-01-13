#!/opt/local/bin/python3
# coding: UTF-8
#
## @package web_scraper
#
# Gets a weather description from weather-forecast.com
#
# Web scraping extracts data from the web,
# where scripts and programs are used to “scrape” information from certain sites,
# which can be used for future analysis.
#
# • Weather:
# - Heavy rain (total 29mm), heaviest during Thu afternoon.
#   Warm (max 22°C on Sun morning, min 18°C on Sat night).
#   Wind will be generally light.
#
# Usage:
# - web-scraper.py [cidade]
#
# weather-forecast.com source page:
# \image html safari2.png width=70%
#
# @author Paulo Roma
# @since 09/11/2021
#
# @see <a href="/cwdc/11-python/web-scraper.py?Paris">link</a>
# @see https://realpython.com/beautiful-soup-web-scraper-python/
# @see https://www.edureka.co/blog/web-scraping-with-python/
# @see https://blog.geekhunter.com.br/como-fazer-um-web-scraping-python/
# @see https://www.crummy.com/software/BeautifulSoup/bs4/doc/index.html?highlight=find#find
# @see https://www.weather-forecast.com/locations/Rio-de-Janeiro/forecasts/latest
# @see <a href="/python/labs2/images/safari2.png">Source page in Safari</a>
#

# UnicodeEncodeError: 'ascii' codec can't encode character u'\xb0' in position 2: ordinal not in range(128)
from __future__ import unicode_literals

import re
import sys
import json
import requests
from bs4 import BeautifulSoup

##
# Returns a weather description summary.
#
# @param city cidade.
# @param debug for printing the page source.
# @return weather description.
#
def get_weather_summary(city, debug=False):
    html = requests.get(
        "http://www.weather-forecast.com/locations/" + city + "/forecasts/latest").content

    soup = BeautifulSoup(html, 'html.parser')

    if debug:
        print(soup.prettify())

    weather = soup.findAll(string=re.compile('(1–3 days)'))
    # print(weather)
    # [' (1–3 days)', ' (1–3 days):']

    if weather:
        weather = weather[1].find_parents("div")[0]
        p = weather.find_next("p").get_text()
    else:
        p = "City {} could not be found.".format(city)

    return p

## Main program.
def main(argv=None):
    if argv is None:
        argv = sys.argv

    print("Content-Type: text/html\n")

    city = argv[1].replace(
        ' ', '-') if len(argv) > 1 else 'Rio-de-Janeiro'

    g = get_weather_summary(city)
    print(json.dumps(g))


if __name__ == "__main__":
    main()
