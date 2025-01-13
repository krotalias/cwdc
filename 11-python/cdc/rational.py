#!/usr/bin/env python
# coding: UTF-8
#
## @package rational
#
#  Desconto Racional por Dentro.
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
#        R &=& A \frac {t} {(1-(1+t)^{-n})}                              \\ &=& A \times CF \\
#        A &=& R \frac {1}{CF}
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
#     x_{n+1} &=& x_n - \frac{f(x_n)}{f'(x_n)}   \\
#       y     &=& \frac{x}{p} \frac{(1-a)}{t} (1+t), \\
#       f(t)  &=& yt - \frac{x}{p} (1-a)(1+t)    \\
#       f'(t) &=& y - \frac{x}{p} (1-a(1-p))
#     @f}
#  onde @f$a = (1+t)^{-p}@f$ e
#  o problema é equivalente a encontrar um zero da função f
#             @f[t_{n+1} = t_n - \frac{f(t)}{f'(t)}, t_o = \frac{x}{y}@f]
#
#  A função é decrescente e converge para t quando n&rarr;&infin;.
#
#  Para o caso de não haver entrada:
#  @f{eqnarray*}{
#     x_{n+1} &=& x_n - \frac{f(x_n)}{f'(x_n)} \\
#       y     &=& \frac{x}{p} \frac{(1-a)}{t}, \\
#       f(t)  &=& yt - \frac{x}{p} (1-a)       \\
#      f'(t) &=& y - x b
#     @f}
#  onde @f$a = (1+t)^{-p}, b = \frac{a}{1+t}@f$
#
#  @author Paulo Roma
#  @since 02/11/2012
#  @see <a href="/cwdc/11-python/showCodePython.php?f=cdc/rational">source</a>
#  @see <a href="/cwdc/11-python/cdc/cdc.html">link</a>
#  @see https://www.uel.br/projetos/matessencial/basico/financeira/curso.html
#  @see https://calculador.com.br/calculo/financiamento-price
#  @see https://dicascarrosusados.com/financiar-carro-por-cdc/
#  @see https://edisciplinas.usp.br/pluginfile.php/4647782/mod_resource/content/1/ENS%20-%20MTF%20191S%20-%20Aula%2007%20C%20Financiamentos.pdf
#  @see https://mundoeducacao.uol.com.br/matematica/calculo-financiamento.htm
#  @see <a href="/python/books/mod. vi - anal. econ.financ.e invest.pdf">Avaliação Financeira</a>
#
from __future__ import print_function
import sys
import getopt

##
# Data for formatting a table.
# - lenNum: Length of a float.
# - lenMes: Length of an integer.
# - precision: Number of decimal places.
# - eol: Column separator.
# - filler: Pad character.
pt = {"lenNum": 13, "lenMes": 6, "precision": 2, "eol": "|", "filler": " "}


##
# Set a down payment.
# @param dp down payment.
def setDownPayment(dp=True):
    setDownPayment.downP = dp


##
# Hold down payment status.
setDownPayment.downP = False


##
# Get the down payment.
# @return whether there is a down payment.
def getDownPayment():
    return setDownPayment.downP


##
# Set default enconding to UTF8.
#
# Needed for python 2 CGI.
# - Either use python 3, import pango or this dirty hack.
#
# Rationale:
# <pre>
# a) len('Mês') -> 4
# b) len(u'Mês') -> 3
#
# But CGI with defaultencoding ascii does not accept the latter.
# >>> len('Mês'.encode())
# Traceback (most recent call last):
#   File "<stdin>", line 1, in \<module\>
# UnicodeDecodeError: 'ascii' codec can't decode byte 0xc3 in position 1: ordinal not in range(128)
# </pre>
#
# @return sys.getdefaultencoding()
# @see @see http://jonathansoma.com/tutorials//international-data/python-and-utf-8/
#
def setEncodingUTF8():
    if sys.hexversion < 0x3000000:
        reload(sys)
        sys.setdefaultencoding("utf-8")
    return sys.getdefaultencoding()


##
# Checks whether a number is close to zero given a tolerance interval.
# @param n number.
# @param tol tolerance.
# @returns whether n is close to zero.
#
def isZero(n, tol=1.0e-8):
    return abs(n) < tol


