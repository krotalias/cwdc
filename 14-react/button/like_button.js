"use strict";

/**
 * @file
 *
 * Summary.
 * <p>Add React in One Minute</p>
 *
 * @author Dan Gaearon
 * @since 24/06/2018
 * @see <a href="../like_button.js">source</a>
 * @see <a href="/cwdc/14-react/button/index.html">link</a>
 * @see https://reactjs.org/docs/add-react-to-a-website.html
 * @see https://www.freecodecamp.org/news/javascript-object-destructuring-spread-operator-rest-parameter/
 * @see https://gist.github.com/gaearon/6668a1f6986742109c00a581ce704605
 */

const e = React.createElement;

/**
 * A very simple class with just one button.
 */
class LikeButton extends React.Component {
  /**
   * Creates a new react component.
   * @param {type.defaultProps} props
   */
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  /**
   * Creates a button or just a string "You liked this",
   * if the button has been pressed.
   * @return {React.Element|String} a React element object with a few properties.
   * @see https://react.dev/reference/react/createElement
   */
  render() {
    if (this.state.liked) {
      return "You liked this.";
    }

    return e(
      "button",
      { onClick: () => this.setState({ liked: true }) },
      "Like"
    );
  }
}

const domContainer = document.querySelector("#like_button_container");
ReactDOM.render(e(LikeButton), domContainer);
