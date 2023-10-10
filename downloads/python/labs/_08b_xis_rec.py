#!/usr/bin/env python
#
## @package _08b_xis_rec
#   Imprime um Xis usando asteriscos recursivamente.
#
#   @param Miguel Jonathan
#   @since 16/06/2009

##
#   Desenha um xis de ordem k com deslocamento 0.
#
#   @param k ordem (linhas = 2k+1).
#
def desenha_xis(k):
    desenha_xis_rec(k, 0)

##
#   Desenha xis com 2k+1 linhas e deslocamento d.
#
#   @param k ordem (linhas = 2k+1).
#   @param d deslocamento.
#
def desenha_xis_rec(k, d):
    if k == 0:
        print(' ' * d + '*')
    else:
        print(' ' * d + '*' + ' ' * (2 * k - 1) + '*')
        desenha_xis_rec(k - 1, d + 1)
        print(' ' * d + '*' + ' ' * (2 * k - 1) + '*')

def main():
    n = int(input("Diga com quantas linhas quer o desenho do xis (valor impar): "))
    desenha_xis((n - 1) // 2)


if __name__ == "__main__":
    main()