##
# Acha a taxa que produz o preço à vista, com ou sem entrada, pelo método de Newton:
#
# @f[t_{n+1} = t_n - \frac {f(t_n)}{f'(t_n)}@f]
#
# A função é decrescente e converge para @f$t = \lim_{n\to\infty} t_{n+1}@f$.
#
# Nota: se não houve entrada, retorna getInterest2(x, y, p)
#
# @param x preço a prazo.
# @param y preço à vista.
# @param p número de parcelas.
# @return taxa, número de iterações.
# @see https://www.whitman.edu/documents/Academics/Mathematics/burton.pdf
#
def getInterest(x, y, p):
    if x == 0 or y == 0 or p == 0:
        return (0, 0)
    R = x / p

    if not getDownPayment():
        return getInterest2(x, y, p)
    elif False:
        return getInterest2(x - R, y - R, p - 1)
    else:
        t2 = x / y
        t = 0
        n = 0
        while not isZero(t2 - t):
            if n > 150:
                raise Exception("Newton is not converging!")
            t = t2
            n += 1
            tPlusOne = 1.0 + t
            a = tPlusOne ** (-p)  # (1.0+t)**(-p)
            d = y * t - R * (1 - a) * tPlusOne  # f(t_n)
            dt = y - R * (1 - a * (1 - p))  # f'(t_n)
            t2 = t - d / dt

        if isZero(t2, 1.0e-10):
            raise Exception("Newton did not converge!")
        if t2 > 1:
            raise Exception("Newton interest rate > 100%")
        return (t2 * 100.0, n)


##
# Acha a taxa que produz o preço à vista, sem entrada, pelo método de Newton:
#
# @f[t_{n+1} = t_n - \frac {f(t_n)}{f'(t_n)}@f]
#
# A função é decrescente e converge para @f$t = \lim_{n\to\infty} t_{n+1}@f$.
#
# Nota: assume-se que não houve entrada.
#
# @param x preço a prazo.
# @param y preço à vista.
# @param p número de parcelas.
# @return taxa, número de iterações.
# @see https://www.whitman.edu/documents/Academics/Mathematics/burton.pdf
# @see https://www.ufsj.edu.br/portal2-repositorio/File/profmat/TCC/2013/TCC%20Marcelo%20Moura%20Teodoro.pdf
#
def getInterest2(x, y, p):
    if x == 0 or y == 0 or p == 0:
        return (0, 0)
    R = x / p
    t2 = x / y
    t = 0
    n = 0
    while not isZero(t2 - t):
        if n > 150:
            raise Exception("Newton is not converging!")
        t = t2
        n += 1
        tPlusOne = 1.0 + t
        a = tPlusOne ** (-p)  # (1.0+t)**(-p)
        b = a / tPlusOne  # (1.0+t)**(-p-1)
        d = y * t - R * (1 - a)  # f(t_n)
        dt = y - x * b  # f'(t_n)
        t2 = t - d / dt

    if isZero(t2, 1.0e-10):
        raise Exception("Newton did not converge!")
    return (t2 * 100.0, n)


##
# Retorna o fator para atualizar o preço no instante da compra.
#
# @param x preço a prazo.
# @param p número de parcelas.
# @param t taxa.
# @param fix whether to take into account a down payment.
# @return fator para atualizar o preço e o valor presente.
#
def presentValue(x, p, t, fix=True):
    factor = 1.0 / (p * CF(t, p))
    if fix and getDownPayment():
        factor *= 1.0 + t
    return (factor, x * factor)


##
# Retorna o fator para atualizar o preço no final da compra.
#
# @param y preço à vista.
# @param p número de parcelas.
# @param t taxa.
# @param fix whether to take into account a down payment.
# @return fator para atualizar o preço e o valor futuro.
#
def futureValue(y, p, t, fix=True):
    factor = CF(t, p) * p
    if fix and getDownPayment():
        factor /= 1.0 + t
    return (factor, y * factor)


