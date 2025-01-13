#!/usr/bin/env python
# coding: UTF-8
#
## @package cdi
#
#  Several financial mathematics functions aiming at
#  calculating the profit from an application based on CDI.
#
#  Usage:
#  - cdi.py -c 1000 -i 17.5 -t 95 -s 0.10 -m12
#  - cdi.py -c 1 -i 22.5 -t 93 -s 0.38 -m 3
#
#  @author Paulo Roma
#  @since 25/01/2020
#  @see <a href="/cwdc/11-python/showCodePython.php?f=cdi/cdi">source</a>
#  @see <a href="/cwdc/11-python/cdi/cdi.html">link</a>
#  @see https://blog.magnetis.com.br/rentabilidade-liquida-cdb/
#  @see https://www.euqueroinvestir.com/cdi-certificado-de-deposito-interbancario/
#  @see https://www.btgpactualdigital.com/blog/conceitos-basicos/taxa-di-o-que-e-como-calcular-como-funciona-e-importancia/amp
#  @see https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores&aba=5
#  @see http://www.debentures.com.br/espacodoinvestidor/pop_calculo_di_spred.asp
#
import sys
import math
import getopt

## Compound interest.
#  It is the addition of interest to the principal sum of a loan or deposit,
#  or in other words, interest on interest.
#
#  It is the result of reinvesting interest, rather than paying it out,
#  so that interest in the next period is then earned on the principal sum,
#  plus previously accumulated interest.
#
#  The accumulation function shows what $1 grows to after any length of time.
#
#  @param r nominal interest rate.
#  @param t the overall length of time the interest is applied
#           (expressed using the same time units as r, usually years).
#  @param n is the compounding frequency.
#  @return interest earned in the period: @f$(1 + r/n)^{nt} - 1@f$
#
#  @see https://en.wikipedia.org/wiki/Compound_interest
#  @see https://www.investopedia.com/articles/07/continuously_compound.asp
#  @see https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial
#
def jc(r, t, n=1):
    return (1 + r / float(n))**(n * t) - 1

## Continuous compounding.
#  Calculates the mathematical limit that compound interest can reach
#  if it's calculated and reinvested into an account's balance
#  over a theoretically infinite number of periods.
#
#  @param r interest rate.
#  @param t the overall length of time the interest is applied.
#
def cc(r, t):
    return math.exp(r * t) - 1

## Compounding basis.
#  Convert an interest rate from one compounding basis to another compounding basis.
#  - @f$(1 + r_1/n_1)^{n_1} = (1 + r_2/n_2)^{n_2}@f$
#  - @f$(1 + r_1/n_1)^{1/n_2} = (1 + r_2/n_2)^{1/n_1}@f$
#  - @f$r_2 = ((1 + r_1/n_1)^{n_1/n_2} - 1)\ n_2@f$
#
#  @param r1 base interest rate with compounding frequency n1.
#  @param n1 is the base compounding frequency (e.g. 1 for year).
#  @param n2 is the final compounding frequency (e.g. 12 for monthly).
#  @return r2 the final interest rate with compounding frequency n2.
#
#  @see https://en.wikipedia.org/wiki/Compound_interest
#  @see https://www.investopedia.com/articles/07/continuously_compound.asp
#  @see https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial
#  @see https://www.vcalc.com/equation/?uuid=a1e2289d-f928-11e2-968f-bc764e049c3d
#
def bc(r1, n1, n2):
    return ((1 + r1 / float(n1))**(float(n1) / float(n2)) - 1) * n2

## Convert a daily rate to an annual rate.
#  In financial math we consider a 252 day year.
#
#  @param d daily interest rate.
#  @param wd number of working days per year.
#  @return the yearly interest rate given the daily rate.
def day2year(d, wd=252):
    return 100 * jc(d, wd)

## Convert a daily rate to a monthly rate.
#  In financial math we consider a 21 day month.
#
#  @param d daily interest rate.
#  @param wd number of working days per month.
#  @return the monthly interest rate given the daily rate.
def day2month(d, wd=21):
    return 100 * jc(d, wd)

## Convert an annual rate to a monthly rate.
#
#  @param a annual interest rate.
#  @return the monthly interest rate given the yearly rate.
def year2month(a):
    return 100 * jc(a, 1 / 12.0)

## Convert an annual rate to a daily rate.
#
#  @param a annual interest rate.
#  @param wd number of working days per year.
#  @return the daily interest rate given the yearly rate.
def year2day(a, wd=252):
    return 100 * jc(a, 1 / float(wd))

## Convert a monthly rate to a daily rate.
#
#  @param m monthly interest rate.
#  @param wd number of working days per month.
#  @return the daily interest rate given the monthly rate.
def month2day(m, wd=21):
    return 100 * jc(m, 1 / float(wd))

