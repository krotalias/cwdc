/**
 * @file
 *
 * <p>Callback for for CDC <a href="../cdc/PDFs/CDC2.pdf">calculations</a>.</p>
 *
 * Coded following {@link https://nodejs.org/api/esm.html ECMAScript} module syntax,
 * which is the standard used by browsers and other JavaScript runtimes.
 *
 * <p>Data supplied through a form and output into three &lt;div&gt; elements:</p>
 * <ul>
 *  <li>#greenBox (input data)</li>
 *  <li>#blueBox (result)</li>
 *  <li>#redBox (<a href="/cwdc/3-javascript/doc-cdc/global.html#htmlPriceTable">HTML Price table</a>)</li>
 * </ul>
 *
 * <p>Usage: </p>
 * <ul>
 *  <li><a href="/cwdc/3-javascript/cdc/src/cdc.html">cdc.html</a></li>
 * </ul>
 *
 * @author Paulo Roma
 * @date 25/10/2023
 * @see <a href="/cwdc/3-javascript/cdc/src/cdc.js">source</a>
 * @see <a href="/cwdc/3-javascript/cdc/src/cdc.html">link</a>
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code
 */

import {
  htmlPriceTable,
  priceTable,
  CF,
  presentValue,
  getInterest,
  setDownPayment,
} from "./rational.js";

/**
 * Executes the CDC calculation.
 *
 * @event onclick - when submit button is clicked.
 * @requires module:rational
 * @see https://api.jquery.com/click/
 * @see https://api.jquery.com/event.preventDefault/
 */
$("#submitButton").on("click", function (event) {
  var errorMessage = "";
  if ($("#parc").val() <= 2) {
    errorMessage += "<p>Número de parcelas deve ser maior do que 1.</p>";
  }
  if ($("#itax").val() <= 0 && $("#ipp").val() <= 0) {
    errorMessage +=
      "<p>Taxa de juros e valor final não podem ser ambos nulos.</p>";
  }
  if ($("#itax").val() <= 0 && $("#ipv").val() <= 0) {
    errorMessage +=
      "<p>Taxa de juros e valor financiado não podem ser ambos nulos.</p>";
  }
  if ($("#ipv").val() <= 0 && $("#ipp").val() <= 0) {
    errorMessage +=
      "<p>Valor financiado e valor final não podem ser ambos nulos.</p>";
  }
  if ($("#inb").val() < 0 || +$("#inb").val() > $("#parc").val()) {
    errorMessage +=
      "<p>Meses a voltar deve ser positivo e menor ou igual ao número de parcelas.</p>";
  }
  event.preventDefault();
  if (errorMessage != "") {
    $("#errorMessage").html(errorMessage);
    $("#errorMessage").show();
    $("#successMessage").hide();
    return;
  } else {
    $("#successMessage").show();
    $("#errorMessage").hide();
  }

  //  Get data from fields
  let np = Number(parc.value);
  let t = Number(itax.value) / 100;
  let pp = Number(ipp.value);
  let pv = Number(ipv.value);
  let pb = Number(ipb.value);
  let nb = Number(inb.value);
  let dp = idp.checked;
  let prt = iprt.checked;
  setDownPayment(dp);

  if (pv == 0) {
    pv = presentValue(pp, np, t)[1];
  }

  let pmt = 0;
  let cf = 0;
  let i = 0;
  let ti = 0;
  try {
    if (t == 0) {
      [ti, i] = getInterest(pp, pv, np);
      t = 0.01 * ti;
    }

    cf = CF(t, np);
    pmt = pv * cf;
    // there is no sense in a montly payment greater than the loan...
    if (pmt >= pv) {
      throw new Error(
        `Prestação (\$${pmt.toFixed(2)}) é maior do que o empréstimo`
      );
    }
    if (dp) {
      pmt /= 1 + t; // diminui a prestação
      np -= 1; // uma prestação a menos
      pv -= pmt; // preço à vista menos a entrada
      cf = pmt / pv; // recalculate cf
    }
  } catch (e) {
    $("#errorMessage").html(`<h4>${e.message}</h4>`);
    $("#errorMessage").show();
    $("#successMessage").hide();
    return;
  }

  let ptb = priceTable(np, pv, t, pmt);

  if (pb == 0 && nb > 0) {
    pb = pmt * nb;
  }

  $("#greenBox").show();
  $("#blueBox").show();
  $("#redBox").show();
  $("#cdcfieldset").hide();

  $("#greenBox").html(
    `<h4>Parcelamento: ${dp ? "1+" : ""}${np} meses</h4>
    <h4>Taxa: ${(100 * t).toFixed(2)}% ao mês = ${(
      ((1 + t) ** 12 - 1) *
      100.0
    ).toFixed(2)}% ao ano</h4>
    <h4>Valor Financiado: \$${pv.toFixed(2)}</h4>
    <h4>Valor Final: \$${pp.toFixed(2)}</h4>
    <h4>Valor a Voltar: \$${pb.toFixed(2)}</h4>
    <h4>Meses a Voltar: ${nb}</h4>
    <h4>Entrada: ${dp}</h4>`
  );

  $("#blueBox").html(
    `<h4>Coeficiente de Financiamento: ${cf.toFixed(6)}</h4>
    <h4>Prestação: ${cf.toFixed(6)} * \$${pv.toFixed(2)} = \$${pmt.toFixed(
      2
    )} ao mês</h4>
    <h4>Valor Pago com Juros: \$${ptb.slice(-1)[0][1].toFixed(2)}</h4>
    <h4>Taxa Real (${i} iterações): ${ti.toFixed(4)}% ao mês</h4>
    <h4>Valor Corrigido: \$${
      nb > 0 ? presentValue(pb, nb, t, false)[1].toFixed(2) : 0
    }</h4>`
  );

  $("#redBox").html(htmlPriceTable(ptb));

  if (prt) {
    window.print();
  }
});

/**
 * Go back to the form.
 *
 * @event onclick - when the green box rectangle is clicked.
 * @see https://api.jquery.com/click/
 * @see https://api.jquery.com/event.preventDefault/
 */
$("#greenBox").on("click", function (event) {
  $("#greenBox").hide();
  $("#blueBox").hide();
  $("#redBox").hide();
  $("#cdcfieldset").show();
});
