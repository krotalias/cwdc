"use strict";

/**
 * @file
 *
 * Summary.
 * <p>A tic-tac-toe game implemented with {@link https://reactjs.org|React}.</p>
 *
 * {@link https://en.wikipedia.org/wiki/Tic-tac-toe|Tic-tac-toe} (American English),
 * noughts and crosses (Commonwealth English and British English),
 * or Xs and Os/“X’y O’sies” (Ireland), is a paper-and-pencil game for two players, X and O,
 * who take turns marking the spaces in a 3×3 grid.
 * The player who succeeds in placing three of their marks in a diagonal, horizontal,
 * or vertical row is the winner.
 * It is a solved game with a forced draw assuming best play from both players.
 *
 * <p>To run {@link https://babeljs.io Babel} on the fly,
 * and save the "compiled" output when the source has changed:</p>
 * <ul>
 *    <li>npm init -y</li>
 *    <li>npm install babel-cli@6 babel-preset-react-app@3</li>
 *    <li>npx babel --watch src --out-dir . --presets react-app/prod &</li>
 * </ul>
 *
 * Note: using React without {@link https://nodejs.dev/en/ nodejs}
 * is a great way to try React, but it's not suitable for production.<br>
 * It slowly compiles {@link https://react.dev/learn/javascript-in-jsx-with-curly-braces JSX}
 * with Babel in the browser, and uses a large development build of React.
 *
 * <ul>
 *    <li> Read this {@link  https://reactjs.org/docs/add-react-to-a-website.html#add-jsx-to-a-project section}
 *    for a production-ready setup with JSX.</li>
 *
 *    <li>In a larger project, you can use an
 *    {@link https://reactjs.org/docs/create-a-new-react-app.html integrated toolchain}
 *    that includes JSX instead.</li>
 *
 *    <li>You can also use React {@link https://reactjs.org/docs/react-without-jsx.html without JSX},
 *    in which case you can remove Babel.</li>
 * </ul>
 *
 * Finally, when an application is ready for the world,
 * it must be {@link https://create-react-app.dev/docs/deployment/ deployed} somehow.
 *
 * @author Paulo Roma based on {@link https://opensource.fb.com|Facebook Open Source}
 * @since 17/09/2021
 * @see <a href="../src/tic-tac-toe.js">source</a>
 * @see <a href="../tic-tac-toe.js">source compiled (Babel)</a>
 * @see <a href="../package.json">package.json</a>
 * @see <a href="/cwdc/14-react/tic-tac-toe/tic-tac-toe.html">link</a>
 * @see https://reactjs.org/tutorial/tutorial.html#overview
 * @see https://flarnie.github.io/react/tutorial/tutorial.html
 * @see https://reactjs.org/docs/react-dom.html
 * @see https://reactjs.org/docs/react-api.html#createelement
 * @see https://reactjs.org/docs/add-react-to-a-website.html
 * @see https://legacy.reactjs.org/docs/faq-build.html
 * @see <img src="../tic-tac-toe.png">
 */

/**
 * <p>A function component.</p>
 * <p>In React, {@link https://legacy.reactjs.org/docs/components-and-props.html function components}
 * are a simpler way to write components that
 * only contain a render method and don’t have their own state.</p>
 *
 * Since the Square components no longer maintain state, the Square components
 * receive values from the {@link Board} component and inform the Board component when they’re clicked.
 * In React terms, the Square components are now
 * {@link https://stackoverflow.com/questions/42522515/what-are-react-controlled-components-and-uncontrolled-components controlled components}.
 * The Board has full control over them.
 *
 * @param {Object} props React Props.
 * @param {Number} props.value an index ∈ [0..8].
 * @param {Game#handleClick} props.onClick button onClick callback.
 * @returns {HTMLButtonElement} a &lt;button&gt; tag with the given props.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
 * @see https://indepth.dev/posts/1360/getting-started-with-modern-javascript-destructuring
 * @see https://javascript.info/destructuring-assignment
 */

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function Square() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : props,
      value = _ref.value,
      onClick = _ref.onClick;

  return React.createElement(
    "button",
    { className: "square", onClick: onClick },
    value
  );
}

