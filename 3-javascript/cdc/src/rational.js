/** @module */

/**
 * @file
 *
 * Summary.
 * <p><a href="../cdc/PDFs/refman.pdf#page=7">Desconto Racional por Dentro</a>.</p>
 *
 * Coded following {@link https://nodejs.org/api/esm.html ECMAScript} module syntax,
 * which is the standard used by browsers and other JavaScript runtimes.
 *
 * @author Paulo Roma
 * @since 24/10/2023
 * @see <a href="../cdc/src/rational.js">source</a>
 * @see <a href="../cdc/src/cdc6.html">link</a>
 * @see <a href="https://www.uel.br/projetos/matessencial/basico/financeira/curso.html">Matemática Essencial</a>
 * @see <a href="https://calculador.com.br/calculo/financiamento-price">Financiamento Price</a>
 * @see <a href="https://dicascarrosusados.com/financiar-carro-por-cdc/">Financiar um carro por CDC</a>
 * @see <a href="https://mundoeducacao.uol.com.br/matematica/calculo-financiamento.htm">Cálculo de Financiamento</a>
 * @see <a href="https://edisciplinas.usp.br/pluginfile.php/4647782/mod_resource/content/1/ENS - MTF 191S - Aula 07 C Financiamentos.pdf">Coeficientes de Financiamentos</a>
 * @see <a href="../cdc/PDFs/mod. vi - anal. econ.financ.e invest.pdf">Avaliação Financeira</a>
 */

/**
 * @var {HTMLElement|String} result &lt;div&gt; element.
 */
let result = "";

/**
 * @var {function} log output to node or browser.
 */
export let log = typeof process === "object" ? console.log : appendToDiv;

/**
 * Appends a string to a div with a given id.
 * @param {String} str a string.
 * @param {String} id given id.
 */
function appendToDiv(str, id = "#rational") {
  if (typeof result === "string") {
    result = document.querySelector(id);
    result.innerHTML += `${str}${crlf}`;
  } else {
    result.innerHTML += `${str}${crlf}`;
  }
}

/**
 * Appends a string to another (result) string.
 * @param {String} str a string.
 */
function appendToString(str) {
  result = result.concat(str, crlf);
}

/**
 * @property {object} pt - data for formatting a table.
 * @property {number} pt.lenNum - length of a float number.
 * @property {number} pt.lenMes - length of an integer.
 * @property {number} pt.precision - number of decimal places.
 * @property {string} pt.eol - column separator.
 * @property {string} pt.filler - character for padding.
 */
const pt = {
  lenNum: 13,
  lenMes: 6,
  precision: 2,
  eol: "|",
  filler: " ",
};

/**
 * @var {String} crlf newline.
 */
export const crlf = typeof process === "object" ? "\n" : "<br>";

/**
 * Create and initialize the "static" variable.
 * Function declarations are processed before code is executed, so
 * we really can do this assignment before the function declaration.
 */
setDownPayment.downP = false;

/**
 * <p>Seleciona pagamento mensal com ou sem entrada (down payment).</p>
 * Holds a "static" property of itself to keep track
 * of the last value set.
 * @param {Boolean} dp down payment.
 * @property {Boolean} downP whether there is a down payment or not.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
 */
export function setDownPayment(dp = true) {
  setDownPayment.downP = dp;
}

/**
 * Retorna o tipo de pagamento mensal (down payment).
 * @return {Boolean} whether there is a down payment.
 */
export function getDownPayment() {
  return setDownPayment.downP;
}

/**
 * Acha a taxa que produz o preço à vista, com ou sem entrada,
 * pelo método de {@link https://en.wikipedia.org/wiki/Newton's_method Newton}:
 *
 * <ul>
 *   <li>t<sub>n+1</sub> = t<sub>n</sub> - f(t<sub>n</sub>) / f'(t<sub>n</sub>)</li>
 * </ul>
 *
 * <p>A função é decrescente e converge para t = lim<sub>𝑛→∞</sub> t<sub>n+1</sub>.</p>
 *
 * Nota: se não houve entrada, retorna getInterest2(x, y, p)
 *
 * @param {Number} x preço a prazo.
 * @param {Number} y preço à vista.
 * @param {Number} p número de parcelas.
 * @return {Array<Number,Number>} [taxa, número de iterações].
 */
