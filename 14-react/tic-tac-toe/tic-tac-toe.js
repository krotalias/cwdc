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
 * <p><b>Important remark</b>: using React without {@link https://nodejs.dev/en/ nodejs}
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
 * <p>Usage: </p>
 * <ul>
 *  <li>To install {@link https://www.npmjs.com/package/jsdoc jsdoc}, yarn and {@link https://pnpm.io pnpm}:</li>
 *  <ul>
 *    <li>sudo npm install --global yarn</li>
 *    <li>sudo npm install -g jsdoc</li>
 *    <li>sudo npm install -g pnpm</li>
 *  </ul>
 *  <li>To run react in the browser, then run {@link https://babeljs.io Babel} on the fly,
 *  and save the "compiled" output when the source has changed:</li>
 *  <ul>
 *    <li>npm init -y</li>
 *    <li>npm install --save-dev @babel/core @babel/cli @babel/preset-react</li>
 *    <li>npx babel --watch src --out-dir . --presets @babel/preset-react &</li>
 *  </ul>
 *
 *  <li>To run the version with modules and Node.js version
 *     {@link https://nodejs.org/en/blog/release/v18.19.0 18},
 *     {@link https://nodejs.org/en/blog/release/v20.18.0 20} or
 *     {@link https://nodejs.org/en/blog/release/v22.11.0 22}:</li>
 *  <ul>
 *    <li>cd tic-tac-toe</li>
 *    <li>{@link https://www.npmjs.com npm} or {@link https://yarnpkg.com yarn} install</li>
 *    <li>{@link https://www.npmjs.com/package/react npm} or {@link https://yarnpkg.com/package/react yarn} start</li>
 *  </ul>
 * </ul>
 *
 * @author Paulo Roma based on {@link https://opensource.fb.com|Meta Open Source}
 * @since 17/09/2021
 * @see <a href="../src/tic-tac-toe.js">source</a>
 * @see <a href="../tic-tac-toe.js">source compiled (Babel)</a>
 * @see <a href="/cwdc/14-react/tic-tac-toe/tic-tac-toe.html">link</a>
 * @see {@link https://reactjs.org/tutorial/tutorial.html Tutorial: Tic-Tac-Toe}
 * @see {@link https://flarnie.github.io/react/tutorial/tutorial.html Tutorial: Intro To React}
 * @see {@link external:react-dom react-dom}
 * @see {@link https://react.dev/reference/react/createElement createElement}
 * @see {@link https://reactjs.org/docs/add-react-to-a-website.html Add React to an Existing Project}
 * @see {@link https://legacy.reactjs.org/docs/faq-build.html Babel, JSX, and Build Steps}
 * @see  <iframe width="400" height=320" src="/cwdc/14-react/tic-tac-toe/tic-tac-toe.html"></iframe>
 */

"use strict";

/**
 * <p>React is the library for web and native user interfaces.</p>
 * React lets you build user interfaces out of individual pieces called
 * {@link React.Component components} written in JavaScript.
 *
 * <p>Elements are the smallest building blocks of React apps.
 * An {@link https://react.dev/reference/react/createElement element}
 * describes what you want to see on the screen.</p>
 *
 * @external react
 * @see {@link https://react.dev/reference/react React Reference Overview}
 * @see {@link https://legacy.reactjs.org/docs/react-api.html React Top-Level API}
 */

/**
 * React DOM module.
 * @external react-dom
 * @see {@link https://react.dev/reference/react-dom React DOM APIs}
 */

/**
 * <p>You don’t need to install {@link https://react.dev/learn/installation#try-react anything}
 * to play with React.</p>
 *
 * To try React locally on your computer, download this
 * {@link https://gist.githubusercontent.com/gaearon/0275b1e1518599bbeafcde4722e79ed1/raw/db72dcbf3384ee1708c4a07d3be79860db04bff0/example.html HTML page}
 * and open it in your editor and in your browser!
 *
 * <p>This is how this application does it.</p>
 *
 * The other option is {@link https://react.dev/learn/add-react-to-an-existing-project seting up}
 * a modular JavaScript environment,
 * e.g., by using {@link https://vite.dev/ Vite} or
 * {@link https://create-react-app.dev/ CRA}.
 * However, React's new documentation, released on March 16, 2023,
 * no longer recommends CRA as the go-to solution for creating React applications.
 *
 * @namespace React
 * @see {@link https://react.dev/learn/start-a-new-react-project Start a New React Project}
 * @see {@link https://legacy.reactjs.org/docs/create-a-new-react-app.html Create a New React App}
 * @see {@link https://www.epicweb.dev/why-i-wont-use-nextjs Why I Won't Use Next.js}
 */

/**
 * <p>{@link https://react.dev/reference/react/Component Component}
 * is the base class for the React components
 * defined as JavaScript classes.
 * Class components are still supported by React,
 * but we don’t recommend using them in new code.</p>
 *
 * React lets you define components as classes or functions.
 * Components defined as classes currently provide more features
 * which are described in detail on this page.
 * To define a React component class, you need to extend React.Component.
 *
 * <p>The only method you must define in a React.Component subclass is called render().
 * All the other methods described on this page are optional.</p>
 * @class React.Component
 * @memberof React
 * @see {@link https://legacy.reactjs.org/docs/react-component.html React.Component}
 */

/**
 * Color table for winner color and background.
 * @type {Object<String,String>}
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var cTable = {
  winner: "red",
  backw: "lightgrey",
  normal: "black",
  backn: "white"
};

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
 * @param {String} props.color square color.
 * @param {String} props.backg square background color.
 * @param {Game#handleClick} props.onClick button onClick callback.
 * @returns {React.JSX.Element} a &lt;button&gt; tag with the given props.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment Destructuring assignment}
 * @see {@link https://michael-karen.medium.com/getting-started-with-modern-javascript-destructuring-assignment-140d0adc37da Getting Started with Modern JavaScript — Destructuring}
 * @see {@link https://javascript.info/destructuring-assignment Destructuring assignment}
 */
function Square() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? props : arguments[0];

  var value = _ref.value;
  var color = _ref.color;
  var backg = _ref.backg;
  var onClick = _ref.onClick;

  return React.createElement(
    "button",
    {
      className: "square",
      style: { color: color, background: backg },
      onClick: onClick
    },
    value
  );
}

/**
 * Function component to render a row of the board.
 * @param {Object} props React Props.
 * @param {Array<Number>} props.arr three row indices.
 * @param {function} props.renderSquare function for rendering a square.
 * @returns {React.JSX.Element} &lt;div&gt; tag with three {@link Board#renderSquare squares}.
 */
function Row() {
  var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? props : arguments[0];

  var arr = _ref2.arr;
  var renderSquare = _ref2.renderSquare;

  return React.createElement(
    "div",
    { className: "board-row" },
    arr.map(function (item) {
      return renderSquare(item);
    })
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

var Board = (function (_React$Component) {
  _inherits(Board, _React$Component);

  /**
   * Board constructor.
   * @param {Object} props component input.
   * @param {Array<String>} props.squares current array with their 9 squares.
   * @param {Object<String, Array<Number>>} props.winner winner and configuration.
   * @param {Game#handleClick} props.onClick button onClick callback.
   * @extends {React.Component<Props>}
   * @see {@link https://reactjs.org/docs/react-component.html React.Component}
   */

  function Board(props) {
    _classCallCheck(this, Board);

    _get(Object.getPrototypeOf(Board.prototype), "constructor", this).call(this, props);
    console.log("Board props: ", props);
  }

  /**
   * <p>Game class.</p>
   *
   * To “remember” things, components maintain a {@link https://legacy.reactjs.org/docs/faq-state.html state}.
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

  /**
   * We'll pass down a prop, from the Board to the Square,
   * with a value and function, and we'll have Square call
   * that function when a square is clicked.
   *
   * @param {Number} i square index ∈ [0..8].
   * @returns {React.JSX.Element} the i-th square with its value and click callback.
   */

  _createClass(Board, [{
    key: "renderSquare",
    value: function renderSquare(i) {
      var _this = this;

      var winner_square = this.props.winner && this.props.winner.line.includes(i);
      var color = winner_square ? cTable.winner : cTable.normal;
      var backg = winner_square ? cTable.backw : cTable.backn;
      return React.createElement(Square, {
        key: i,
        value: this.props.squares[i],
        color: color,
        backg: backg,
        onClick: function () {
          return _this.props.onClick(i);
        }
      });
    }

    /**
     * {@link Board#renderSquare Renders} the 9 squares of the board.
     * @returns {React.JSX.Element} a &lt;div&gt; tag with a 3 × 3 grid layout, with 3
     * buttons per row, each of which with value 'X', 'O' or null.
     * @see {@link https://legacy.reactjs.org/docs/react-component.html#render render()}
     */
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var rSquare = function rSquare(i) {
        return _this2.renderSquare(i);
      };
      return React.createElement(
        "div",
        null,
        React.createElement(Row, { arr: [0, 1, 2], renderSquare: rSquare }),
        React.createElement(Row, { arr: [3, 4, 5], renderSquare: rSquare }),
        React.createElement(Row, { arr: [6, 7, 8], renderSquare: rSquare })
      );
    }
  }]);

  return Board;
})(React.Component);

var Game = (function (_React$Component2) {
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
   * @see {@link https://reactjs.org/docs/react-component.html React.Component}
   */

  function Game(props) {
    _classCallCheck(this, Game);

    _get(Object.getPrototypeOf(Game.prototype), "constructor", this).call(this, props);
    console.log("Game props: ", props);

    /**
     * The state of the game.
     * @member {Object}
     * @property {Array<Object<{squares: Array<String>}>>} state.history history array.
     * @property {Number} state.stepNumber step number.
     * @property {Boolean} state.xIsNext player turn.
     * @property {state_setter} state.setState setter - change state.
     */
    this.state = {
      history: [{
        squares: Array(9).fill(null)
      }],
      stepNumber: 0,
      xIsNext: true
    };
  }

  // ========================================

  /**
   * Render a React element into the DOM in the supplied container and
   * return a reference to the component (or returns null for stateless components).
   * <p>Deprecated.</p>
   * @method render
   * @memberof external:react-dom
   * @see {@link https://reactjs.org/docs/react-dom.html#render render()}
   * @see {@link https://react.dev/reference/react-dom/render render}
   */

  /**
   * Create a root to display React components inside a browser DOM node.
   * After you’ve created a root, you need to call root.render to display a React component inside of it.
   * @method createRoot
   * @memberof external:react-dom
   * @see {@link https://react.dev/reference/react-dom/client/createRoot createRoot}
   */

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
   * <ul>
   * <li>When you set state in React, a new value must be passed or
   * React will bail-out and not *re-render your component.
   * React uses something similar to === to compare the old and new state
   * to see if they're the same.</li>
   * </ul>
   * <ul>
   * <li>It does shallow equality checks and this is why objects and arrays
   * cannot simply be mutated to create a state change because a
   * mutation will not create a new reference for React to notice a change.
   * React requires immutability because you'll create a whole new copy
   * of objects and arrays
   * with your changes in order to satisfy a shallow equality check.</li>
   * </ul>
   *
   * @param {Number} i an index ∈ [0..8] corresponding to the button clicked.
   * @see {@link https://reactjs.org/docs/react-component.html#setstate setState()}
   * @see {@link https://www.codecademy.com/resources/docs/javascript/arrays/slice .slice()}
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
       * @see {@link https://www.geeksforgeeks.org/reactjs-setstate/ ReactJS setState()}
       * @see {@link https://dev.to/johnstonlogan/react-hooks-barney-style-1hk7 useState() vs setState() - Strings, Objects, and Arrays}
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
     * @see {@link https://react.dev/reference/react/useState useState}
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
     * @returns {React.JSX.Element} a tag &lt;game&gt;, with the 3 × 3 {@link Board} grid layout and
     * an ordered list of buttons for the time travel.
     * @see {@link https://legacy.reactjs.org/docs/react-component.html#render render()}
     * @see {@link https://www.w3schools.com/react/react_props.asp React Props}
     */
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

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
       * @type {Array<React.JSX.Element>}
       * @memberof Game#
       */
      var moves = history.map(function (step, move) {
        //                      go to   #move     or   when move is 0
        var desc = move ? "Go to move #" + move : "Go to game start";
        return React.createElement(
          "li",
          { key: move },
          React.createElement(
            "button",
            { onClick: function () {
                return _this3.jumpTo(move);
              } },
            desc
          )
        );
      });

      var status = undefined;
      if (winner) {
        status = "Winner: " + winner.winner;
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
          { className: "game-logo" },
          React.createElement(
            "a",
            { href: "https://github.com/krotalias/cwdc/tree/main/14-react/tic-tac-toe" },
            React.createElement("img", {
              src: "./src/github.png",
              style: { height: "32px" },
              alt: "github"
            })
          )
        ),
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
            winner: winner,
            onClick: function (i) {
              return _this3.handleClick(i);
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
})(React.Component);

if (React.version < "18") {
  ReactDOM.render(React.createElement(Game, null), document.getElementById("tic-tac-toe"));
  console.log("Using ReactDOM.render: " + React.version);
} else {
  var root = ReactDOM.createRoot(document.getElementById("tic-tac-toe"));
  root.render(React.createElement(Game, null));
  console.log("Using ReactDOM.createRoot: " + React.version);
}

/**
 * Given an array of 9 squares, this function will check
 * for a winner and return 'X', 'O', or null as appropriate.
 *
 * @param {Array<String>} squares a given array with 9 "X" / "O".
 * @returns {Object<winner:String, line:Array<Number>>}
 * the winner: "X" or "O", and the configuration: line, column or diagonal, <br>
 * or null, if there is no winner.
 */
function calculateWinner(squares) {
  /**
   * The eight winner configurations: rows, columns and diagonals.
   * @type {Array<Array<Number>>}
   */
  var lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = lines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 3);

      var a = _step$value[0];
      var b = _step$value[1];
      var c = _step$value[2];

      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"]) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return null;
}