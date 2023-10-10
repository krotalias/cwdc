#!/usr/bin/env python
# coding: UTF-8
#
## @package func4
#  Calculating the complexity of three nested loops.
#  1000 iterations by default.
#
#  Rosen - Discrete Mathematics and Its Applications (7th Edition).pdf page 427
#

import sys

def main(argv=None):
    """Main Program."""
    if argv is None:
        argv = sys.argv

    func = 0
    n = 1000
    if len(argv) > 1:
        n = int(argv[1])                 # pense no final dos loops
    for i in range(0, n, 1):             # [0,n-1] - n vezes
        for j in range(0, i, 1):         # [0,n-2] - n-1 vezes
            for k in range(0, j, 1):     # [0,n-3] - n-2 vezes
                func += 1

    nl = (n + 2) * (n + 1) * n / 6 - n * n  # (n^3-3n^2+2n)/6
    # Rosen pag. 427 - como os loops começam em 0, e usam <,
    # ao invés de começarem em 1 e usarem <=,
    # em cada loop interno, perdem-se n iterações (n*n no final de tudo)
    # C(n + m - 1, m). Como m = 3 (3 loops), segue  a fórmula: (n+m-1)!/(m!(n-1)!)
    # 166.167.000    n = 1000
    #  20.708.500    n = 500  (a mesma coisa que usar 1000 e incrementar os 3 loops de 2 em 2)
    print(("Usando %d iterações: número de chamadas %d e pela fórmula do livro %d") % (
        n, func, nl))


if __name__ == '__main__':
    main()