export function getInterest(x, y, p) {
  if (!getDownPayment()) {
    return getInterest2(x, y, p);
  }

  let t2 = x / y;
  let t = 0;
  let n = 0;
  while (Math.abs(t2 - t) > 1.0e-4) {
    t = t2;
    n += 1;
    let tPlusOne = 1.0 + t;
    let a = tPlusOne ** (p - 2); // (1.0+t)**(p-2)
    let b = a * tPlusOne; // (1.0+t)**(p-1)
    let c = b * tPlusOne; // (1.0+t)**p
    let d = y * t * b - (x / p) * (c - 1); // f(t_n)
    let dt = y * (b + t * (p - 1) * a) - x * b; // f'(t_n)
    t2 = t - d / dt;
  }
  return [t2 * 100.0, n];
}

/**
 * Acha a taxa que produz o preço à vista, sem entrada,
 * pelo método de {@link https://en.wikipedia.org/wiki/Newton's_method Newton}:
 *
 * <ul>
 *   <li>t<sub>n+1</sub> = t<sub>n</sub> - f(t<sub>n</sub>) / f'(t<sub>n</sub>)</li>
 * </ul>
 *
 * <p>A função é decrescente e converge para t = lim<sub>𝑛→∞</sub> t<sub>n+1</sub>.</p>
 *
 * Nota: assume-se que não houve entrada.
 *
 * @param {Number} x preço a prazo.
 * @param {Number} y preço à vista.
 * @param {Number} p número de parcelas.
 * @return {Array<Number,Number>} [taxa, número de iterações].
 */
function getInterest2(x, y, p) {
  let t2 = x / y;
  let t = 0;
  let n = 0;
  while (Math.abs(t2 - t) > 1.0e-4) {
    t = t2;
    n += 1;
    let tPlusOne = 1.0 + t;
    let a = tPlusOne ** -p; // (1.0+t)**(-p)
    let b = a / tPlusOne; // (1.0+t)**(-p-1)
    let d = y * t - (x / p) * (1 - a); // f(t_n)
    let dt = y - x * b; // f'(t_n)
    t2 = t - d / dt;
  }
  return [t2 * 100.0, n];
}

/**
 * Retorna o fator para atualizar o preço e o valor no instante da compra.
 *
 * @param {Number} x preço a prazo.
 * @param {Number} p número de parcelas.
 * @param {Number} t taxa.
 * @param {Number} fix whether to take into account a down payment.
 * @return {Array<Number,Number>} [factor, x * factor]
 */
export function presentValue(x, p, t, fix = true) {
  let factor = 1.0 / (p * CF(t, p));
  if (fix && getDownPayment()) {
    factor *= 1.0 + t;
  }
  return [factor, x * factor];
}

/**
 * Retorna o fator para atualizar o preço e o valor ao final do pagamento.
 *
 * @param {Number} y preço à vista.
 * @param {Number} p número de parcelas.
 * @param {Number} t taxa.
 * @param {Number} fix whether to take into account a down payment.
 * @return {Array<Number,Number>} [factor, y * factor]
 */
export function futureValue(y, p, t, fix = true) {
  let factor = CF(t, p) * p;
  if (fix && getDownPayment()) {
    factor /= 1.0 + t;
  }
  return [factor, y * factor];
}

/**
 * <p>Coeficiente de financiamento CDC (Crédito Direto ao Consumidor).</p>
 * É o fator financeiro constante que, ao multiplicar-se pelo valor presente
 * de um financiamento, apura o valor das prestações:
 *
 * <ul>
 * <li>R = CF * val</li>
 * </ul>
 *
 * <p>Assim, ele indica o valor da prestação que deve ser paga por cada unidade monetária
 * que está sendo tomada emprestada.</p>
 *
 * Em outras palavras: que valor de prestação deve-se pagar para cada $1,00 tomado emprestado.<br>
 * Por exemplo, se o coeficiente for igual a 0,05, então o tomador de recursos
 * deve pagar $0,05 de prestação para cada $1,00 de dívida.
 *
 * @param {Number} i taxa mensal.
 * @param {Number} n período (meses).
 * @return {Number} coeficiente de financiamento.
 * @see <a href="../cdc/PDFs/matematica_financeira.pdf#page=6">Parcelas</a>
 * @see <img src="../cdc/PDFs/coeficiente-de-financiamento.png" width="256">
 */