/**
 * <p>The board class.</p>
 *
 * Basically, it renders the layout of the game,
 * by creating a 3 × 3 grid with a button for each square.
 *
 * <p>Board takes squares via props and has its own onClick prop specified by {@link Game}.</p>
 * When you want to aggregate data from multiple children or to have two child components communicate with each other,
 * move the state upwards so that it lives in the parent component.
 * The parent can then pass the state back down to the children via props,
 * so that the child components are always in sync with each other and with the parent.
 * All of this is possible because of {@link https://levelup.gitconnected.com/unlocking-the-power-of-closures-in-react-components-ba5903f4710a closures}.
 * @extends {React.Component}
 */

var Board = function (_React$Component) {
  _inherits(Board, _React$Component);

  /**
   * Board constructor.
   * @param {Object} props component input.
   * @param {Array<String>} props.squares current array with their 9 squares.
   * @param {Game#handleClick} props.onClick button onClick callback.
   * @extends {React.Component<Props>}
   * @see https://reactjs.org/docs/react-component.html
   */
  function Board(props) {
    _classCallCheck(this, Board);

    var _this = _possibleConstructorReturn(this, (Board.__proto__ || Object.getPrototypeOf(Board)).call(this, props));

    console.log("Board props: ", props);
    return _this;
  }

  /**
   * We’ll pass down a prop, from the Board to the Square,
   * with a value and function, and we’ll have Square call
   * that function when a square is clicked.
   *
   * @param {Number} i square index ∈ [0..8].
   * @returns {Square} the i-th square with its value and click callback.
   */


  _createClass(Board, [{
    key: "renderSquare",
    value: function renderSquare(i) {
      var _this2 = this;

      return React.createElement(Square, {
        value: this.props.squares[i],
        onClick: function onClick() {
          return _this2.props.onClick(i);
        }
      });
    }

    /**
     * Renders the 9 squares of the board.
     * @returns {HTMLDivElement} a &lt;div&gt; tag with a 3 × 3 grid layout, with 3
     * buttons per row, each of which with value 'X', 'O' or null.
     */

  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "board-row" },
          this.renderSquare(0),
          this.renderSquare(1),
          this.renderSquare(2)
        ),
        React.createElement(
          "div",
          { className: "board-row" },
          this.renderSquare(3),
          this.renderSquare(4),
          this.renderSquare(5)
        ),
        React.createElement(
          "div",
          { className: "board-row" },
          this.renderSquare(6),
          this.renderSquare(7),
          this.renderSquare(8)
        )
      );
    }
  }]);

  return Board;
}(React.Component);

/**
 * <p>Game class.</p>
 *
 * To “remember” things, components use {@link https://legacy.reactjs.org/docs/faq-state.html state}.
 * React components can have state by setting <strong>this.state</strong>
 * in their constructors, which should be considered as private
 * to a React component that it’s defined in.
 *
 * <p>To add a Time Travel, to “go back in time” to the previous moves in the game,
 * we need a History of Moves.</p>
 *
 * We’ll store the past squares arrays in another array called {@link Game#state history}.
 * The history array represents all board states,
 * from the first to the last move.
 */


