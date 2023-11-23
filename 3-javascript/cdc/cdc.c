/** @file cdc.c
 *
 *  Desconto Racional por Dentro.
 *
 *  A fórmula para atualizar o preço no instante da compra, levando em conta a
 * remuneração aplicada a cada prestação, @f$R = \frac{x}{p}@f$, é:
 *    @f[x_{atualizado} = A = \frac{x}{p} \frac{(1+t)^{p}-1}{t(1+t)^{(p-1)}} = x
 * \times \frac{(1+t)}{(p*CF)},\ CF = \frac{t}{1-(1+t)^{-p}}.@f]
 *
 *  O preço atualizado, @f$A@f$, voltando cada parcela, @f$R@f$,  para o tempo
 * inicial, é a soma de uma P.G. de razão q = @f$\frac {1}{(1+t)}@f$ e cujo
 * primeiro termo é q:
 *
 *  @f{eqnarray*}{
 *        A &=& R[(1+t)^{-1}+(1+t)^{-2}+...+(1+t)^{-n}] \\
 *        A &=& R q\frac{(1-q^{n})}{1-q},
 *  @f}
 *
 *  @f{eqnarray*}{
 *        A &=& R q\frac{(1 - \frac{1}{(1+t)^{n}})} {(1-\frac{1}{(1+t)})} \\ &=&
 * R q\frac{((1+t)^{n} - 1)}{(1+t)^{n}} \frac{(1+t)}{t} \\
 *        A &=& R \frac{(1+t)^{n} - 1} {t(1+t)^{n}}                       \\ &=&
 * R \frac {(1-(1+t)^{-n})}{t} \Rightarrow \\
 *        R &=& A \frac {t} {(1-(1+t)^{-n})}                              \\ &=&
 * A \times CF \\ A &=& R \frac {1}{CF}
 *  @f}
 *  onde @f$R = \frac{x}{p}@f$ é o valor de cada parcela.
 *
 *  Como, neste exercício, a primeira parcela é paga no ato da compra,
 *  na realidade, @f$n = p-1@f$ e deve-se somar @f$R = \frac{x}{p}@f$ (a
 * entrada):
 *
 *  @f[A = R (1 + \frac{q(1-q^{(p-1)})}{(1-q)}).@f]
 *
 *  Fazendo-se as substituições necessárias, chega-se a fórmula
 *  usada no programa:
 *  @f{eqnarray*}{
 *      q\frac{(1 - \frac{1}{(1+t)^{(p-1)}})} {(1-\frac{1}{(1+t)})} &=&
 * q\frac{((1+t)^{(p-1)} - 1)}{(1+t)^{(p-1)}} \frac{(1+t)}{t} \\
 *  \frac{1}{(1+t)}((1+t)^{(p-1)} - 1) \frac{(1+t)}{t(1+t)^{(p-1)}} &=&
 * \frac{(1+t)^{(p-1)} - 1} {t(1+t)^{(p-1)}} \Rightarrow (somando\ 1) \\
 *                      1+\frac{(1+t)^{(p-1)} - 1} {t(1+t)^{(p-1)}} &=&
 * \frac{t(1+t)^{(p-1)} + (1+t)^{(p-1)} - 1}{t(1+t)^{(p-1)}} \\
 *                   \frac{(t+1)(1+t)^{(p-1)} - 1} {t(1+t)^{(p-1)}} &=&
 * \frac{(1+t)^{p} - 1}{t(1+t)^{(p-1)}} = \frac{(1+t)-(1+t)^{-(p-1)}}{t}
 * \Rightarrow (recolocando\ R) \\ R (1+t) \frac {(1-(1+t)^{-p})}{t} &=& R \frac
 * {(1+t)}{CF}
 *  @f}
 *
 *  Nota:
 *  Achar a taxa "t" que produz o preço à vista "y" requer o método de Newton:
 *     @f{eqnarray*}{
 *     x_{n+1} &=& x_n - \frac{f(x_n)}{f'(x_n)}   \\
 *       y     &=& \frac{x}{p} \frac{(1-a)}{t} (1+t), \\
 *       f(t)  &=& yt - \frac{x}{p} (1-a)(1+t)    \\
 *       f'(t) &=& y - \frac{x}{p} (1-a(1-p))
 *     @f}
 *  onde @f$a = (1+t)^{-p}@f$ e
 *  o problema é equivalente a encontrar um zero da função f
 *             @f[t_{n+1} = t_n - \frac{f(t)}{f'(t)}, t_o = \frac{x}{y}@f]
 *
 *  A função é decrescente e converge para t quando n&rarr;&infin;.
 *
 *  Para o caso de não haver entrada:
 *  @f{eqnarray*}{
 *     x_{n+1} &=& x_n - \frac{f(x_n)}{f'(x_n)} \\
 *       y     &=& \frac{x}{p} \frac{(1-a)}{t}, \\
 *       f(t)  &=& yt - \frac{x}{p} (1-a)       \\
 *       f'(t) &=& y - x b
 *     @f}
 *  onde @f$a = (1+t)^{-p}, b = \frac{a}{1+t}@f$
 *
 *  @author Paulo Roma
 *  @since 24/10/2023
 */
