jsdoc -c code/jsdoc.conf -d doc-game code/chapter/16_game.js code/levels.mjs canvas.js
jsdoc -c code/jsdoc.conf -d doc-canvas code/chapter/17_canvas.js code/chapter/16_game.js code/levels.mjs canvas.js
jsdoc -c jsdoc.conf
jsdoc -d doc-level code/levels.js
jsdoc -d doc-jack jack.js
jsdoc -d doc-ball ball.js
