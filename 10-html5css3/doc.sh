jsdoc -d docjs clock/clock.js clock/suncalc.js clock/date.js
jsdoc -d doc-clock clock/clock-then.js clock/suncalc.js clock/date.js
jsdoc -c ../3-javascript/jsdoc.conf -d docrectangles rectangles/rectangles.js ../3-javascript/cookies/cookies.mjs
#jsdoc -c jsdoc.json -d docsquares squares/squares.js
jsdoc -c ../3-javascript/jsdoc.conf -d docsquares squares/squares.js ../3-javascript/cookies/cookies.mjs
jsdoc -d docDOM DOM.js
jsdoc -c local.json -d docAsteroid asteroid/asteroid.js
jsdoc -d docUtil circRec/util2d.js lib/gl-matrix/dist/esm
jsdoc -d docCircRec circRec/circRec.js circRec/util2d.js lib/gl-matrix/dist/esm
jsdoc -d docCircRecNoSource circRec/circRecNosource.js circRec/util2d.js lib/gl-matrix/dist/esm
