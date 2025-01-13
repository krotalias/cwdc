#!/usr/bin/env python3
# coding: UTF-8
#
## @package mastermind
#   The goal of the game is to guess a random n digit number.
#
#   At each new trial, the number of digits in the guess, in the right places,
#   and the number of digits in the guess, in the wrong places, are displayed.
#
#   This script is executed every time the 'Guess!' button is pressed.
#   Initially,
#   - 'answer' (hidden),
#   - 'guess', and
#   - 'numberOfGuesses' (hidden)
#
#   are not in the form.
#
#   Once they are initialized, they go to the form as
#   the value fields of the appropriate variable.
#
#   This is a way of simulating a static variable, by passing its current value
#   to the next http request, by using the form as a storage.
#
#   Usage:
#   - press 'Esc' to see the answer or 'b' to go back to 11-python page.
#   - argv[1] is the amount of digits in the number to be guessed.
#
#   @author Paulo Roma
#   @since 26/02/2021
#   @see <a href="/cwdc/11-python/mastermind.py?4">link</a>
#   @see https://en.wikipedia.org/wiki/Mastermind_(board_game)
#   @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
#   @see https://keycode.info/
#
from __future__ import print_function

import cgi
import sys
import random

## The html form object.
form = cgi.FieldStorage()

argv = sys.argv

## Number of digits.
ndigits = argv[1] if len(argv) > 1 else '4'

try:
    ndigits = int(argv[1])
except ValueError:
    ndigits = 4

## Number of digits in guess in the right position.
reds = 0

## Number of digits in guess in the wrong position.
whites = 0

if "answer" in form:
    ## The random n digit number to be guessed.
    answer = form.getvalue("answer")
else:
    answer = ""
    for _ in range(ndigits):
        answer += str(random.randint(0, 9))

if "guess" in form:
    ## Current guess.
    guess = form.getvalue("guess")
    if len(guess) == ndigits:
        for key, digit in enumerate(guess):
            if digit == answer[key]:
                reds += 1
            else:  # digit in the wrong place or absent at all
                for answerDigit in answer:
                    if answerDigit == digit:
                        whites += 1  # digit is there, but in the wrong place
                        break
    else:
        raise ValueError("Only {} digits allowed.".format(ndigits))

else:
    guess = ""

if "numberOfGuesses" in form:
    ## Number of guesses so far.
    numberOfGuesses = int(form.getvalue("numberOfGuesses")) + 1
else:
    numberOfGuesses = 0

if numberOfGuesses == 0:
    ## Prompt to the player.
    message = "I've chosen a {} digit number. Can you guess it?".format(
        ndigits)
elif reds == ndigits:
    message = "Well done! You got in {} guesses. <a href=''>Play again</a>".format(
        str(numberOfGuesses))
else:
    message = "You have {} correct digit(s) in the right place, and {} \
               correct digit(s) in the wrong place. You have had {} \
               guess(es).".format(str(reds), str(whites), str(numberOfGuesses))


# --------------------------- HTML and Javascript code ----------------------------- #

print("""Content-type: text/html; charset=utf-8\r\n\r\n
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title> Mastermind </title>
        <style>
            body {
                background-color: #f0f0f2;
                margin: 30px;
            }
        </style>
    </head>
    <body>
""")

print(
    """
    <h1>
        <a href="https://en.wikipedia.org/wiki/Mastermind_(board_game)">
            Mastermind
        </a>
    </h1>
    <p> {} </p>
    <form method="post">
        <label for="number">Number</label>
        <input
            type = "number"
            name = "guess"
            id = "number"
            min = 0
            max = {}
            value = {}
            required autofocus
            onchange = "leadingZeros(this,{})"
            onclick = "leadingZeros(this,{})"
        >
        <input type="hidden" name="answer" value = {}>
        <input type="hidden" name="numberOfGuesses" value = {}>
        <input type="submit" value="Guess!">
    </form>
    </body>
    </html>
""".format(message, ndigits * '9', guess, ndigits, ndigits, answer, str(numberOfGuesses)))

# print the answer
print("""
    <script>
        // Left pad the input with zeros.
        function leadingZeros(input,size=2) {
            input.value = +input.value; // remove leading zeros
            while (!isNaN(input.value) && input.value.length < size) {
                input.value = "0" + input.value;
            }
        }
        window.onkeydown = function (event) {
            if (event.key === "Escape") {
                alert ("Answer = %s");
            } else if (event.key === "b") {
                window.location.href = "../11-python";
            }
        }
    </script>
""" % (answer))