export function CF(i, n) {
  return i / (1 - (1 + i) ** -n);
}

/**
 * Desconto Racional por Dentro.
 *
 * @param {Number} p número de prestações.
 * @param {Number} t taxa de juros mensal.
 * @param {Number} x preço a prazo.
 * @param {Number} y preço à vista.
 * @param {Boolean} option seleciona o que será impresso.
 * @return {String} answer as a raw string or in HTML format.
 */
export function rational_discount(p, t, x, y, option = true) {
  result = "";
  if (y >= x) {
    log("Preço à vista deve ser menor do que o preço total:");
  } else {
    let [interest, niter] = getInterest(x, y, p);
    if (t == 0) {
      t = 0.01 * interest;
    }

    let [fx, ux] = presentValue(x, p, t);
    if (y <= 0) {
      y = ux;
    }
    let [fy, uy] = futureValue(y, p, t);
    if (Math.abs(y - ux) < 0.01) {
      log("O preço à vista é igual ao preço total corrigido.");
    } else if (y > ux) {
      log(
        "O preço à vista é maior do que preço total corrigido ⇒ melhor comprar a prazo."
      );
    } else {
      log("O preço à vista é menor ou igual do que preço total corrigido.");
    }
    let delta_p = ux - y;
    let prct = (delta_p / ux) * 100.0;

    log(
      `Taxa Real = ${interest.toFixed(
        4
      )}%, Iterações = ${niter}, Fator = ${fx.toFixed(4)}`
    );
    log(
      `Preço à vista + juros de ${(t * 100).toFixed(
        2
      )}% ao mês = \$${uy.toFixed(2)}`
    );
    log(
      `Preço a prazo - juros de ${(t * 100).toFixed(
        2
      )}% ao mês = \$${ux.toFixed(2)}`
    );
    log(
      `Juros Embutidos = (\$${x.toFixed(2)} - \$${y.toFixed(
        2
      )}) / \$${y.toFixed(2)} = ${(((x - y) / y) * 100).toFixed(2)}%`
    );
    log(
      `Desconto = (\$${x.toFixed(2)} - \$${y.toFixed(2)}) / \$${x.toFixed(
        2
      )} = ${(((x - y) / x) * 100).toFixed(2)}%`
    );
    log(
      `Excesso = \$${ux.toFixed(2)} - \$${y.toFixed(2)} = \$${delta_p.toFixed(
        2
      )}`
    );
    log(
      `Excesso = (\$${x.toFixed(2)} - \$${uy.toFixed(2)}) * ${fx.toFixed(
        4
      )} = \$${((x - uy) * fx).toFixed(2)}`
    );
    log(`Percentual pago a mais = ${prct.toFixed(2)}%`);
    if (option) {
      if (0.0 <= prct && prct <= 1.0) {
        log("Valor aceitável.");
      } else if (1.0 < prct && prct <= 3.0) {
        log("O preço está caro.");
      } else if (3.0 < prct) {
        log("Você está sendo roubado.");
      }
    }
  }
  return result;
}

/**
 * Center a string in a given length.
 *
 * @param {string} str string.
 * @param {number} len length.
 * @return {string} a string padded with spaces to fit in the given length.
 */
const center = (str, len) =>
  str
    .padStart(str.length + Math.floor((len - str.length) / 2), pt.filler)
    .padEnd(len, pt.filler);

