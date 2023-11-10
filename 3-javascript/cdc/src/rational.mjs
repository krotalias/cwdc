/**
 * @file
 *
 * Summary.
 * <p>Command Line Interface for CDC.</p>
 *
 * Coded following {@link https://nodejs.org/api/esm.html ECMAScript} module syntax,
 * which is the standard used by browsers and other JavaScript runtimes.
 *
 * @author Paulo Roma
 * @since 04/11/2023
 * @see <a href="../cdc/src/rational.mjs">source</a>
 * @see <a href="../cdc/src/cdc.html">link</a>
 */

import * as rational from "./rational.js";
import * as readlineSync from "readline-sync";
import * as mod_getopt from "posix-getopt";

/**
 * <p>Command Line Interface for CDC <a href="https://nodejs.org/en/docs/es6">ES6</a> syntax.</p>
 *
 * Command Line Arguments:
 * <pre>
 * - h help
 * - n número de parcelas.
 * - t taxa mensal.
 * - x valor da compra a prazo.
 * - y valor da compra à vista.
 * - e indica uma entrada.
 * - v verbose mode
 *
 *  Module requirements:
 *  - npm install posix-getopt
 *  - npm install readline-sync
 *
 *  Usage:
 *  - node rational.mjs -n10 -t1 -x500 -y450 -e
 *  - node rational.mjs -n18 -t0 -x3297.60 -y1999
 *  - node rational.mjs -n10 -t0 -x1190 -y1094.80
 *  - node rational.mjs -n 88 -t 4.55 -x 111064.80 -y 23000
 *  - node rational.mjs -n 96 -t 0 -x 134788.8 -y 63816.24
 *  - node rational.mjs -n 4 -t 3.0 -x 1076.11  -y 1000
 *  - node rational.mjs --parcelas=88 --taxa=4.55 --valorP=111064.80 --valorV=23000 -v
 *  - node rational.mjs --help
 * </pre>
 *
 * @param {Array<String>} argv command line arguments.
 * @requires module:rational
 * @requires posix-getopt
 * @requires readline-sync
 *
 * @see https://www.npmjs.com/package/posix-getopt
 * @see https://www.npmjs.com/package/readline-sync
 */
function cdcCLI6(argv = process.argv) {
    // number of payments.
    let np = 0;
    // interest rate
    let t = 0;
    // initial price
    let pv = 0;
    // final price
    let pp = 0;
    // debugging state.
    let debug = false;
    // holds the existence of a down payment.
    rational.setDownPayment(false);

    let parser, option;
    const parse = (str) => str.substring(str.lastIndexOf("/") + 1, str.length);

    try {
        try {
            // options that require an argument should be followed by a colon (:)
            parser = new mod_getopt.BasicParser(
                "h(help)n:(parcelas)t:(taxa)x:(valorP)y:(valorV)v(verbose)e(entrada)",
                argv
            );
        } catch (msg) {
            throw msg;
        }

        while ((option = parser.getopt()) !== undefined) {
            switch (option.option) {
                case "h":
                    rational.log(
                        `Usage ${parse(argv[0])} ${parse(
                            argv[1]
                        )} -n <nº parcelas> -t <taxa> -x <valor a prazo> -y <valor à vista> -e -v`
                    );
                    return 1;
                case "n":
                    np = +option.optarg;
                    break;
                case "t":
                    t = Number(option.optarg) / 100.0;
                    break;
                case "x":
                    pp = Number(option.optarg);
                    break;
                case "y":
                    pv = Number(option.optarg);
                    break;
                case "v":
                    debug = true;
                    break;
                case "e":
                    rational.setDownPayment();
                    break;
            }
        }
    } catch (err) {
        rational.log(
            `${err.message}\nFor help, type: ${parse(argv[0])} ${parse(
                argv[1]
            )} --help`
        );
        return 2;
    }

    while (
        np <= 2 ||
        (pv <= 0 && pp <= 0) ||
        (t <= 0 && pp <= 0) ||
        (t <= 0 && pv <= 0) ||
        pp < pv
    ) {
        try {
            np = +readlineSync.question("Forneça o número de parcelas: ");
            t = +readlineSync.question("Forneça a taxa de juros: ") / 100.0;
            pp = +readlineSync.question("Forneça o preço a prazo: ");
            pv = +readlineSync.question("Forneça o preço à vista: ");
            if (isNaN(np) || isNaN(t) || isNaN(pp) || isNaN(pv)) {
                throw new Error("Value is not a Number");
            }
        } catch (err) {
            rational.log(err.message);
            rational.rational_discount(10, 0.01, 500, 450, debug);
            return;
        }
    }

    if (t > 0) {
        if (pp <= 0) {
            let factor;
            [factor, pp] = rational.futureValue(pv, np, t);
        }
        rational.rational_discount(np, t, pp, pv, debug);
    } else {
        let ni;
        [t, ni] = rational.getInterest(pp, pv, np);
        rational.log(
            `Taxa = ${t.toFixed(4)}% - ${ni} iterações${rational.crlf}`
        );
        t *= 0.01;
        rational.rational_discount(np, t, pp, pv, debug);
    }

    let cf = rational.CF(t, np);
    let pmt = pv * cf;
    rational.log(
        `${rational.crlf}Coeficiente de Financiamento: ${cf.toFixed(6)}`
    );

    if (rational.getDownPayment()) {
        pmt /= 1 + t;
        np -= 1; // uma prestação a menos
        pv -= pmt; // preço à vista menos a entrada
        rational.log(
            `Valor financiado = \$${(pv + pmt).toFixed(2)} - \$${pmt.toFixed(
                2
            )} = \$${pv.toFixed(2)}`
        );
    }

    rational.log(`Prestação: \$${pmt.toFixed(2)}`);

    // Tabela Price
    if (debug) {
        rational.log(
            rational.nodePriceTable(rational.priceTable(np, pv, t, pmt))
        );
    }
}

if (typeof process === "object") cdcCLI6();
