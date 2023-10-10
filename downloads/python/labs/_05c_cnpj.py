#!/usr/bin/env python
# coding: UTF-8
#
## @package _05c_cnpj
#
#   CNPJ validation.
#
#   Some valid cnpjs:
#
#     1.  14.358.805/0001-16
#     2.  72.181.240/0001-40
#     3.  91.655.845/0001-70
#     4.  72.060.999/0001-75
#
#   Para exemplificar o processo de validação, serão
#    calculados os dígitos verificadores de um CNPJ hipotético, 11.444.777/0001-XX.
#
#    Calculando o Primeiro Dígito Verificador.
#
#    O primeiro dígito verificador do CNPJ é calculado utilizando-se o seguinte algoritmo:
#
#      1. Distribua os 12 primeiros dígitos em um quadro colocando os pesos 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 <br>
#         da esquerda para a direita, conforme indicado abaixo:
#    <PRE>
#         1       1       4       4       4       7       7       7       0      0       0       1
#         5       4       3       2       9       8       7       6       5      4       3       2
#    </PRE>
#      2. Multiplique os valores de cada coluna:
#    <PRE>
#         1       1       4       4       4       7       7       7       0      0       0       1
#         5       4       3       2       9       8       7       6       5      4       3       2
#         5       4       12      8       36      56      49      42      0      0       0       2
#    </PRE>
#      3. Calcule o somatório dos resultados (5+4+...+0+2) = 214.
#      4. O resultado obtido (214) será divido por 11. <br>
#         O resto da divisão indicará o primeiro dígito verificador: 214 % 11 = 5.
#
#    Se o resto da divisão for menor do que 2, o primeiro dígito verificador se torna zero. <br>
#    Caso contrário, subtraia o valor obtido de 11, para obter o primeiro dígito verificador: 11-5 = 6. <br>
#    Portanto, o CNPJ até agora está assim: 111.444.777-6X.
#
#    Calculando o Segundo Dígito Verificador
#
#    Para o cálculo do segundo dígito, será usado o primeiro dígito verificador já encontrado:
#
#      1. Monte uma tabela semelhante à anterior, só que desta vez usando na segunda linha os valores <br>
#      6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, já que foi incorporado mais um algarismo ao cálculo.
#    <PRE>
#         1       1       4       4       4       7       7       7       0      0       0       1      6
#         6       5       4       3       2       9       8       7       6      5       4       3      2
#    </PRE>
#      2. Multiplique os valores de cada coluna e efetue o somatório dos resultados obtidos: (6+5+...+3+12) = 221.
#    <PRE>
#         1       1       4       4       4       7       7       7       0      0       0       1      6
#         6       5       4       3       2       9       8       7       6      5       4       3      2
#         6       5       16      12      8       63      56      49      0      0       0       3      12
#    </PRE>
#      3. Divida o total do somatório por 11 e considere o resto da divisão: 221 % 11 = 10.
#      4. Se o resto da divisão for menor do que 2, o segundo dígito verificador se torna zero. <br>
#         Caso contrário, é necessário subtrair o valor obtido de 11, para gerar o segundo dígito verificador: 11-10 = 1.
#
#    Ao final dos cálculos, descobre-se que os dígitos verificadores do CNPJ hipotético são os números 6 e 1.  <br>
#    Portanto, o CNPJ completo é: 11.444.777/0001-61.
#
#   @author Paulo Roma
#   @since 30/12/2008
#   @see http://www.geradorcnpj.com/

import sys
from operator import mul
try:
    input = raw_input  # python 2
except NameError:
    pass

##
#   Validates a CNPJ using the verification digits (DV).
#
#   @param cnpj CNPJ.
#   @param dv  verification digits.
#   @return True if the cnpj is valid, and False otherwise.
#
def areValidDigits(cnpj, dv):

    cnpj2 = list(range(5, 1, -1)) + list(range(9, 1, -1))
    cnpj1 = [6] + cnpj2

    d = list(map(int, cnpj))    # transform a string to a list of integers

    # dotprod of v1 and v2: three ways of doing it
    def dotProd(v1, v2): return sum(map(mul, v1, v2))
    #                           sum (v1[i]*v2[i] for i in range(len(v1)))
    #                           sum ([i*j for (i, j) in zip(v1, v2)])

    def getDigit(n): return 0 if n <= 1 else 11 - n

    v2 = dotProd(cnpj2, d)
    v2 = getDigit(v2 % 11)

    d.append(v2)     # insert v2 at the end of d

    v1 = dotProd(cnpj1, d)
    v1 = getDigit(v1 % 11)

    return ((v2 * 10 + v1) == dv)

def main(argv=None):
    if argv is None:
        argv = sys.argv

    if (len(argv) < 2):
        cnpj = input("Enter a CNPJ to be tested: xx.xxx.xxx/xxxx-dv ")
    else:
        cnpj = argv[1]

    dv = int(cnpj[-2:])
    cnpj = cnpj[0:-2]
    cnpj = cnpj.replace(".", "").replace("/", "").replace("-", "")
    if not (len(cnpj) == 12 and cnpj.isdigit()):
        sys.exit("Invalid CNPJ")

    if areValidDigits(cnpj, dv):
        resp = ""
    else:
        resp = " not"

    print("%s-%s is%s a valid CNPJ " % (cnpj, dv, resp))


if __name__ == "__main__":
    sys.exit(main())
