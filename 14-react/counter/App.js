/**
 * @file
 *
 * Summary.
 * <p>An interface based on {@link https://getbootstrap.com/docs/5.2/getting-started/introduction/ Bootstrap 5.2}
 * for counting items implemented with {@link https://codewithmosh.com/p/mastering-react|React}.</p>
 *
 * {@link https://react.dev React} is a lightweight library for building fast and interactive user interfaces.
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
 *    {@link https://nodejs.org/en/blog/release/v18.19.0 18} or
 *    {@link https://nodejs.org/en/blog/release/v20.10.0 20}:</li>
 *  <ul>
 *    <li>cd counter</li>
 *    <li>{@link https://www.npmjs.com npm} or {@link https://yarnpkg.com yarn} install</li>
 *    <li>{@link https://www.npmjs.com/package/react npm} or {@link https://yarnpkg.com/package/react yarn} start</li>
 *  </ul>
 * </ul>
 *
 * @author {@link https://codewithmosh.com|Mosh Hamedani}
 * @author Paulo Roma
 * @since 08/10/2021
 * @see <a href="../src/App.js">source</a>
 * @see <a href="/cwdc/14-react/counter/counter.html">link</a>
 * @see <a href="/cwdc/14-react/counter/counter2.html">link production</a>
 * @see <a href="http://localhost:3000">link node</a>
 * @see {@link https://reactjs.org/docs/react-api.html#createelement createElement()}
 * @see {@link https://learn2torials.com/a/react-state-and-props React State and Props}
 * @see {@link https://github.com/fishstick22/mastering-react-mosh mastering-react-mosh}
 * @see {@link https://medium.com/swlh/modern-react-development-but-without-200-mb-of-node-modules-69d8ca01eacf Modern React Development But Without 200+ MB of Node Modules}
 * @see {@link https://ustechportal.com/error-error-0308010c-digital-envelope-routines-unsupported/ Error:Error:0308010c:Digital Envelope Routines::Unsupported}
 * @see <iframe width="700" height="512" src="/cwdc/14-react/counter/counter.html"></iframe>
 */

"use strict";

/**
 * React module.
 *
 * <p>React is the library for web and native user interfaces.</p>
 * React lets you build user interfaces out of individual pieces called
 * {@link React.Component components} written in JavaScript.
 *
 * <p>Elements are the smallest building blocks of React apps.
 * An {@link https://react.dev/reference/react/createElement element}
 * describes what you want to see on the screen.</p>
 *
 * @external react
 * @see {@link https://legacy.reactjs.org/docs/react-api.html React Top-Level API}
 * @see {@link https://legacy.reactjs.org/docs/create-a-new-react-app.html Create a New React App}
 */

/**
 * React DOM module.
 * @external react-dom
 * @see {@link https://legacy.reactjs.org/docs/react-dom.html ReactDOM}
 */

/**
 * <p>You don’t need to install {@link https://react.dev/learn/installation#try-react anything}
 * to play with React.</p>
 *
 * <p>To try React locally on your computer, download this
 * {@link https://gist.githubusercontent.com/gaearon/0275b1e1518599bbeafcde4722e79ed1/raw/db72dcbf3384ee1708c4a07d3be79860db04bff0/example.html HTML page}
 * and open it in your editor and in your browser!</p>
 *
 * This is how this application does it.
 *
 * <p>The other option is {@link https://react.dev/learn/add-react-to-an-existing-project seting up}
 * a modular JavaScript environment,
 * e.g., by using {@link https://vite.dev/ Vite} or
 * {@link https://create-react-app.dev/ CRA}.
 *
 * However, React's new {@link https://dev.to/ag2byte/create-react-app-is-officially-dead-h7o documentation},
 * released on March 16, 2023,
 * no longer recommends CRA as the go-to solution for creating React applications.</p>
 * @namespace React
 * @see {@link https://react.dev/learn/start-a-new-react-project Start a New React Project}
 * @see {@link https://legacy.reactjs.org/docs/create-a-new-react-app.html Create a New React App}
 * @see {@link https://www.epicweb.dev/why-i-wont-use-nextjs Why I Won't Use Next.js}
 * @see {@link https://www.uptech.team/blog/why-use-react WHEN AND WHY YOU SHOULD USE REACT?}
 * @see {@link https://dev.to/sayanide/the-what-why-and-how-of-javascript-bundlers-4po9 The What, Why and How of JavaScript bundlers}
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
 * @see {@link https://legacy.reactjs.org/docs/react-component.html React Top-Level API}
 * @see {@link https://react.dev/reference/react/Component Component}
 */

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
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields Public class fields}
 */
