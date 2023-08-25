/**
 * @file
 *
 * Summary.
 * <p>An interface based on {@link https://getbootstrap.com/docs/5.2/getting-started/introduction/ Bootstrap 5.2}
 * for counting items implemented with {@link https://codewithmosh.com/p/mastering-react|React}.</p>
 *
 * React is a lightweight library for building fast and interactive user interfaces.
 * Unlike {@link https://angular.io Angular}, which is a framework (or a complete solution), React is essentially a ‘view library’.
 * It only takes care of the view or what is rendered in the DOM.
 * It doesn’t have an opinion about other aspects of an app such as routing, calling HTTP services, etc.
 * For those concerns, you need to use other libraries.
 * This means you get the freedom to choose the libraries that you’re familiar with or prefer.
 *
 * <p><b>Important remark</b>: using React without {@link https://nodejs.dev/en/ nodejs}
 * is a great way to try React, but it's not suitable for production.<br>
 * It slowly compiles {@link https://react.dev/learn/javascript-in-jsx-with-curly-braces JSX}
 * with Babel in the browser, and uses a large development build of React.</p>
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
 *
 *    <li>Or even use a {@link https://www.copycat.dev/blog/reactjs-cdn/ CDN} to
 *    make your life incredibly easier, by avoiding messing around with the React ecosystem.</li>
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
 *    <li>npm install babel-cli@6 babel-preset-react-app@3</li>
 *    <li>npx babel --watch src --out-dir . --presets react-app/prod &</li>
 *  </ul>
 *
 *  <li>To run the version with modules and Node.js version {@link https://nodejs.org/en/blog/release/v16.16.0 16}:</li>
 *  <ul>
 *    <li>cd counter-app</li>
 *    <li>{@link https://www.npmjs.com npm} or {@link https://yarnpkg.com yarn} install</li>
 *    <li>{@link https://www.npmjs.com/package/react npm} or {@link https://yarnpkg.com/package/react yarn} start</li>
 *  </ul>
 * </ul>
 *
 * @author {@link https://codewithmosh.com|Mosh Hamedani}
 * @author Paulo Roma
 * @since 08/10/2021
 * @see <a href="../src/App.js">source</a>
 * @see <a href="../package.json">package.json</a>
 * @see <a href="/cwdc/14-react/counter/counter.html">link</a>
 * @see <a href="/cwdc/14-react/counter/counter2.html">link production</a>
 * @see <a href="http://localhost:3000">link node</a>
 * @see https://reactjs.org/docs/react-dom.html
 * @see https://reactjs.org/docs/react-api.html#createelement
 * @see https://learn2torials.com/a/react-state-and-props
 * @see https://github.com/fishstick22/mastering-react-mosh
 * @see https://medium.com/swlh/modern-react-development-but-without-200-mb-of-node-modules-69d8ca01eacf
 * @see https://ustechportal.com/error-error-0308010c-digital-envelope-routines-unsupported/
 * @see <img src="../counter.png" width="256">
 */

"use strict";

