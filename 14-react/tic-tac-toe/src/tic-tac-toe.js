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
 *  <li>To install jsdoc and yarn:</li>
 *  <ul>
 *    <li>sudo npm install --global yarn</li>
 *    <li>sudo npm install -g jsdoc</li>
 *  </ul>
 *  <li>To run react in the browser, then run {@link https://babeljs.io Babel} on the fly,
 *  and save the "compiled" output when the source has changed:</li>
 *  <ul>
 *    <li>npm init -y</li>
 *    <li>npm install --save-dev @babel/core @babel/cli @babel/preset-react</li>
 *    <li>npx babel --watch src --out-dir . --presets @babel/preset-react &</li>
 *  </ul>
 *
 *  <li>To run the version with modules and Node.js version {@link https://nodejs.org/en/blog/release/v16.16.0 16}
 *  or {@link https://nodejs.org/en/blog/release/v18.16.0 18}:</li>
 *  <ul>
 *    <li>cd tic-tac-toe</li>
 *    <li>{@link https://www.npmjs.com npm} or {@link https://yarnpkg.com yarn} install</li>
 *    <li>{@link https://www.npmjs.com/package/react npm} or {@link https://yarnpkg.com/package/react yarn} start</li>
 *  </ul>
 * </ul>
 *
 * @author Paulo Roma based on {@link https://opensource.fb.com|Facebook Open Source}
 * @since 17/09/2021
 * @see <a href="../src/tic-tac-toe.js">source</a>
 * @see <a href="../tic-tac-toe.js">source compiled (Babel)</a>
 * @see <a href="/cwdc/14-react/tic-tac-toe/tic-tac-toe.html">link</a>
 * @see https://reactjs.org/tutorial/tutorial.html#overview
 * @see https://flarnie.github.io/react/tutorial/tutorial.html
 * @see https://reactjs.org/docs/react-dom.html
 * @see https://reactjs.org/docs/react-api.html#createelement
 * @see https://reactjs.org/docs/add-react-to-a-website.html
 * @see https://legacy.reactjs.org/docs/faq-build.html
 * @see <iframe width="400" height=320" src="/cwdc/14-react/tic-tac-toe/tic-tac-toe.html"></iframe>
 */

"use strict";

/**
 * React module.
 * @external react
 * @see https://legacy.reactjs.org/docs/react-api.html
 */

/**
 * React DOM module.
 * @external react-dom
 * @see https://legacy.reactjs.org/docs/react-dom.html
 */

/**
 * Create React App is a comfortable environment for learning React,
 * and is the best way to start building a new single-page application in React.
 * It sets up your development environment so that you can use the latest JavaScript features,
 * provides a nice developer experience, and optimizes your app for production.
 * @class React
 * @memberof external:react
 * @see https://legacy.reactjs.org/docs/create-a-new-react-app.html
 */

/**
 * React lets you define components as classes or functions.
 * Components defined as classes currently provide more features which are described in detail on this page.
 * To define a React component class, you need to extend React.Component.
 *
 * <p>The only method you must define in a React.Component subclass is called render().
 * All the other methods described on this page are optional.</p>
 * @class React.Component
 * @memberof React
 * @see https://legacy.reactjs.org/docs/react-component.html
 * @see https://react.dev/reference/react/Component
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
function Square({ value, onClick } = props) {
  return (
    <button className="square" onClick={onClick}>
      {value}
    </button>
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
class Board extends React.Component {
  /**
   * Board constructor.
   * @param {Object} props component input.
   * @param {Array<String>} props.squares current array with their 9 squares.
   * @param {Game#handleClick} props.onClick button onClick callback.
   * @extends {React.Component<Props>}
   * @see https://reactjs.org/docs/react-component.html
   */
  constructor(props) {
    super(props);
    console.log("Board props: ", props);
  }

  /**
   * We’ll pass down a prop, from the Board to the Square,
   * with a value and function, and we’ll have Square call
   * that function when a square is clicked.
   *
   * @param {Number} i square index ∈ [0..8].
   * @returns {Square} the i-th square with its value and click callback.
   */
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  /**
   * Renders the 9 squares of the board.
   * @returns {HTMLDivElement} a &lt;div&gt; tag with a 3 × 3 grid layout, with 3
   * buttons per row, each of which with value 'X', 'O' or null.
   * @memberof React.Component
   * @see https://legacy.reactjs.org/docs/react-component.html#render
   */
  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

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
class Game extends React.Component {
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
  constructor(props) {
    super(props);
    console.log("Game props: ", props);

    /**
     * The state of the game.
     * @type {Object}
     * @property {Array<Object<{squares: Array<String>}>>} state.history history array.
     * @property {Number} state.stepNumber step number.
     * @property {Boolean} state.xIsNext player turn.
     * @property {state_setter} state.setState setter - change state.
     */
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      stepNumber: 0,
      xIsNext: true,
    };
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
   * @see <img src="../tic-tac-toe.png">
   */
  handleClick(i) {
    // a copy of the current history up to stepNumber.
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    // the last configuration.
    const current = history[history.length - 1];
    // a copy of the last array of "X"s and "O"s from the copied history.
    const nextSquares = current.squares.slice();
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
      history: [...history, { squares: nextSquares }],
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
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
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  /**
   * Renders the grid layout and an ordered list of buttons for each move in this game history.
   *
   * @returns {HTMLDivElement} a tag &lt;game&gt;, with the 3 × 3 {@link Board} grid layout and
   * an ordered list of buttons for the time travel.
   * @memberof React.Component
   * @see https://legacy.reactjs.org/docs/react-component.html#render
   * @see https://www.w3schools.com/react/react_props.asp
   */
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    /**
     * <p>Creates buttons for each move in history.</p>
     * <pre>
     *    0: {$$typeof: Symbol(react.element), type: "li", key: "0", ref: null, props: Object, …}
     *    1: {$$typeof: Symbol(react.element), type: "li", key: "1", ref: null, props: Object, …}
     *    ...
     * </pre>
     * @type {Array<react.element>}
     */
    const moves = history.map((step, move) => {
      //                      go to   #move     or   when move is 0
      const desc = move ? `Go to move #${move}` : "Go to game start";
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else if (this.state.stepNumber > 8) {
      status = "Game Over: Draw";
    } else {
      status = `Next player: ${this.state.xIsNext ? "X" : "O"}`;
    }

    /**
     * This is really beautiful.
     * {@link Board} is going to draw the configuration indicated by stepNumber,
     * used to get the current entry into the history array.
     * The Board component receives the arguments (squares, onClick) as a props object.
     */
    return (
      <div className="game">
        <div className="game-logo">
          <a href="https://github.com/krotalias/cwdc/tree/main/14-react/tic-tac-toe">
            <img
              src="./src/github.png"
              style={{ height: "32px" }}
              alt="github"
            />
          </a>
        </div>
        <div className="game-board">
          <div>
            <p style={{ textAlign: "center" }}>{status}</p>
          </div>
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <p style={{ textAlign: "center" }}>History</p>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

/**
 * Render a React element into the DOM in the supplied container and
 * return a reference to the component (or returns null for stateless components).
 * <p>Deprecated.</p>
 * @method render
 * @memberof external:react-dom
 * @see https://reactjs.org/docs/react-dom.html#render
 * @see https://react.dev/reference/react-dom/render
 */
// ReactDOM.render(<Game />, document.getElementById("tic-tac-toe"));

/**
 * Create a root to display React components inside a browser DOM node.
 * After you’ve created a root, you need to call root.render to display a React component inside of it.
 * @method createRoot
 * @memberof external:react-dom
 * @see https://react.dev/reference/react-dom/client/createRoot
 */
const root = ReactDOM.createRoot(document.getElementById("tic-tac-toe"));
root.render(<Game />);

/**
 * Given an array of 9 squares, this function will check
 * for a winner and return 'X', 'O', or null as appropriate.
 *
 * @param {Array<String>} squares a given array of 9 squares.
 * @returns {String} <p>the winner: "X", "O", or null if there is not a winner.</p>
 */
function calculateWinner(squares) {
  // The eight winner configurations: rows, columns and diagonals.
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
