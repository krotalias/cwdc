jsdoc -d doc-pack pack_circles.js
jsdoc -d doc-reaction reaction_tester.js
#jsdoc -r ./jewels -d doc-jewels
jsdoc -c jsdoc.conf.json
jsdoc -d doc-gcd bigint/gcd.js
jsdoc -c jsdoc.conf -d doc-factorize bigint/gcd.js bigint/factorize.js bigint/bitset.mjs bigint/factors.js cookies/cookies.mjs
jsdoc -c jsdoc.conf -d doc-factorize-node bigint/factorize.mjs
jsdoc -c jsdoc.conf -d doc-factorize-ui-node bigint/factorize-ui.mjs
jsdoc -d doc-roman roman/roman.js roman/roman-storage.js
jsdoc -c jsdoc.conf -d doc-roman-node roman/roman.mjs
jsdoc -d doc-storage roman/roman.js
jsdoc -d doc-cookies cookies/cookies.js
jsdoc -c jsdoc.conf -d doc-cookies-module cookies/cookies.mjs
jsdoc -d doc-closure closure/closure.js
jsdoc -d doc-pascal pascal/pascal.js pascal/pascal2.js pascal/pascal3.js
jsdoc -d doc-promises promises/promise.js
jsdoc -d doc-promises2 promises/promise2.js DOM.js
jsdoc -d doc-nodes nodes.js DOM.js
jsdoc -c jsdoc.conf -d doc-cdc cdc/src/rational.cjs cdc/src/rational.js cdc/src/cdc.js cdc/src/cdc.cjs cdc/src/cgi.js cdc/src/rational.mjs
jsdoc -d doc-pack pack_circles.js
