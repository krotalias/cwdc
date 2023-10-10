#!/usr/bin/env python
# coding: UTF-8
#
## @package _02f_rational
#
#   Desconto Racional por Dentro.
#
#  A fórmula para atualizar o preço no instante da compra, levando em conta a remuneração aplicada a cada prestação, @f$R = \frac{x}{p}@f$, é:
#    @f[x_{atualizado} = A = \frac{x}{p} \frac{(1+t)^{p}-1}{t(1+t)^{(p-1)}} = x \times \frac{(1+t)}{(p*CF)},\ CF = \frac{t}{1-(1+t)^{-p}}.@f]
#
#  O preço atualizado, @f$A@f$, voltando cada parcela, @f$R@f$,  para o tempo inicial,
#  é a soma de uma P.G. de razão q = @f$\frac {1}{(1+t)}@f$ e cujo primeiro termo é q:
#
#  @f{eqnarray*}{
#        A &=& R[(1+t)^{-1}+(1+t)^{-2}+...+(1+t)^{-n}] \\
#        A &=& R q\frac{(1-q^{n})}{1-q},
#  @f}
#
#  @f{eqnarray*}{
#        A &=& R q\frac{(1 - \frac{1}{(1+t)^{n}})} {(1-\frac{1}{(1+t)})} \\ &=& R q\frac{((1+t)^{n} - 1)}{(1+t)^{n}} \frac{(1+t)}{t} \\
#        A &=& R \frac{(1+t)^{n} - 1} {t(1+t)^{n}}                       \\ &=& R \frac {(1-(1+t)^{-n})}{t} \Rightarrow \\
#        R &=& A \frac {t} {(1-(1+t)^{-n})}                              \\ &=& A \times CF
#  @f}
#  onde @f$R = \frac{x}{p}@f$ é o valor de cada parcela.
#
#  Como, neste exercício, a primeira parcela é paga no ato da compra,
#  na realidade, @f$n = p-1@f$ e deve-se somar @f$R = \frac{x}{p}@f$ (a entrada):
#
#  @f[A = R (1 + \frac{q(1-q^{(p-1)})}{(1-q)}).@f]
#
#  Fazendo-se as substituições necessárias, chega-se a fórmula
#  usada no programa:
#  @f{eqnarray*}{
#      q\frac{(1 - \frac{1}{(1+t)^{(p-1)}})} {(1-\frac{1}{(1+t)})} &=& q\frac{((1+t)^{(p-1)} - 1)}{(1+t)^{(p-1)}} \frac{(1+t)}{t} \\
#  \frac{1}{(1+t)}((1+t)^{(p-1)} - 1) \frac{(1+t)}{t(1+t)^{(p-1)}} &=& \frac{(1+t)^{(p-1)} - 1} {t(1+t)^{(p-1)}} \Rightarrow (somando\ 1) \\
#                      1+\frac{(1+t)^{(p-1)} - 1} {t(1+t)^{(p-1)}} &=& \frac{t(1+t)^{(p-1)} + (1+t)^{(p-1)} - 1}{t(1+t)^{(p-1)}} \\
#                   \frac{(t+1)(1+t)^{(p-1)} - 1} {t(1+t)^{(p-1)}} &=& \frac{(1+t)^{p} - 1}{t(1+t)^{(p-1)}} = \frac{(1+t)-(1+t)^{-(p-1)}}{t} \Rightarrow (recolocando\ R) \\
#                                R (1+t) \frac {(1-(1+t)^{-p})}{t} &=& R \frac {(1+t)}{CF}
#  @f}
#
#  Nota:
#  Achar a taxa "t" que produz o preço à vista "y" requer o método de Newton:
#     @f{eqnarray*}{
#     x_{n+1} &=& x_n - \frac{f(x_n)}{f'(x_n)} \\
#       y     &=& \frac{x}{p} \frac{(c-1)}{tb}, \\
#       f(t)  &=& ytb - \frac{x}{p} (c-1)       \\
#       f'(t) &=& y (b + t (p-1) a) - xb
#     @f}
#  onde @f$a = (1+t)^{(p-2)}, b = (1+t)^{(p-1)}, c = (1+t)^{p}@f$ e
#  o problema é equivalente a encontrar um zero da função f
#             @f[t_{n+1} = t_n - \frac{f(t)}{f'(t)}, t_o = \frac{x}{y}@f]
#
#   A função é decrescente e converge para t quando n&rarr;&infin;.
#
#   @author Paulo Roma
#   @since 02/11/2012
#   @see <a href="/cwdc/11-python/showCodePython.php?f=python/labs/hidden/_02f_rational">source</a>
#   @see <a href="/python/html/cdc.html">link</a>
#   @see https://www.uel.br/projetos/matessencial/basico/financeira/curso.html
#   @see https://calculador.com.br/calculo/financiamento-price
#   @see https://dicascarrosusados.com/financiar-carro-por-cdc/
#   @see https://edisciplinas.usp.br/pluginfile.php/4647782/mod_resource/content/1/ENS%20-%20MTF%20191S%20-%20Aula%2007%20C%20Financiamentos.pdf
#   @see https://mundoeducacao.uol.com.br/matematica/calculo-financiamento.htm
#   @see <a href="/python/books/mod. vi - anal. econ.financ.e invest.pdf">Avaliação Financeira</a>
#
from __future__ import print_function
import sys
import getopt

