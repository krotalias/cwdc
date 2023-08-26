/**
 * @file
 *
 * Summary.
 * <p>Adjusting "this" when borrowing a method</p>
 *
 * We have two objects. One of them has a method called avg()
 * that the other does not​.<br>
 * Therefore, we will borrow the appController.avg() method​.
 *
 * @see <a href="/cwdc/3-javascript/arrow/controller.js">source</a>
 * @see https://desenvolvimentoparaweb.com/javascript/this-javascript-dominando/
 */

/**
 * @type {Object<{scores: Array<Number>,
 *                avgScore: null,
 *                players: Array<{name: String, playerID: Number}>}>}
 */
var gameController = {
  scores: [20, 34, 55, 46, 77],
  avgScore: null,
  players: [
    { name: "Tommy", playerID: 987, age: 23 },
    { name: "Paul", playerID: 87, age: 33 },
  ],
};

/**
 * @type {Object<{scores: Array<Number>,
 *                avgScore: null,
 *                avg: function}>}
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 */
var appController = {
  scores: [900, 845, 809, 950],
  avgScore: null,
  avg: function () {
    var sumOfScores = this.scores.reduce(function (prev, cur) {
      return prev + cur;
    });

    this.avgScore = sumOfScores / this.scores.length;
    console.log(this);
  },
};

appController.avg();
console.log("appController: avgScore = ", appController.avgScore);

/**
 * Se o código abaixo for executado, a propriedade "gameController.avgScore"
 * terá a média da pontuação do array "scores" em "appController".
 *
 * Este código é somente para ilustrar a situação;
 * a intenção é que "appController.avgScore" continue "null".
 *
 * "this" do método avg não se referirá ao objeto gameController;
 * ele se referirá ao objeto appController,
 * porque está sendo chamado no appController.
 */
gameController.avgScore = appController.avg();

// two possibilities to fix the problem:
//appController.avg.bind(gameController)();
//appController.avg.apply(gameController, gameController.scores);

console.log("gameController: avgScore = ", gameController.avgScore);
console.log("appController: avgScore = ", appController.avgScore);
