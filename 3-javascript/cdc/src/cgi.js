/**
 * @file
 *
 * <p>Simple output for CDC <a href="../cdc/PDFs/CDC.pdf">calculations</a>.</p>
 *
 * Data supplied as URL parameters (query strings) and output into two &lt;div&gt; elements:
 * <ul>
 *  <li>#rational (result and <a href="/cwdc/3-javascript/doc-cdc/global.html#htmlPriceTable">HTML Price table</a>)</li>
 *  <li>#result (<a href="/cwdc/3-javascript/doc-cdc/global.html#rational_discount">discount</a> and
 *               <a href="/cwdc/3-javascript/doc-cdc/global.html#nodePriceTable">node Price table</a>)</li>
 * </ul>
 *
 * <p>Usage: </p>
 * <ul>
 *  <li>np: número de parcelas</li>
 *  <li>pv: preço à vista</li>
 *  <li>pp: preço a prazo</li>
 *  <li>pb: valor a voltar</li>
 *  <li>nb: meses a voltar</li>
 *  <li>e: entrada</li>
 *  <li>prt: impressão</li>
 *  <li>v: verbose</li>
 *  <li><a href="/cwdc/3-javascript/cdc/src/result.html?np=12&tax=4.55&pv=23000&pp=30354.50&pb=1000&e=0&prt=0&v=1">result.html?np=12&tax=4.55&pv=23000&pp=30354.50&pb=1000&e=0&prt=0&v=1</a></li>
 * </ul>
 * @author Paulo Roma
 * @date 25/10/2023
 * @see <a href="/cwdc/3-javascript/cdc/src/cgi.js">source</a>
 * @see <a href="/cwdc/3-javascript/cdc/src/result.html?np=10&tax=1&pv=450&pp=500">link</a>
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code
 */

"use strict";

/**
 * Displays the CDC calculation in the div with id #result.
 *
 * @returns {String} error message.
 */
function cdcCGI() {
  let errmsg = "";
  let np, t, pp, pv, pb, nb, dp, prt, verbose;

  const result = document.querySelector("#result");
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  // Get data from URL parameters (query strings)
  try {
    np = +urlParams.get("np");
    t = (+urlParams.get("tax") || 0) / 100;
    pp = +urlParams.get("pp");
    pv = +urlParams.get("pv");
    pb = +urlParams.get("pb") || 0;
    nb = +urlParams.get("nb") || 0;
    dp = +urlParams.get("e") || false;
    verbose = +urlParams.get("v") || false;
    prt = +urlParams.get("prt") || false;
    if (dp) setDownPayment(dp);
    if (
      isNaN(np) ||
      isNaN(t) ||
      isNaN(pp) ||
      isNaN(pv) ||
      np <= 2 ||
      (pv <= 0 && pp <= 0) ||
      (t <= 0 && pp <= 0) ||
      (t <= 0 && pv <= 0) ||
      nb > np
    ) {
      throw new Error("A parameter is invalid (not a Number?).");
    }
  } catch (err) {
    errmsg = `<mark>Invalid URL Parameters: ${err.message}</mark>`;
    result.innerHTML = errmsg;
    return errmsg;
  }

  result.innerHTML += `<h4>Parcelas: ${dp ? "1+" : ""}${dp ? np - 1 : np}</h4>
    <h4>Taxa: ${(100 * t).toFixed(2)}%</h4>
    <h4>Preço a Prazo: \$${pp.toFixed(2)}</h4>
    <h4>Preço à Vista: \$${pv.toFixed(2)}</h4>
    <h4>Valor a Voltar: \$${pb.toFixed(2)}</h4>
    <h4>Meses a voltar: ${nb}</h4>`;

  setDownPayment(dp); // com ou sem entrada

  let [ti, i] = getInterest(pp, pv, np);
  if (t <= 0) {
    t = ti * 0.01;
  }
  let cf = CF(t, np);
  let pmt = pv * cf;
  if (getDownPayment()) {
    pmt /= 1 + t;
    np -= 1; // uma prestação a menos
    pv -= pmt; // preço à vista menos a entrada
    cf = pmt / pv; // recalculate cf
    result.innerHTML += `<h4>Valor financiado = \$${(pv + pmt).toFixed(
      2
    )} - \$${pmt.toFixed(2)} = \$${pv.toFixed(2)}</h4>`;
  }

  result.innerHTML += `<h4>Coeficiente de Financiamento: ${cf.toFixed(6)}</h4>
    <h4>Prestação: ${cf.toFixed(6)} * \$${pv.toFixed(2)} = \$${pmt.toFixed(
    2
  )} ao mês</h4>`;

  let ptb = priceTable(np, pv, t, pmt);

  result.innerHTML += `<h4>Valor Pago: \$${ptb.slice(-1)[0][1].toFixed(2)}</h4>
        <h4>Taxa Real (${i} iterações): ${ti.toFixed(4)}% ao mês</h4>
        <h4>Valor Corrigido: \$${
          nb > 0 && pb > 0 ? presentValue(pb, nb, t, false)[1].toFixed(2) : 0
        }</h4>`;

  result.innerHTML += htmlPriceTable(ptb);

  if (verbose) {
    rational_discount(np, t, pp, pv, true);
    log(crlf);
    log(nodePriceTable(ptb));
  }

  if (prt) {
    window.print();
  }
  return errmsg;
}

if (typeof document === "object") cdcCGI();