## Set a down payment.
def setDownPayment(dp=True):
    setDownPayment.downP = dp


setDownPayment.downP = False

## Get the down payment.
def getDownPayment():
    return setDownPayment.downP

## Set default enconding to UTF8.
#
#  Needed for python 2 CGI.
#  - Either use python 3, import pango or this dirty hack.
#
#  Rationale:
#  <pre>
#  a) len('Mês') -> 4
#  b) len(u'Mês') -> 3
#
#  But CGI with defaultencoding ascii does not accept the latter.
#  >>> len('Mês'.encode())
#  Traceback (most recent call last):
#    File "<stdin>", line 1, in \<module\>
#  UnicodeDecodeError: 'ascii' codec can't decode byte 0xc3 in position 1: ordinal not in range(128)
#  </pre>
#
#  @return sys.getdefaultencoding()
#  @see @see http://jonathansoma.com/tutorials//international-data/python-and-utf-8/
#
def setEncodingUTF8():
    if sys.hexversion < 0x3000000:
        reload(sys)
        sys.setdefaultencoding('utf-8')
    return sys.getdefaultencoding()

##
#   Acha a taxa que produz o preço à vista pelo método de Newton:
#
#   @f[t_{n+1} = t_n - \frac {f(t_n)}{f'(t_n)}@f]
#
#   A função é decrescente e converge para @f$t = \lim_{n\to\infty} t_{n+1}@f$.
#
#   Nota: se não houve entrada, retorna getInterest2(x, y, p)
#
#   @param x preço a prazo.
#   @param y preço à vista.
#   @param p número de parcelas.
#   @return taxa, número de iterações.
#
def getInterest(x, y, p):
    if not getDownPayment():
        return getInterest2(x, y, p)

    t2 = x / y
    t = 0
    n = 0
    while (abs(t2 - t) > 1.0e-04):
        t = t2
        n += 1
        tPlusOne = 1.0 + t
        a = tPlusOne**(p - 2)                   # (1.0+t)**(p-2)
        b = a * tPlusOne                        # (1.0+t)**(p-1)
        c = b * tPlusOne                        # (1.0+t)**p
        d = y * t * b - (x / p) * (c - 1)       # f(t_n)
        dt = y * (b + t * (p - 1) * a) - x * b  # f'(t_n)
        t2 = t - d / dt
    return (t2 * 100.0, n)