class App extends React.Component {
  /**
   * Number of counters.
   * @type {Number}
   */
  ncounters = 4;

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
  constructor(props) {
    super(props);
    console.log("App constructor: props", this.props);

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
    this.state = {
      counters: Array.from({
        length: this.ncounters
      }, (_, index) => ({
        id: index + 1,
        value: 0
      })),
      maxId: this.ncounters
    };
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
  handleIncrement = counter => {
    console.log("Increment", counter);
    const counters = [...this.state.counters];
    const index = counters.indexOf(counter);
    // a copy of the counter object: {id: i , value: v}
    counters[index] = {
      ...counter
    };
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
     * @see {@link https://www.geeksforgeeks.org/reactjs-setstate/ ReactJS setState()}
     * @see {@link https://dev.to/johnstonlogan/react-hooks-barney-style-1hk7 useState() vs setState() - Strings, Objects, and Arrays}
     */
    this.setState({
      counters
    });
  };

  /**
   * <p>Update the state property to decrement a given counter.</p>
   *
   * @param {Object<id:Number,value:Number>} counter selected counter object.
   * @function
   */
  handleDecrement = counter => {
    console.log("Decrement", counter);
    const counters = [...this.state.counters];
    const index = counters.indexOf(counter);
    counters[index] = {
      ...counter
    };
    counters[index].value--;
    this.setState({
      counters
    });
  };

  /**
   * <p>Update the state property to reset all counters to zero.</p>
   *
   * @param {Object<id:Number,value:Number>} counter selected counter object.
   * @function
   */
  handleReset = () => {
    const counters = this.state.counters.map(c => {
      c.value = 0;
      return c;
    });
    this.setState({
      counters
    });
  };

  /**
   * <p>Update the state property to delete a given counter.</p>
   *
   * In fact, we buid a new array without the deleted one and update the state.
   *
   * @param {Number} counterId id of the selected counter.
   * @function
   */
  handleDelete = counterId => {
    console.log("Event Handler Called", counterId);
    const counters = this.state.counters.filter(c => c.id !== counterId);
    this.setState({
      counters
    });
  };

  /**
   * <p>Update the state property to insert a new counter.</p>
   *
   * In fact, we buid a new array, add another counter, and update the state.
   *
   * @function
   * @see {@link https://legacy.reactjs.org/docs/state-and-lifecycle.html State and Lifecycle}
   * @see {@link https://www.robinwieruch.de/react-state-array-add-update-remove/ How to manage React State with Arrays}
   */
  handleInsert = () => {
    this.setState(state => ({
      counters: [...state.counters, {
        id: state.maxId + 1,
        value: 0
      }],
      maxId: state.maxId + 1
    }));
  };

  /**
   * Creates a Navbar to totalize the number of counters being used.
   * @returns {React.Fragment} a react fragment with a Navbar and a Counters component.
   * @see <a href="../doc-counter/Counters.html"> Counters component </a>
   * @see <a href="../doc-counter/global.html#NavBar"> NavBar component </a>
   * @see {@link https://reactjs.org/docs/fragments.html Fragments}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/main &lt;main&gt;: The Main element}
   * @see {@link https://getbootstrap.com/docs/4.0/components/navbar/#placement Placement}
   */
  render() {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(NavBar, {
      totalCounters: this.state.counters.filter(c => c.value > 0).length
    }), /*#__PURE__*/React.createElement("main", {
      role: "main",
      className: "container-fluid bg-antique"
    }, /*#__PURE__*/React.createElement("div", {
      className: "counters"
    }, /*#__PURE__*/React.createElement(Counters
    // pass 6 props to Counters (props are read only)
    , {
      counters: this.state.counters,
      onReset: this.handleReset,
      onIncrement: this.handleIncrement,
      onDecrement: this.handleDecrement,
      onDelete: this.handleDelete,
      onInsert: this.handleInsert
    }))));
  }
}

/**
 * Create a root to display React components inside a browser DOM node.
 * After you’ve created a root, you need to call root.render to display a React component inside of it.
 * @method createRoot
 * @memberof external:react-dom
 * @see {@link https://react.dev/reference/react-dom/client/createRoot createRoot}
 */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render( /*#__PURE__*/React.createElement(App, null));