## Convert a monthly rate to an annual rate.
#
#  @param m monthly interest rate.
#  @return the yearly interest rate given the monthly rate.
def month2year(m):
    return 100 * jc(m, 12)

## Calculates the logarithm of 2 in the base 1+r.
#  Can be approximated by 72/(100*r).
#
#  It is used to calculate the amount of time needed
#  to double the principal when subjected to a given rate.
#
#  @param r nominal interest rate.
#  @return the time to double the principal.
#
def doublePrincipal(r):
    return math.log(2, 1 + r)

## Calculates the Effective Annual Rate (EAR)
#  or Annual Percentage Yield (APY).
#
#  An APR takes only simple interest into account.
#  In contrast, the annual percentage yield (APY),
#  also known as the effective annual rate (EAR),
#  takes compound interest into account.
#
#  As a result, an APY tends to be larger
#  than an APR on the same loan
#
#  @param apr annual percentage rate.
#  @param t number of years.
#  @return EAR, which is the daily compounding rate applied during 365 days.
#  @see https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial/credit-card-interest/v/annual-percentage-rate-apr-and-effective-apr?modal=1
#
def EAR(apr, t=1):
    return 100 * jc(apr * 0.01, t, 365)

## Calculates the APR.
#  An annual percentage rate (APR) is the annual rate charged
#  for borrowing or earned through an investment.
#
#  APR is expressed as a percentage that represents the actual
#  yearly cost of funds over the term of a loan.
#
#  This includes any fees or additional costs associated with
#  the transaction but does not take compounding into account.
#
#  @param ear effective annual percentage rate.
#  @param t number of years.
#  @return the APR.
#  @see https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial/credit-card-interest/v/annual-percentage-rate-apr-and-effective-apr?modal=1
#
def APR(ear, t=1):
    return 100 * bc(ear * 0.01, t, 365)

## Calcula o montante final, imposto, rendimento e rentabilidade equivalente.
#
#  @param  c   capital
#  @param  cdi taxa cdi anual
#  @param  p   taxa poupança anual = 0.70 * selic
#  @param  t   rentabilidade da aplicação em função do CDI
#  @param  i   alíquota do imposto de renda
#  @param  m   meses
#  @return
#        - montante da aplicação,
#        - montante poupança,
#        - imposto de renda retido,
#        - rendimento em m meses(%),
#        - rendimento em m meses,
#        - rendimento líquido em 1 mês,
#        - rentabilidade para igualar poupança (%) CDI
#
def CDB(c, cdi, p, t, i, m=1):
    cdim = year2month(cdi * t) * 0.01
    pm = year2month(p) * 0.01

    r = jc(cdim, m) * c     # rendimento

    rp = jc(pm, m) * c      # rendimento poupança

    ir = i * r              # imposto pago

    m = c + r - ir          # montante da aplicação

    mp = c + rp             # montante poupança

    rend = (m - c) / c      # rendimento = (r-ir) = (r-i*r) = r(1-i)
    rend2 = r * (1 - i) / c

    # o imposto é cobrado ao final e não mensalmente
    # rentabilidade líquida descontado impostos em 1 mês
    rl = cdim * (1 - i)
    assert (rend - rend2) < 0.001

    # cdi*T*c*(1-i)/c = p
    T = p / ((1 - i) * cdi)

    return m, mp, ir, rend * 100, rend2, rl, T * 100

## Retorna a alíquota do imposto de renda dado o tempo da aplicação.
#
#  @param m número de meses.
#  @return IR.
#
def getIR(m):
    if m > 0 and m <= 6:
        return 0.225
    elif m > 6 and m <= 12:
        return 0.20
    elif m > 12 and m <= 24:
        return 0.175
    elif m > 24:
        return 0.15

    return 0.0