##
#   Acha a taxa que produz o preço à vista pelo método de Newton:
#
#   @f[t_{n+1} = t_n - \frac {f(t_n)}{f'(t_n)}@f]
#
#   A função é decrescente e converge para @f$t = \lim_{n\to\infty} t_{n+1}@f$.
#
#   Nota: assume-se que não houve entrada.
#
#   @param x preço a prazo.
#   @param y preço à vista.
#   @param p número de parcelas.
#   @return taxa, número de iterações.
#
def getInterest2(x, y, p):
    t2 = x / y
    t = 0
    n = 0
    while (abs(t2 - t) > 1.0e-04):
        t = t2
        n += 1
        tPlusOne = 1.0 + t
        a = tPlusOne**(-p)              # (1.0+t)**(-p)
        b = a / tPlusOne                # (1.0+t)**(-p-1)
        d = y * t - (x / p) * (1 - a)   # f(t_n)
        dt = y - x * b                  # f'(t_n)
        t2 = t - d / dt
    return (t2 * 100.0, n)

##
#   Retorna o fator para atualizar o preço no instante da compra.
#
#   @param x preço a prazo.
#   @param p número de parcelas.
#   @param t taxa.
#   @return fator para atualizar o preço e o valor presente.
#
def presentValue(x, p, t):
    factor = 1.0 / (p * CF(t, p))
    if getDownPayment():
        factor *= (1.0 + t)
    return (factor, x * factor)

##
#   Retorna o fator para atualizar o preço no final da compra.
#
#   @param y preço à vista.
#   @param p número de parcelas.
#   @param t taxa.
#   @return fator para atualizar o preço e o valor futuro.
#
def futureValue(y, p, t):
    factor = CF(t, p) * p
    if getDownPayment():
        factor /= (1.0 + t)
    return (factor, y * factor)

## Coeficiente de financiamento CDC (Crédito Direto ao Consumidor).
#
#  @param i taxa mensal.
#  @param n período (meses).
#
def CF(i, n):
    return float(i) / (1 - (1 + i)**-n)

##
#   Desconto Racional por Dentro.
#
#   @param p número de prestações.
#   @param t taxa de juros mensal.
#   @param x preço a prazo.
#   @param y preço à vista.
#   @param option seleciona o que será impresso.
#
def rational_discount(p, t, x, y, option=True):
    if (y >= x):
        print('Preço à vista deve ser menor do que o preço total:')
        sys.exit(0)
    else:
        (fx, ux) = presentValue(x, p, t)
        if y <= 0:
            y = ux
        (fy, uy) = futureValue(y, p, t)
        if abs(y - ux) < 0.01:
            print("O preço à vista é igual ao preço total corrigido.")
        elif (y > ux):
            print(
                "O preço à vista é maior do que preço total corrigido ⇒ melhor comprar a prazo.")
        else:
            print("O preço à vista é menor ou igual do que preço total corrigido.")
        delta_p = ux - y
        prct = delta_p / ux * 100.0

        interest, niter = getInterest(x, y, p)

        print('Taxa Real = %.4f%%, Iterações = %d, Fator = %.4f' %
              (interest, niter, fx))
        print('Preço à vista + juros de %.2f%% ao mês = $%.2f' % (t * 100, uy))
        print('Preço a prazo - juros de %.2f%% ao mês = $%.2f' % (t * 100, ux))
        print('Juros Embutidos = ($%.2f - $%.2f) / $%.2f * 100 = %.2f%%' %
              (x, y, y, (x - y) / y * 100))
        print('Desconto = ($%.2f - $%.2f) / $%.2f * 100 = %.2f%%' %
              (x, y, x, (x - y) / x * 100))
        print('Excesso = $%.2f - $%.2f = $%.2f' % (ux, y, delta_p))
        print('Excesso = ($%.2f - $%.2f) * %.4f = $%.2f' %
              (x, uy, fx, (x - uy) * fx))
        print('Percentual pago a mais = %.2f%%' % prct)
        if option:
            if (0.0 <= prct) and (prct <= 1.0):
                print('Valor aceitável.')
            elif (1.0 < prct) and (prct <= 3.0):
                print('O preço está caro.')
            elif (3.0 < prct):
                print('Você está sendo roubado.')

