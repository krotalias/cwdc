jsdoc -d docjs clock/clock.js
jsdoc -d docrectangles rectangles.js
#jsdoc -c jsdoc.json -d docsquares squares.js
jsdoc -d docsquares squares.js
jsdoc -d docDOM DOM.js
jsdoc -c local.json -d docAsteroid asteroid/asteroid.js
jsdoc -d docUtil util2d.js node_modules/gl-matrix/esm
jsdoc -d docCircRec circRec.js util2d.js lib/gl-matrix/dist/esm
jsdoc -d docCircRecNoSource circRecNosource.js util2d.js lib/gl-matrix/dist/esm