var Game = function (_React$Component2) {
  _inherits(Game, _React$Component2);

  /**
   * <ul>
   *    <li>Set up the initial state of the game: board configuration,
   *    number of moves and if "X" is the next to play.</li>
   *    <li>Set the Board’s initial state to contain an array of 9 nulls
   *    corresponding to the 9 squares.</li>
   *  </ul>
   * <p>Conceptually, components are like JavaScript functions:</p>
   * <ul>
   *    <li>They accept arbitrary inputs (called “props”) and </li>
   *    <li>return React elements describing what should appear on the screen.</li>
   * </ul>
   *
   * @param {Object} props component input.
   * @extends {React.Component<Props>}
   * @see https://reactjs.org/docs/react-component.html
   */
  function Game(props) {
    _classCallCheck(this, Game);

    var _this3 = _possibleConstructorReturn(this, (Game.__proto__ || Object.getPrototypeOf(Game)).call(this, props));

    console.log("Game props: ", props);

    /**
     * The state of the game.
     * @type {Object}
     * @property {Array<Object<{squares: Array<String>}>>} state.history history array.
     * @property {Number} state.stepNumber step number.
     * @property {Boolean} state.xIsNext player turn.
     * @property {state_setter} state.setState setter - change state.
     */
    _this3.state = {
      history: [{
        squares: Array(9).fill(null)
      }],
      stepNumber: 0,
      xIsNext: true
    };
    return _this3;
  }

  /**
   * <p>The {@link Square} calls this.handleClick(i) when clicked.</p>
   *
   * <p>Each time a player moves, {@link Game#state xIsNext} (a boolean) will be flipped to determine
   * which player goes next, and the game’s state will be saved.</p>
   *
   * <p>If you “go back in time” and then make a new move from that point,
   * you only want to keep the history up to that point.
   * Instead of adding nextSquares after all items in history,
   * you’ll add it after all items in history.slice(0, stepNumber + 1),
   * so that you’re only keeping that portion of the old history.</p>
   *
   * <p>Note how in handleClick, we call
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice slice()}
   * to create a copy of the squares array, instead of modifying the existing array.</p>
   *
   * <p>To explain why, we need to discuss
   * {@link https://blog.devgenius.io/mutable-and-immutable-in-javascript-78a3cbc6187c immutability},
   * and why immutability is important to learn.</p>
   *
   * <p>There are generally two approaches to changing data:</p>
   * <ol>
   *  <li>The first approach is to mutate the data, by directly changing the data’s values.</li>
   *  <li>The second approach is to replace the data with a new copy, which has the desired changes.</li>
   * </ol>
   *
   * Detecting changes in immutable objects is considerably easier:
   * <ul>
   *  <li>if the immutable object that is being referenced is different than the previous one,
   *  then the object has changed.</li>
   * </ul>
   *
   * @param {Number} i an index ∈ [0..8] corresponding to the button clicked.
   * @see https://reactjs.org/docs/react-component.html#setstate
   * @see https://www.codecademy.com/resources/docs/javascript/arrays/slice
   */


  _createClass(Game, [{
    key: "handleClick",
    value: function handleClick(i) {
      // a copy of the current history up to stepNumber.
      var history = this.state.history.slice(0, this.state.stepNumber + 1);
      // the last configuration.
      var current = history[history.length - 1];
      // a copy of the last array of "X"s and "O"s from the copied history.
      var nextSquares = current.squares.slice();
      // check for a winner or if the i-th square has been already marked.
      if (calculateWinner(nextSquares) || nextSquares[i]) {
        return;
      }
      nextSquares[i] = this.state.xIsNext ? "X" : "O";

      /**
       * <p>Add the new configuration (another square array) to {@link Game#state history}.</p>
       * <pre>
       * History: Array (5) = $2
       *  0 {squares: Array}
       *      squares: [null, null, null, null, null, null, null, null, null] (9)
       *  1 {squares: Array}
       *      squares: ["X", null, null, null, null, null, null, null, null] (9)
       *  2 {squares: Array}
       *      squares: ["X", null, null, null, null, null, null, null, "O"] (9)
       *  3 {squares: Array}
       *      squares: ["X", null, null, null, "X", null, null, null, "O"] (9)
       *  4 {squares: Array}
       *      squares: ["X", null, "O", null, "X", null, null, null, "O"] (9)
       * </pre>
       * When you call {@link https://react.dev/reference/react/useState setState} in a component,
       * React automatically updates the child components inside of it too.
       * @callback state_setter
       * @see https://www.geeksforgeeks.org/reactjs-setstate/
       * @see https://dev.to/johnstonlogan/react-hooks-barney-style-1hk7
       */
      this.setState({
        // creates a new array that contains all the items in history,
        // followed by nextSquares (could have been used concat instead of spread).
        history: [].concat(_toConsumableArray(history), [{ squares: nextSquares }]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext
      });
    }

    /**
     * <p>Go to the step-th move in the game.</p>
     *
     * <p>Enqueues changes to the component state and tells React that this component and
     * its children need to be re-rendered with the updated state.</p>
     *
     * This is the primary method you use to update the user interface in response
     * to event handlers and server responses.
     *
     * @param {Number} step position into the history array.
     * @see https://reactjs.org/docs/react-component.html#setstate
     */

  }, {
    key: "jumpTo",
    value: function jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: step % 2 === 0
      });
    }

    /**
     * Renders the grid layout and an ordered list of buttons for each move in this game history.
     *
     * @returns {HTMLDivElement} a tag &lt;game&gt;, with the 3 × 3 {@link Board} grid layout and
     * an ordered list of buttons for the time travel.
     * @see https://www.w3schools.com/react/react_props.asp
     */

  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      var history = this.state.history;
      var current = history[this.state.stepNumber];
      var winner = calculateWinner(current.squares);

      /**
       * <p>Creates buttons for each move in history.</p>
       * <pre>
       *    0: {$$typeof: Symbol(react.element), type: "li", key: "0", ref: null, props: Object, …}
       *    1: {$$typeof: Symbol(react.element), type: "li", key: "1", ref: null, props: Object, …}
       *    ...
       * </pre>
       * @type {Array<react.element>}
       */
      var moves = history.map(function (step, move) {
        //                      go to   #move     or   when move is 0
        var desc = move ? "Go to move #" + move : "Go to game start";
        return React.createElement(
          "li",
          { key: move },
          React.createElement(
            "button",
            { onClick: function onClick() {
                return _this4.jumpTo(move);
              } },
            desc
          )
        );
      });

      var status = void 0;
      if (winner) {
        status = "Winner: " + winner;
      } else if (this.state.stepNumber > 8) {
        status = "Game Over: Draw";
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }

      /**
       * This is really beautiful.
       * {@link Board} is going to draw the configuration indicated by stepNumber,
       * used to get the current entry into the history array.
       * The Board component receives the arguments (squares, onClick) as a props object.
       */
      return React.createElement(
        "div",
        { className: "game" },
        React.createElement(
          "div",
          { className: "game-board" },
          React.createElement(
            "div",
            null,
            React.createElement(
              "p",
              { style: { textAlign: "center" } },
              status
            )
          ),
          React.createElement(Board, {
            squares: current.squares,
            onClick: function onClick(i) {
              return _this4.handleClick(i);
            }
          })
        ),
        React.createElement(
          "div",
          { className: "game-info" },
          React.createElement(
            "p",
            { style: { textAlign: "center" } },
            "History"
          ),
          React.createElement(
            "ol",
            null,
            moves
          )
        )
      );
    }
  }]);

  return Game;
}(React.Component);

// ========================================

/**
 * Render a React element into the DOM in the supplied container and
 * return a reference to the component (or returns null for stateless components).
 * @see https://reactjs.org/docs/react-dom.html#render
 */


ReactDOM.render(React.createElement(Game, null), document.getElementById("tic-tac-toe"));

/**
 * Given an array of 9 squares, this function will check
 * for a winner and return 'X', 'O', or null as appropriate.
 *
 * @param {Array<String>} squares a given array of 9 squares.
 * @returns {String} <p>the winner: "X", "O", or null if there is not a winner.</p>
 */
function calculateWinner(squares) {
  // The eight winner configurations: rows, columns and diagonals.
  var lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = lines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ref2 = _step.value;

      var _ref3 = _slicedToArray(_ref2, 3);

      var a = _ref3[0];
      var b = _ref3[1];
      var c = _ref3[2];

      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return null;
}