## Retorna a Tabela Price, também chamada de sistema francês de amortização.
#
#  É um método usado em amortização de empréstimos cuja principal característica
#  é apresentar prestações (ou parcelas) iguais.
#
#  O método foi apresentado em 1771 por Richard Price em sua obra "Observações sobre Pagamentos Remissivos".
#
#  @param np número de prestações.
#  @param pv valor do empréstimo.
#  @param t taxa de juros.
#  @param pmt pagamento mensal.
#  @return uma matriz cujas linhas são listas com:
#   (mês, prestação, juros, amortização, saldo devedor).
#
def priceTable(np, pv, t, pmt):
    dataTable = [[u"Mês", u"Prestação", "Juros",
                  u"Amortização", "Saldo Devedor"]]
    pt = jt = at = 0
    for i in range(np):
        juros = pv * t
        amortizacao = pmt - juros
        saldo = pv - amortizacao
        pv = saldo
        pt += pmt
        jt += juros
        at += amortizacao
        dataTable.append([i + 1, pmt, juros, amortizacao, saldo])
    dataTable.append(['Total', pt, jt, at, 0])
    return dataTable

## Print a single row of the Price Table.
#
#  @param pt given row.
#  @param fmt selector:
#  - 'f': f-string (python 3.6+),
#  - 'o': new format or
#  - '%%': the old % style.
#
def printRow(pt, fmt='o'):
    if fmt == '%':
        print('|' + ("%s" % pt[0]).center(lenMes, filler), end=eol)
    elif fmt == 'o':
        print(u"|{:{}^{}}".format(pt[0], filler, lenMes), end=eol)
#   else:            print(f"|{pt[0]:{filler}^{lenMes}}", end=eol) # integer or string
    for j in range(1, len(pt)):
        if type(pt[j]) == float:
            if fmt == '%':
                print(("%.*f" % (precision, pt[j])
                       ).center(lenNum, filler), end=eol)
            elif fmt == 'o':
                print("{:{}^{}.{}f}".format(
                    pt[j], filler, lenNum, precision), end=eol)
#          else:            print(f"{pt[j]:{filler}^{lenNum}.{precision}f}", end=eol)
        else:  # str
            if fmt == '%':
                print(("%s" % pt[j]).center(lenNum, filler), end=eol)
            elif fmt == 'o':
                print(u"{:{}^{}}".format(pt[j], filler, lenNum), end=eol)
#          else:            print(f"{pt[j]:{filler}^{lenNum}}", end=eol)

## Print the Price Table.
def printTable(pt):
    global lenNum, lenMes, eol, filler, precision, lenTable
    # Length of a float.
    lenNum = 13
    # Length of an integer.
    lenMes = 6
    # Number of decimal places.
    precision = 2
    # End of Line string.
    eol = '|'
    # Pad character.
    filler = ' '
    # Length of a row.
    lenTable = lenMes + (lenNum + len(eol)) * (len(pt[0]) - 1)
    # Line separator.
    line = '|' + '_' * lenMes + '|' + ('_' * lenNum + '|') * 4
    line2 = ' ' + '_' * lenTable

    print("Tabela Price".center(lenTable, filler))
    print(line2)
    for i in range(0, len(pt)):
        printRow(pt[i])
        print()
        if i == 0 or i == len(pt) - 2:
            print(line)
    print(line)

