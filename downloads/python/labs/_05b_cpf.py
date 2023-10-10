#!/usr/bin/env python
# coding: UTF-8
#
## @package _05b_cpf
#   CPF validation.
#   <p>
#   Some valid cpfs:
#     1. 757.331.783-29
#     2. 841.315.629-79
#     3. 635.111.771-20
#     4. 348.536.715-01
#
#   Para exemplificar o processo de validação, serão
#   calculados os dígitos verificadores de um CPF hipotético, 111.444.777-XX.
#
#   Calculando o Primeiro Dígito Verificador.
#
#   O primeiro dígito verificador do CPF é calculado utilizando-se o seguinte algoritmo:
#
#     1. Distribua os 9 primeiros dígitos em um quadro colocando os pesos 10, 9, 8, 7, 6, 5, 4, 3, 2, <br>
#        da esquerda para a direita, conforme indicado abaixo:
#   <PRE>
#        1       1       1       4       4       4       7       7       7
#        10      9       8       7       6       5       4       3       2
#   </PRE>
#     2. Multiplique os valores de cada coluna:
#   <PRE>
#        1       1       1       4       4       4       7       7       7
#        10      9       8       7       6       5       4       3       2
#        10      9       8       28      24      20      28      21      14
#   </PRE>
#     3. Calcule o somatório dos resultados (10+9+...+21+14) = 162.
#     4. O resultado obtido (162) será divido por 11. <br>
#        O resto da divisão indicará o primeiro dígito verificador: 162 % 11 = 8.
#
#   Se o resto da divisão for menor do que 2, o primeiro dígito verificador se torna zero. <br>
#   Caso contrário, subtraia o valor obtido de 11, para obter o primeiro dígito verificador: 11-8 = 3. <br>
#   Portanto, o CPF até agora está assim: 111.444.777-3X.
#
#   Calculando o Segundo Dígito Verificador
#
#   Para o cálculo do segundo dígito, será usado o primeiro dígito verificador já encontrado:
#
#     1. Monte uma tabela semelhante à anterior, só que desta vez usando na segunda linha os valores <br>
#     11,10,9,8,7,6,5,4,3,2, já que foi incorporado mais um algarismo ao cálculo.
#   <PRE>
#        1       1       1       4       4       4       7       7       7       3
#        11      10      9       8       7       6       5       4       3       2
#   </PRE>
#     2. Multiplique os valores de cada coluna e efetue o somatório dos resultados obtidos: (11+10+...+21+6) = 204.
#   <PRE>
#        1       1       1       4       4       4       7       7       7       3
#        11      10      9       8       7       6       5       4       3       2
#        11      10      9       32      28      24      35      28      21      6
#   </PRE>
#     3. Divida o total do somatório por 11 e considere o resto da divisão: 204 % 11 = 6.
#     4. Se o resto da divisão for menor do que 2, o segundo dígito verificador se torna zero. <br>
#        Caso contrário, é necessário subtrair o valor obtido de 11, para gerar o segundo dígito verificador: 11-6 = 5.
#
#   Ao final dos cálculos, descobre-se que os dígitos verificadores do CPF hipotético são os números 3 e 5.  <br>
#   Portanto, o CPF completo é: 111.444.777-35.
#
#   @author Paulo Roma
#   @since 30/12/2008
#   @see http://www.geradorcpf.com/

from builtins import input
from operator import mul
import sys

##
#   Validates a CPF using the verification digits (DV).
#
#   @param cpf CPF.
#   @param dv  verification digits.
#   @return True if the cpf is valid, and False otherwise.
#   @see https://docs.python.org/3/library/operator.html
#
def areValidDigits(cpf, dv):
    cpf2 = list(range(10, 1, -1))
    cpf1 = [11] + cpf2

    d = list(map(int, cpf))    # transform a string to a list of integers

    # dotprod of v1 and v2: three ways of doing it
    def dotProd(v1, v2): return sum(map(mul, v1, v2))
    #                           sum (v1[i]*v2[i] for i in range(len(v1)))
    #                           sum ([i*j for (i, j) in zip(v1, v2)])

    def getDigit(n): return 0 if n <= 1 else 11 - n

    v2 = dotProd(cpf2, d)
    v2 = getDigit(v2 % 11)

    d.append(v2)     # insert v2 at the end of d

    v1 = dotProd(cpf1, d)
    v1 = getDigit(v1 % 11)

    return ((v2 * 10 + v1) == dv)

def main(argv=None):
    if argv is None:
        argv = sys.argv

    if (len(argv) < 2):
        cpf = input("Enter a CPF to be tested: xxx.xxx.xxx-dv ")
    else:
        cpf = argv[1]

    dv = int(cpf[-2:])
    cpf = cpf[0:-2]
    cpf = cpf.replace(".", "").replace("-", "")
    if not (len(cpf) == 9 and cpf.isdigit()):
        sys.exit("Invalid CPF")

    if areValidDigits(cpf, dv):
        resp = ""
    else:
        resp = " not"

    print("%s-%s is%s a valid CPF " % (cpf, dv, resp))


if __name__ == "__main__":
    sys.exit(main())