/**
 * <p>A single source of truth for our interface.</p>
 *
 * <p>The component that owns a piece of the state, should be the one modifying it.</p>
 *
 * App is the parent of both the NavBar and Counters components,
 * so the counters array information can be passed as a prop to its children.
 *
 * Therefore, the state and the methods modifying it, are kept in the App.
 * These methods are then passed to its children via props.
 *
 * @extends {React.Component}
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  /**
   * <ul>
   *    <li>Set up the initial state of the application: a set of four counters</li>
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
   * @see https://www.digitalocean.com/community/tutorials/react-constructors-with-react-components
   */
  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.ncounters = 4;

    _this.handleIncrement = function (counter) {
      console.log("Increment", counter);
      var counters = [].concat(_toConsumableArray(_this.state.counters));
      var index = counters.indexOf(counter);
      // a copy of the counter object: {id: i , value: v}
      counters[index] = Object.assign({}, counter);
      counters[index].value++;

      /**
       * <p>Add the new configuration (a new set of counters) to {@link App#state state}.</p>
       * <pre>
       * counters: Array
       * [
       *    {id: 1, value: 3},
       *    {id: 2, value: 0},
       *    {id: 3, value: 7},
       *    {id: 4, value: 0}
       * ] (4) = $2
       * </pre>
       * When you call {@link https://react.dev/reference/react/useState setState} in a component,
       * React automatically updates the child components inside of it too.
       * @callback state_setter
       * @see https://www.geeksforgeeks.org/reactjs-setstate/
       * @see https://dev.to/johnstonlogan/react-hooks-barney-style-1hk7
       */
      _this.setState({ counters: counters });
    };

    _this.handleDecrement = function (counter) {
      console.log("Decrement", counter);
      var counters = [].concat(_toConsumableArray(_this.state.counters));
      var index = counters.indexOf(counter);
      counters[index] = Object.assign({}, counter);
      counters[index].value--;
      _this.setState({ counters: counters });
    };

    _this.handleReset = function () {
      var counters = _this.state.counters.map(function (c) {
        c.value = 0;
        return c;
      });
      _this.setState({ counters: counters });
    };

    _this.handleDelete = function (counterId) {
      console.log("Event Handler Called", counterId);
      var counters = _this.state.counters.filter(function (c) {
        return c.id !== counterId;
      });
      _this.setState({ counters: counters });
    };

    _this.handleInsert = function () {
      _this.setState(function (state) {
        return {
          counters: [].concat(_toConsumableArray(state.counters), [{ id: state.maxId + 1, value: 0 }]),
          maxId: state.maxId + 1
        };
      });
    };

    console.log("App constructor: props", _this.props);

    /**
     * <p>The state of the application.</p>
     * React components have a built-in state object which is private to the component.
     * <ul>
     *  <li>State can not be accessed from outside the class.</li>
     *  <li>However, it can be passed as an argument to another component.</li>
     * </ul>
     * @type {Object}
     * @property {Array<Object<id:Number,value:Number>>} state.counters array of counter objects.
     * @property {Number} maxId maximum Id value used so far.
     * @property {state_setter} state.setState setter - change state.
     */
    _this.state = {
      counters: Array.from({ length: _this.ncounters }, function (_, index) {
        return {
          id: index + 1,
          value: 0
        };
      }),
      maxId: _this.ncounters
    };
    return _this;
  }

  /**
   * <p>Update the state property to increment a given counter.</p>
   *
   * Remember that arrow functions do not rebind this keyword, instead they inherit it.<br>
   * Also to change the state, we must use setState inherited from the base Component,
   * to update the view, and bring the DOM in sync with the virtual DOM.
   *
   * <p>Therefore, this.state.counters[indexOf(counter)].value++ will not work.
   * It is necessary to create a new object and pass it to setState.</p>
   *
   * The setState will schedule an asynchronous call to the {@link App#render|render} method, which will
   * return a new react element at some point in the future.
   *
   * @param {Object<id:Number,value:Number>} counter selected counter object.
   * @function
   */

  /**
   * Number of counters.
   * @type {Number}
   */


  /**
   * <p>Update the state property to decrement a given counter.</p>
   *
   * @param {Object<id:Number,value:Number>} counter selected counter object.
   * @function
   */


  /**
   * <p>Update the state property to reset all counters to zero.</p>
   *
   * @param {Object<id:Number,value:Number>} counter selected counter object.
   * @function
   */


  /**
   * <p>Update the state property to delete a given counter.</p>
   *
   * In fact, we buid a new array without the deleted one and update the state.
   *
   * @param {Number} counterId id of the selected counter.
   * @function
   */


  /**
   * <p>Update the state property to insert a new counter.</p>
   *
   * In fact, we buid a new array, add another counter, and update the state.
   *
   * @function
   * @see https://legacy.reactjs.org/docs/state-and-lifecycle.html
   * @see https://www.robinwieruch.de/react-state-array-add-update-remove/
   */


  _createClass(App, [{
    key: "render",


    /**
     * Creates a Navbar to totalize the number of counters being used.
     *
     * @returns {React.Fragment} a react fragment with a Navbar and a Counters component.
     * @see <a href="../doc-counter/Counters.html"> Counters component </a>
     * @see <a href="../doc-counter/global.html#NavBar"> NavBar component </a>
     * @see https://reactjs.org/docs/fragments.html
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/main
     * @see https://getbootstrap.com/docs/4.0/components/navbar/#placement
     */
    value: function render() {
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(NavBar, {
          totalCounters: this.state.counters.filter(function (c) {
            return c.value > 0;
          }).length
        }),
        React.createElement(
          "main",
          { role: "main", className: "container-fluid bg-antique" },
          React.createElement(
            "div",
            { className: "counters" },
            React.createElement(Counters
            // pass 6 props to Counters (props are read only)
            , { counters: this.state.counters,
              onReset: this.handleReset,
              onIncrement: this.handleIncrement,
              onDecrement: this.handleDecrement,
              onDelete: this.handleDelete,
              onInsert: this.handleInsert
            })
          )
        )
      );
    }
  }]);

  return App;
}(React.Component);

ReactDOM.render(React.createElement(App, null), document.getElementById("root"));