## Programa principal para testes.
#
#  @param argv command line arguments:
#  - h help
#  - n número de parcelas.
#  - t taxa mensal.
#  - x valor da compra a prazo.
#  - y valor da compra à vista.
#  - e indica uma entrada.
#  - v verbose mode
#
#  Usage:
#  - _02f_rational.py -n10 -t1 -x500 -y450 -e
#  - _02f_rational.py -n18 -t0 -x3297.60 -y1999
#  - _02f_rational.py -n10 -t0 -x1190 -y1094.80
#  - _02f_rational.py -n 88 -t 4.55 -x 111064.80 -y 23000
#  - _02f_rational.py -n 96 -t 0 -x 134788.8 -y 63816.24
#  - _02f_rational.py -n 4 -t 3.0 -x 1076.11  -y 1000
#  - _02f_rational.py --parcelas=88 --taxa=4.55 --valorP=111064.80 --valorV=23000 -v
#  - _02f_rational.py --help
#
#  @see https://mkaz.blog/code/python-string-format-cookbook/
#  @see https://www.w3schools.com/python/ref_string_format.asp
#  @see https://pyformat.info
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    # number of payments.
    np = 0
    # interest rate
    t = 0
    # initial price
    pv = 0
    # final price
    pp = 0
    # debugging state.
    debug = False
    # holds the existence of a down payment.
    setDownPayment(False)

    try:
        try:
            # options that require an argument should be followed by a colon (:)
            # long options, which require an argument, should be followed by an equal sign (=)
            opts, args = getopt.getopt(argv[1:], "hn:t:x:y:ev",
                                       ["help", "parcelas=", "taxa=", "valorP=", "valorV=", "entrada", "verbose"])
        except getopt.GetoptError as msg:
            raise ValueError(str(msg))
        # opts is an option list of pairs [(option1, argument1), (option2, argument2)]
        # args is the list of program arguments left after the option list was stripped
        # for instance, "move.py -h --help 1 2", sets opts and args to:
        # [('-h', ''), ('--help', '')] ['1', '2']
        # something such as [('-h', '')] or [('--help', '')]
        for opt, arg in opts:
            if opt in ("-h", "--help"):
                print("Usage %s -n <nº parcelas> -t <taxa> -x <valor a prazo> "
                      "-y <valor à vista> -e -v" % argv[0])
                return 1
            elif opt in ("-n", "--parcelas"):
                np = int(arg)
            elif opt in ("-t", "--taxa"):
                t = float(arg) / 100.0
            elif opt in ("-x", "--valorP"):
                pp = float(arg)
            elif opt in ("-y", "--valorV"):
                pv = float(arg)
            elif opt in ("-v", "--verbose"):
                debug = True
            elif opt in ("-e", "--entrada"):
                setDownPayment()
    except ValueError as err:
        print(str(err) + "\nFor help, type: %s --help" % argv[0])
        return 2

    while np <= 0 or pv <= 0:
        try:
            np = int(input("Forneça o número de parcelas: "))
            t = float(input("Forneça a taxa de juros: ")) / 100.0
            pp = float(input("Forneça o preço a prazo: "))
            pv = float(input("Forneça o preço à vista: "))
        except (EOFError, SyntaxError, ValueError, NameError, KeyboardInterrupt) as err:
            setDownPayment()
            rational_discount(10, 0.01, 500, 450, debug)
            sys.exit(err)

    if t > 0:
        if pp <= 0:
            (_, pp) = futureValue(pv, np, t)
        rational_discount(np, t, pp, pv, debug)
    else:
        t, ni = getInterest(pp, pv, np)
        print("Taxa = %.4f %% - %d iterações" % (t, ni))
        t *= 0.01
        print()
        rational_discount(np, t, pp, pv, debug)

    print()
    cf = CF(t, np)
    pmt = pv * cf
    if getDownPayment():
        pmt /= (1 + t)
        np -= 1    # uma prestação a menos
        pv -= pmt  # preço à vista menos a entrada
        print("Valor financiado = %.2f - %.2f = %.2f" % (pv + pmt, pmt, pv))

    print("Coeficiente de Financiamento: %f" % cf)
    print("Prestação: $%.2f" % pmt)

    # Tabela Price
    if debug:
        printTable(priceTable(np, pv, t, pmt))


if __name__ == "__main__":
    sys.exit(main())
