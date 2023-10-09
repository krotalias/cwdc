#!/bin/sh

# https://www.dicio.com.br/palavras-com-cinco-letras/
# https://www.dicio.com.br/palavras-com-quatro-letras/

# utf-8 sort
export LC_ALL=C

cat palavras4.txt > aaa
cat palavras5.txt >> aaa

sort aaa > palavras.txt
rm aaa