/**
 * <p>Retorna a Tabela Price, também chamada de sistema francês de amortização.</p>
 *
 * É um método usado em amortização de empréstimos cuja principal característica
 * é apresentar prestações (ou parcelas) iguais,
 * <a href="https://www.jusbrasil.com.br/artigos/lei-da-usura-e-sua-relacao-com-a-tabela-price/168568742"><em>"escamoteando os juros"</em></a>.
 *
 * <p>O método foi apresentado em 1771 por Richard Price em sua obra
 * <a href="../cdc/PDFs/Observations on Reversionary Payments (Sixth Edition Vol I).pdf">"Observações sobre Pagamentos Remissivos"</a>.</p>
 *
 * Os valores das parcelas podem ser <a href="../cdc/PDFs/Desconto_Comercial_e_Desconto_Racional.pdf">antecipados</a>,
 * calculando-se o desconto correspondente.
 *
 * <p>O saldo devedor é sempre o valor a ser pago, quando se quitar a dívida num mês determinado.
 * Esse é o tal "desconto racional", quando se antecipam parcelas.</p>
 *
 * @param {Number} np número de prestações.
 * @param {Number} pv valor do empréstimo.
 * @param {Number} t taxa de juros.
 * @param {Number} pmt pagamento mensal.
 * @return {Array<Array<String|Number>>} uma matriz cujas linhas são arrays com:
 *   [Mês, Prestação, Juros, Amortização, Saldo Devedor].
 *
 * @see https://pt.wikipedia.org/wiki/Tabela_Price
 */
export function priceTable(np, pv, t, pmt) {
  let dataTable = [
    ["Mês", "Prestação", "Juros", "Amortização", "Saldo Devedor"],
  ];
  let pt = getDownPayment() ? pmt : 0;
  let jt = 0;
  let at = 0;
  dataTable.push(["n", "R = pmt", "J = SD * t", "U = pmt - J", "SD = PV - U"]);
  dataTable.push([0, pt, `(${t.toFixed(4)})`, 0, pv]);
  for (let i = 0; i < np; ++i) {
    let juros = pv * t;
    let amortizacao = pmt - juros;
    let saldo = pv - amortizacao;
    pv = saldo;
    pt += pmt;
    jt += juros;
    at += amortizacao;
    dataTable.push([i + 1, pmt, juros, amortizacao, saldo]);
  }
  dataTable.push(["Total", pt, jt, at, 0]);
  return dataTable;
}

/**
 * Formats a single row of the node Price Table.
 *
 * @param {Array<Number | String>} r given row.
 * @return {String} row formatted.
 */
function formatRow(r) {
  let row = "";
  let val;

  r.forEach((col, index) => {
    if (index == 0) {
      val = center(col.toString(), pt.lenMes);
      row += `${pt.eol}${val}${pt.eol}`;
    } else if (typeof col === "number") {
      val = Number(col).toFixed(pt.precision);
      row += center(val.toString(), pt.lenNum) + pt.eol;
    } else {
      row += center(col, pt.lenNum) + pt.eol;
    }
  });
  return row;
}

/**
 * Return the Price Table in node format using characters only.
 * @param {Array<Array<String|Number>>} ptb price table.
 * @return {String} price table.
 */
export function nodePriceTable(ptb) {
  // Length of a row.
  let lenTable = pt.lenMes + (pt.lenNum + pt.eol.length) * (ptb[0].length - 1);

  // Line separator.
  let line = `${pt.eol}${"_".repeat(pt.lenMes)}${pt.eol}${(
    "_".repeat(pt.lenNum) + pt.eol
  ).repeat(4)}`;
  let line2 = ` ${"_".repeat(lenTable)}`;

  let table = [];

  table.push(center("Tabela Price", lenTable));
  table.push(line2);
  ptb.forEach((row, index) => {
    table.push(formatRow(row));
    if (index == 0 || index == ptb.length - 2) {
      table.push(line);
    }
  });
  table.push(line);

  return table.join(crlf);
}

/**
 * Returns the Price Table in HTML format.
 *
 * @param {Array<Array<String|Number>>} ptb Price table.
 * @returns {String} Price table in html format.
 */
export function htmlPriceTable(ptb) {
  let table = `<table border=1>
      <caption style='font-weight: bold; font-size:200%;'>
        Tabela Price
      </caption>
      <tbody style='text-align:center;'>
    `;
  ptb.forEach((row, i) => {
    table += "<tr>";
    row.forEach((col, j) => {
      if (typeof col === "number") {
        if (j > 0) col = col.toFixed(j == 2 ? pt.precision + 1 : pt.precision);
      }
      table += i > 0 ? `<td>${col}</td>` : `<th>${col}</th>`;
    });
    table += "</tr>";
  });
  table += "</tbody></table>";

  return table;
}