##
# Coeficiente de financiamento CDC (Crédito Direto ao Consumidor).
#
# É o fator financeiro constante que, ao multiplicar-se pelo valor presente
# de um financiamento, apura o valor das prestações:
#
# <ul>
# <li>R = CF * val</li>
# </ul>
#
# <p>Assim, ele indica o valor da prestação que deve ser paga por cada unidade monetária
# que está sendo tomada emprestada.</p>
#
# Em outras palavras: que valor de prestação deve-se pagar para cada $1,00 tomado emprestado.<br>
# Por exemplo, se o coeficiente for igual a 0,05, então o tomador de recursos
# deve pagar $0,05 de prestação para cada $1,00 de dívida.
#
# @param i taxa mensal.
# @param n período (meses).
# @return coeficiente de financiamento.
# @see <a href="../../cdc/PDFs/matematica_financeira.pdf#page=6">Parcelas</a>
# @see <img src="../../cdc/PDFs/coeficiente-de-financiamento.png" width="256">
#
def CF(i, n):
    return float(i) / (1 - (1 + i) ** -n)


##
# Desconto Racional por Dentro.
#
# @param p número de prestações.
# @param t taxa de juros mensal.
# @param x preço a prazo.
# @param y preço à vista.
# @param option seleciona o que será impresso.
# @param br whether to add a "<br>".
#
def rational_discount(p, t, x, y, option=True, br=False):
    eol = "<br>" if br else ""
    print(eol)
    if y >= x:
        print("Preço à vista deve ser menor do que o preço total:")
        sys.exit(0)
    else:
        interest, niter = getInterest(x, y, p)
        if t == 0:
            t = 0.01 * interest

        (fx, ux) = presentValue(x, p, t)
        if y <= 0:
            y = ux
        (fy, uy) = futureValue(y, p, t)
        if abs(y - ux) < 0.01:
            print("O preço à vista é igual ao preço total corrigido." + eol)
        elif y > ux:
            print(
                "O preço à vista é maior do que preço total corrigido ⇒ melhor comprar a prazo."
                + eol
            )
        else:
            print(
                "O preço à vista é menor ou igual do que preço total corrigido." + eol
            )
        delta_p = ux - y
        prct = delta_p / ux * 100.0

        print(
            "Taxa Real = %.4f%%, Iterações = %d, Fator = %.4f %s"
            % (interest, niter, fx, eol)
        )
        print("Preço à vista + juros de %.2f%% ao mês = $%.2f %s" % (t * 100, uy, eol))
        print("Preço a prazo - juros de %.2f%% ao mês = $%.2f %s" % (t * 100, ux, eol))
        print(
            "Juros Embutidos = ($%.2f - $%.2f) / $%.2f * 100 = %.2f%% %s"
            % (x, y, y, (x - y) / y * 100, eol)
        )
        print(
            "Desconto = ($%.2f - $%.2f) / $%.2f * 100 = %.2f%% %s"
            % (x, y, x, (x - y) / x * 100, eol)
        )
        print("Excesso = $%.2f - $%.2f = $%.2f %s" % (ux, y, delta_p, eol))
        print(
            "Excesso = ($%.2f - $%.2f) * %.4f = $%.2f %s"
            % (x, uy, fx, (x - uy) * fx, eol)
        )
        print("Percentual pago a mais = %.2f%% %s" % (prct, eol))
        if option:
            if (0.0 <= abs(prct)) and (prct <= 1.0):
                print("Valor aceitável." + eol)
            elif (1.0 < prct) and (prct <= 3.0):
                print("O preço está caro." + eol)
            elif 3.0 < prct:
                print("Você está sendo roubado." + eol)