## Main program for testing.
#
# @param argv command line arguments.
# - h --help ajuda.
# - c --cap capital inicial.
# - a --cdia taxa CDI anual.
# - i --ir alíquota do imposto de renda.
# - t --tax rentabilidade oferecida em função do CDI.
# - s --sel taxa selic.
# - m --meses período da aplicação.
#
# Usage:
#  - cdi.py -c 1 -i 22.5 -t 90 -s 0.2588 -a 0.0440
#  - cdi.py -c 1000 -i 17.5 -t 95 -a 0.095 -s 0.10
#  - cdi.py -c 1 -i 22.5 -t 93 -a 0.3766 -s 0.2588
#  - cdi.py --help
#
# @see https://www.bcb.gov.br/controleinflacao/taxaselic
#
def main(argv=None):
    if argv is None:
        argv = sys.argv

    # 16/03/2022 - Sistema Especial de Liquidação e de Custódia.
    sel = 11.25 / 100   # taxa selic
    cdia = sel - 0.001  # taxa cdi anual

    c = 1000            # capital
    t = 100 / 100.0     # rentabilidade da aplicação em função do CDI
    m = 1               # número de meses

    IR = False
    try:
        try:
            # options that require an argument should be followed by a colon (:).
            # Long options, which require an argument should be followed by an equal sign ('=').
            opts, args = getopt.getopt(argv[1:], "hc:a:i:t:s:m:",
                                       ["help", "cap=", "cdia=", "ir=", "tax=", "sel=", "meses="])
        except getopt.GetoptError as msg:
            raise ValueError(str(msg))
        # opts is an option list of pairs [(option1, argument1), (option2, argument2)]
        # args is the list of program arguments left after the option list was stripped
        # for instance, "move.py -h --help 1 2", sets opts and args to:
        # [('-h', ''), ('--help', '')] ['1', '2']
        # something such as [('-h', '')] or [('--help', '')]
        for opt, arg in opts:
            if opt in ("-h", "--help"):
                print("Usage {} -c [capital] -a [CDI anual] -s [Selic] "
                      "-i [alíquota IR] -t [taxa CDI] -m [meses] -h [help]".format(argv[0]))
                return 1
            elif opt in ("-c", "--cap"):
                c = float(arg)
            elif opt in ("-a", "--cdia"):
                cdia = float(arg)  # not a percentage
            elif opt in ("-i", "--ir"):
                i = float(arg) / 100.0
                IR = True
            elif opt in ("-t", "--tax"):
                t = float(arg) / 100.0
            elif opt in ("-s", "--sel"):
                sel = float(arg)  # not a percentage
            elif opt in ("-m", "--meses"):
                m = int(arg)
    except ValueError as err:
        print("{}\nFor help, type: {} --help".format(str(err), argv[0]))
        return 2

    if not IR:
        i = getIR(m)

    # taxa poupança = 0.70 * selic
    s = 0.70 * sel if sel <= 0.085 else month2year(0.005) / 100
    cdim = year2month(cdia) * 0.01  # taxa cdi no mês
    p = year2month(s) * 0.01        # taxa poupança no mês

    mc, mp, ir, rend, rend2, tl, T = CDB(c, cdia, s, t, i, m)

    # rendimento anual com imposto
    rapp = month2year(tl / (1 - i)) * (1 - i)
    rappm = year2month(rapp * 0.01)
    # errado: rendimento é cobrado apenas no final e não mês a mês
    # rapp = month2year(jc(rend2, 1.0 / m))

    # GREEN ----
    print("")
    print("Capital = ${:.2f}".format(c))
    print("Taxa Selic = {:.2f}%".format(100 * sel))
    print("CDI = {:.2f}% ao ano = {:.4f}% ao mês = {:.6f}% ao dia".format(
        100 * cdia, 100 * cdim, year2day(cdia)))
    print("Taxa Poup = {:.2f}% ao ano = {:.4f}% ao mês\n".format(
        month2year(p), 100 * p))

    print("IR = {:.1f}%\n".format(100 * i))

    print("Rentabilidade = {:.1f}% CDI = {:.2f}% ao ano = {:.4f}% ao mês".format(
        100 * t, 100 * t * cdia, year2month(t * cdia)))
    print("Com impostos  = {:.2f}% CDI = {:.2f}% ao ano = {:.4f}% ao mês\n".format
          (100 * t * (1 - i), rapp, rappm))

    print("Meses = %d\n" % m)

    # BLUE ----
    print("Montante Aplicação = ${:.2f}".format(mc))
    print("Montante Poupança  = ${:.2f}".format(mp))
    print("Apl - Poup ({} meses) = ${:.2f}".format(m, mc - mp))
    print("Imposto = ${:.4f}".format(ir))
    print("Rendimento em {} meses = {:.4f}%\n".format(m, rend))

    # RED ----
    print("Apl - Poup ({} meses) = {:.4f}%".format(m, rend - 100 * jc(p, m)))
    print("Apl ≍ Poup = {:.2f}% CDI".format(T))
    d = doublePrincipal(s)
    print("Tempo 2 × Poupança  = {:.2f} anos = {:.2f} meses".format(d, 12 * d))
    d = doublePrincipal(rapp * 0.01)
    print("Tempo 2 × Aplicação ≍ {:.2f} anos = {:.2f} meses".format(d, 12 * d))

    print("")
    ear = EAR(22.9)
    rapr = year2day(0.229, 365)
    print("Daily periodic rate of Effective APR = %.4f%%" % (22.9 / 365))
    print("EAR (22.9%%) = %.4f%%" % EAR(22.9))
    print("APR (%.4f%%) = %.2f%%" % (ear, APR(ear)))
    print("Daily periodic rate of Real APR = %.4f%%" % rapr)
    print("Compound APR = %.2f%%" % day2year(rapr * 0.01, 365))
    print("Continuous Compound APR = %.2f%%" % (100 * cc(0.15, 1)))
    print("CDI mensal = %.4f%%" % day2month(year2day(cdia) * 0.01))


if __name__ == "__main__":
    sys.exit(main())
