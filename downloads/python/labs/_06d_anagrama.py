#!/usr/bin/env python
# coding: UTF-8
#
## @package _06d_anagrama
#
#   Checking for anagrams.
#
#   An anagram is a word or phrase formed by reordering the letters of
#   another word or phrase, such as "satin" to "stain".
#
#   Examples:
#      1. "porta" and "tropa"
#      2. "Mary" and "Army".
#      3. "Tom Cruise" and "So I'm cuter"
#      4. "Tom Marvolo Riddle" and "I am Lord Voldemort"
#      5.  "Mother-in-law" and "Woman Hitler"
#      6.  "The earthquakes" and "That queer shake"
#      7.  "Debit card" and "Bad credit"
#      8.  "Slot machines" and "Cash lost in 'em"
#      9.  "School master" and "The classroom"
#      10. "Eleven plus two" and "Twelve plus one"
#      11. "Dormitory" and "Dirty room"
#      12. "Punishment" and "Nine Thumps"
#      13. "Desperation" and "A rope ends it"
#      14. "The Morse code" and "Here come dots"
#      15. "Snooze alarms" and "Alas! No more Zs"
#      16. "A decimal point" and "I'm a dot in place"
#      17. "Astronomer" and "Moon starer"
#      18. "Fir cones" and "Conifers"
#      19. "The eyes" and "They see"
#      20. "Payment received" and "Every cent paid me"
#      21. "Conversation" and "Voices rant on"
#      22. "The public art galleries" and "Large picture halls, I bet"
#      23. "Election results" and "Lies – let's recount"
#      24. "Halley's Comet" and "Shall yet come"
#      25. "The Hurricanes" and "These churn air"
#
#   @author Paulo Roma
#   @see http://en.wikipedia.org/wiki/Anagram
#   @see http://www.fun-with-words.com/anag_example.html

import sys

##
#   Checks whether two words are anagrams.
#   An anagram is a type of word play, which is the result of rearranging
#   the letters of a word or phrase to produce a new word or phrase,
#   using all the original letters exactly once.
#   <p>
#   For example: "orchestra" can be rearranged into "carthorse".
#
#   @param str1 first string.
#   @param str2 second string.
#   @return True if str1 and str2 are anagrams, and False otherwise.
#
def anagram(str1, str2):
    # converte a string str1 para uma lista
    palavra1 = list(str1.replace(" ", "").lower())
    # converte a string str2 para uma lista
    palavra2 = list(str2.replace(" ", "").lower())

    palavra1.sort()                                    # ordena as listas
    palavra2.sort()
    return palavra1 == palavra2

##
#   Checks whether two words or phrases are anagrams.
#   An anagram is a type of word play, which is the result of rearranging
#   the letters of a word or phrase to produce a new word or phrase,
#   using all the original letters exactly once.
#   <p>
#   For example: "orchestra" can be rearranged into "carthorse".
#
#   @param a first string.
#   @param b second string.
#   @return True if str1 and str2 are anagrams, and False otherwise.
#
def isAnagram(a, b):
    first = [0] * 26
    second = [0] * 26

    # first[0] will contain the number of 'a's of a
    # first[1] will contain the number of 'b's of a
    # first[25] will contain the number of 'z's of a
    for c in a:
        c = c.lower()
        if c > 'a' and c < 'z':
            first[ord(c) - ord('a')] += 1

    for c in b:
        c = c.lower()
        if c > 'a' and c < 'z':
            second[ord(c) - ord('a')] += 1

    return first == second

##
#   Determines whether the given hidden word can be obtained
#   from the main word, by erasing some of its letters.
#
#   @param hiddenWord the word we're looking for
#   @param word main word
#   @return true if we can find the hidden word in main word
#
def containsHiddenWord(hiddenWord, word):
    # index into hidden word
    i = 0

    # index into main word
    j = 0

    # numbers of letters found
    count = 0

    while i < len(hiddenWord):
        # find the letter in main word starting from j
        while j < len(word):
            if word[j] != hiddenWord[i]:
                j += 1
            else:
                count += 1
                break
        i += 1

    # return true if we found them all
    return count == len(hiddenWord)

def main():
    try:
        str1 = raw_input("Entre com uma palavra: ")
        str2 = raw_input("Entre com uma palavra: ")
    except NameError:
        str1 = input("Entre com uma palavra: ")
        str2 = input("Entre com uma palavra: ")

    if (anagram(str1, str2)):
        print("\n\"%s\" e \"%s\" são anagramas" % (str1, str2))
    else:
        print("\n\"%s\" e \"%s\" não são anagramas" % (str1, str2))

    if (isAnagram(str1, str2)):
        print("\n\"%s\" e \"%s\" são anagramas\n" % (str1, str2))
    else:
        print("\n\"%s\" e \"%s\" não são anagramas\n" % (str1, str2))

    mainWord = "impossible"
    testWord = ["pile", "p", "pila", "impossible", "", "piel", "impossibility"]
    for w in testWord:
        print("%s in %s - %s" % (w, mainWord, containsHiddenWord(w, mainWord)))


if __name__ == "__main__":
    sys.exit(main())