##
# Retorna a Tabela Price, também chamada de sistema francês de amortização.
#
# É um método usado em amortização de empréstimos cuja principal característica
# é apresentar prestações (ou parcelas) iguais,
# <a href="https://www.jusbrasil.com.br/artigos/lei-da-usura-e-sua-relacao-com-a-tabela-price/168568742"><em>"escamoteando os juros"</em></a>.
#
# <p>O método foi apresentado em 1771 por Richard Price em sua obra
# <a href="../../cdc/PDFs/Observations on Reversionary Payments (Sixth Edition Vol I).pdf">"Observações sobre Pagamentos Remissivos"</a>.</p>
#
# Os valores das parcelas podem ser <a href="../../cdc/PDFs/Desconto_Comercial_e_Desconto_Racional.pdf">antecipados</a>,
# calculando-se o desconto correspondente.
#
# <p>O saldo devedor é sempre o valor a ser pago, quando se quitar a dívida num mês determinado.
# Esse é o tal "desconto racional", quando se antecipam parcelas.</p>
#
# @param np número de prestações.
# @param pv valor do empréstimo.
# @param t taxa de juros.
# @param pmt pagamento mensal.
# @return uma matriz cujas linhas são listas com:
#  (Mês, Prestação, Juros, Amortização, Saldo Devedor).
#
def priceTable(np, pv, t, pmt):
    dataTable = [["Mês", "Prestação", "Juros", "Amortização", "Saldo Devedor"]]
    pt = pmt if getDownPayment() else 0
    jt = at = 0
    dataTable.append(["n", "R = pmt", "J = SD * t", "U = pmt - J", "SD = PV - U"])
    dataTable.append([0, pt, "({:.4f})".format(t), 0, pv])
    if t <= 0:
        return dataTable
    for i in range(np):
        juros = pv * t
        amortizacao = pmt - juros
        saldo = pv - amortizacao
        pv = saldo
        pt += pmt
        jt += juros
        at += amortizacao
        dataTable.append(
            [i + 1, pmt, juros, amortizacao, 0 if isZero(saldo) else saldo]
        )
    dataTable.append(["Total", pt, jt, at, 0])
    return dataTable


##
# Formats a single row of the node Price Table.
#
# @param r given row.
# @param fmt selector:
# - 'f': f-string (python 3.6+),
# - 'o': new format or
# - '%%': the old % style.
# @return row formatted.
#
def formatRow(r, fmt="f"):
    row = ""
    eol = pt["eol"]
    for j, col in enumerate(r):
        if j == 0:
            if fmt == "%":
                row += eol + ("%s" % col).center(pt["lenMes"], pt["filler"]) + eol
            elif fmt == "o":
                row += eol + "{:{}^{}}".format(col, pt["filler"], pt["lenMes"]) + eol
            else:
                row += eol + f'{col:{pt["filler"]}^{pt["lenMes"]}}' + eol
        elif type(col) == float:
            if fmt == "%":
                row += ("%.*f" % (pt["precision"], col)).center(
                    pt["lenNum"], pt["filler"]
                ) + eol
            elif fmt == "o":
                row += (
                    "{:{}^{}.{}f}".format(
                        col, pt["filler"], pt["lenNum"], pt["precision"]
                    )
                    + eol
                )
            else:
                row += f'{col:{pt["filler"]}^{pt["lenNum"]}.{pt["precision"]}f}' + eol
        elif type(col) == int:
            if fmt == "%":
                row += ("{}" % (pt["precision"], col)).center(
                    pt["lenNum"], pt["filler"]
                ) + eol
            elif fmt == "o":
                row += (
                    "{:{}^{}}".format(col, pt["filler"], pt["lenNum"], pt["precision"])
                    + eol
                )
            else:
                row += f'{col:{pt["filler"]}^{pt["lenNum"]}.{pt["precision"]}f}' + eol
        elif type(col) == str:
            if fmt == "%":
                row += ("%s" % col).center(pt["lenNum"], pt["filler"]) + eol
            elif fmt == "o":
                row += "{:{}^{}}".format(col, pt["filler"], pt["lenNum"]) + eol
            else:
                row += f'{col:{pt["filler"]}^{pt["lenNum"]}}' + eol
    return row


##
# Return the Price Table in node format using characters only.
#
# @param ptb Price table.
# @returns Price table in node format using characters only.
#
def nodePriceTable(ptb):
    # Number of float columns
    nfloat = len(ptb[0]) - 1
    # Length of a row.
    lenTable = pt["lenMes"] + (pt["lenNum"] + len(pt["eol"])) * nfloat
    # Line separator.
    line = (
        pt["eol"]
        + "_" * pt["lenMes"]
        + pt["eol"]
        + ("_" * pt["lenNum"] + pt["eol"]) * nfloat
    )
    line2 = pt["filler"] + "_" * lenTable

    table = []

    # we'll use a monospace font and have to "adjust the size"
    table.append(
        "Tabela Price".center(lenTable - pt["lenNum"] - pt["lenMes"], pt["filler"])
    )
    table.append(line2)
    for i, row in enumerate(ptb):
        table.append(formatRow(row))
        if i == 0 or i == len(ptb) - 2:
            table.append(line)
    table.append(line)

    return "\n".join(table)


