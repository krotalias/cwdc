/**
 * @file
 *
 * Summary.
 * <p>{@link https://gist.github.com/gaearon/6668a1f6986742109c00a581ce704605 Add React in One Minute}</p>
 *
 * @author {@link https://gist.github.com/gaearon|Dan Gaearon}
 * @author Paulo Roma
 * @since 24/06/2018
 * @see <a href="../like_button.js">source</a>
 * @see <a href="/cwdc/14-react/button/index.html">link</a>
 * @see https://reactjs.org/docs/add-react-to-a-website.html
 * @see https://www.freecodecamp.org/news/javascript-object-destructuring-spread-operator-rest-parameter/
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
 * <p>Lets you create a React element.</p>
 * It serves as an alternative to writing JSX.
 * @param {String|React.ComponentType} type a valid React component type (e.g., button).
 * @param {Object} props an object or null.
 * @param {HTMLElement} children zero or more child nodes.
 * @return {React.Element} a React element object with a few properties.
 * @memberof external:react
 * @method
 * @see https://react.dev/reference/react/createElement
 */
const e = React.createElement;

/**
 * A very simple class with just one button.
 * @extends {React.Component<Props>}
 */
class LikeButton extends React.Component {
  /**
   * Creates a new react component.
   * @param {Object} props React Props are like function arguments in JavaScript and attributes in HTML.
   */
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  /**
   * <p>Creates a button or just a string "You liked this",
   * if the button has been pressed.</p>
   * {@link external:react.e Elements} are the smallest building blocks of React apps.
   * @return {React.Element|String} a React element object with a few properties.
   * @memberof React.Component
   * @see https://react.dev/reference/react/createElement
   */
  render() {
    if (this.state.liked) {
      return "You liked this.";
    }

    return e(
      "button",
      { onClick: () => this.setState({ liked: true }) },
      "Like",
    );
  }
}

/**
 * Create a root to display React components inside a browser DOM node.
 * After you’ve created a root, you need to call root.render
 * to display a React component inside of it.
 * @method createRoot
 * @memberof external:react-dom
 * @see https://react.dev/reference/react-dom/client/createRoot
 */
const domContainer = document.querySelector("#like_button_container");
const root = ReactDOM.createRoot(domContainer);
root.render(e(LikeButton));