##
# Returns the Price Table in HTML format.
#
# @param ptb Price table.
# @returns Price table in html format.
#
def htmlPriceTable(ptb):
    table = """<table border=1>
      <caption style='font-weight: bold; font-size:200%;'>
        Tabela Price
      </caption>
      <tbody style='text-align:center;'>
    """
    for i, row in enumerate(ptb):
        table += "<tr>"
        for j, col in enumerate(row):
            if isinstance(col, float):
                col = "{:.{}f}".format(
                    col, pt["precision"] + 1 if j == 2 else pt["precision"]
                )
            elif isinstance(col, int):
                col = "{}".format(col)
            elif isinstance(col, str):
                col = str(col)
            table += (
                ("<td style='text-align:center'>" if i > 0 else "<th>")
                + col
                + ("</td>" if i > 0 else "</th>")
            )
        table += "</tr>"
    table += "</tbody></table>"

    return table


##
#  Command Line Interface for CDC.
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
#  - rational.py -n10 -t1 -x500 -y450 -e
#  - rational.py -n18 -t0 -x3297.60 -y1999
#  - rational.py -n10 -t0 -x1190 -y1094.80
#  - rational.py -n 88 -t 4.55 -x 111064.80 -y 23000
#  - rational.py -n 96 -t 0 -x 134788.8 -y 63816.24
#  - rational.py -n 4 -t 3.0 -x 1076.11  -y 1000
#  - rational.py \-\-parcelas=88 \-\-taxa=4.55 \-\-valorP=111064.80 \-\-valorV=23000 -v
#  - rational.py \-\-help
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
            opts, args = getopt.getopt(
                argv[1:],
                "hn:t:x:y:ev",
                [
                    "help",
                    "parcelas=",
                    "taxa=",
                    "valorP=",
                    "valorV=",
                    "entrada",
                    "verbose",
                ],
            )
        except getopt.GetoptError as msg:
            raise ValueError(str(msg))
        # opts is an option list of pairs [(option1, argument1), (option2, argument2)]
        # args is the list of program arguments left after the option list was stripped
        # for instance, "move.py -h --help 1 2", sets opts and args to:
        # [('-h', ''), ('--help', '')] ['1', '2']
        # something such as [('-h', '')] or [('--help', '')]
        for opt, arg in opts:
            if opt in ("-h", "--help"):
                print(
                    "Usage %s -n <nº parcelas> -t <taxa> -x <valor a prazo> "
                    "-y <valor à vista> -e -v" % argv[0]
                )
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
    else:
        pmt = pp / np
        try:
            if pmt >= pv:
                raise Exception("Prestação %.2f é maior do que o empréstimo" % pmt)
            # getInterest takes in considerarion any down payment
            t, ni = getInterest(pp, pv, np)
        except Exception as e:
            print(str(e))
            return
        print("Taxa = %.4f %% - %d iterações" % (t, ni))
        t *= 0.01

    print()
    # with or without any down payment
    cf = CF(t, np)
    pmt = pv * cf
    if pmt >= pv:
        print("Prestação %.2f é maior do que o empréstimo" % pmt)

    dp = getDownPayment()
    if dp:
        pmt /= 1 + t
        np -= 1  # uma prestação a menos
        pv -= pmt  # preço à vista menos a entrada
        pp -= pmt  # preço a prazo menos a entrada
        print("Valor financiado = %.2f - %.2f = %.2f" % (pv + pmt, pmt, pv))
        print("Entrada: %.2f" % pmt)
        # the values were set here to work without down payment
        # otherwise, rational_discount will produce a misleading interest rate
        setDownPayment(False)

    print("Coeficiente de Financiamento: %f" % cf)
    print("Prestação: $%.2f" % pmt)

    rational_discount(np, t, pp, pv, debug)

    # Tabela Price
    if debug:
        setDownPayment(dp)
        print(
            """
        {content}
        """.format(
                content=nodePriceTable(priceTable(np, pv, t, pmt))
            )
        )


if __name__ == "__main__":
    sys.exit(main())
