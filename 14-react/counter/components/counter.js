/**
 * @file
 *
 * Summary.
 * <p>A component to display and modify a counter.</p>
 *
 * Counter raises the events that are handled by the Counters component.
 *
 * @author {@link https://codewithmosh.com|Mosh Hamedani}
 * @author Paulo Roma
 * @since 08/10/2021
 * @see <a href="../src/components/counter.jsx">source</a>
 * @see <a href="../components/counter.js">source Babel</a>
 * @see <a href="/cwdc/14-react/counter/counter.html">link</a>
 */

/**
 * <p>Creates a row of buttons for a counter.</p>
 *
 * Also define some life cycle hooks.
 * @extends {React.Component}
 * @see {@link https://reactjs.org/docs/react-component.html React.Component}
 * @see {@link https://www.digitalocean.com/community/tutorials/react-constructors-with-react-components Understanding Constructors with React Components}
 * @see <img src="../row.png" width="256">
 */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Counter = (function (_React$Component) {
  _inherits(Counter, _React$Component);

  /**
   * Class components always need to call the base constructor with props.
   * Moreover, ES6 classes need to call super in case they are subclasses.
   * Thus, if you wish to use it in the constructor, you need to pass it to super().
   *
   * In case we omit it, we can always find props available inside render function.
   * @param {Object} props component input.
   * @param props.key {Number} counter id.
   * @param props.onDelete {Function} callback to delete a counter.
   * @param props.onIncrement {Function} callback to increment a counter.
   * @param props.onDecrement {Function} callback to decrement a counter.
   * @param props.counter {Object<id:Number,value:Number>} counter object.
   */

  function Counter(props) {
    _classCallCheck(this, Counter);

    _get(Object.getPrototypeOf(Counter.prototype), "constructor", this).call(this, props);
    console.log("Counter constructor: props", props);
  }

  /**
   * <p>Called when a component is updated. </p>
   * Remember that setState is asynchronous.<br>
   * Furthermore, there is no state in this class.<br>
   * As a consequence, prevState is always null.
   *
   * @param {Object} prevProps previous props object.
   * @param {Object} prevState previous state object.
   * @see {@link https://dev.to/cesareferrari/how-to-use-componentdidupdate-in-react-30en How to use componentDidUpdate in React}
   */

  _createClass(Counter, [{
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.counter.value !== this.props.counter.value) {
        // Ajax call and get new data from the server
        console.log("componentDidUpdate: Ajax has been called");
        console.log("prevProps: " + prevProps.counter.value);
        console.log("Props: " + this.props.counter.value);
      }
    }

    /**
     * Called when the component is destroyed.
     */
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      console.log("Counter - Unmount");
    }

    /**
     * Use bootstrap's <a href="/cwdc/5-bootstrap/5.3.html">grid system</a>
     * to build layouts: one row and two columns.
     * @return {React.JSX.Element} a badge, plus an increment, a decrement, and a delete button.
     * @see {@link https://getbootstrap.com/docs/4.6/layout/grid/ Grid system}
     * @see {@link https://getbootstrap.com/docs/4.6/utilities/spacing/ Spacing}
     * @see {@link https://www.bitdegree.org/learn/horizontal-grid Step by Step Tutorial for Creating a Perfect Horizontal Grid}
     * @see {@link https://icons.getbootstrap.com/icons/trash/ Trash}
     * @see {@link https://fontawesome.com/v4/icons/ The Icons}
     */
  }, {
    key: "render",
    value: function render() {
      console.log("Counter: props", this.props);
      var _props = this.props;
      var counter = _props.counter;
      var onIncrement = _props.onIncrement;
      var onDecrement = _props.onDecrement;
      var onDelete = _props.onDelete;

      return React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "w-100" },
          this.props.children
        ),
        React.createElement(
          "div",
          { className: "col-sm-1" },
          React.createElement(
            "span",
            { className: this.getBadgeClasses() },
            this.formatCount()
          )
        ),
        React.createElement(
          "div",
          { className: "col" },
          React.createElement(
            "button",
            {
              type: "button",
              className: "btn btn-secondary btn-sm",
              onClick: function () {
                return onIncrement(counter);
              }
            },
            React.createElement("span", { className: "fa fa-plus" })
          ),
          React.createElement(
            "button",
            {
              type: "button",
              className: "btn btn-secondary btn-sm m-3",
              onClick: function () {
                return onDecrement(counter);
              },
              disabled: counter.value === 0 ? "disabled" : ""
            },
            React.createElement("span", { className: "fa fa-minus" })
          ),
          React.createElement(
            "button",
            {
              type: "button",
              className: "btn btn-danger btn-sm ",
              onClick: function () {
                return onDelete(counter.id);
              }
            },
            React.createElement("span", { className: "fa fa-trash" })
          )
        )
      );
    }

    /**
     * Returns the color for this counter badge: yellow for 'Zero', or blue otherwise.
     *
     * @returns {String} the class for setting the color of this counter badge.
     */
  }, {
    key: "getBadgeClasses",
    value: function getBadgeClasses() {
      var classes = "badge m-2 bg-";
      classes += this.props.counter.value === 0 ? "warning" : "primary";
      return classes;
    }

    /**
     * Format the value of this counter as 'Zero' or its numerical value.
     *
     * @returns {String|Number} the value of this counter.
     */
  }, {
    key: "formatCount",
    value: function formatCount() {
      var value = this.props.counter.value;

      return value === 0 ? "Zero" : value;
    }
  }]);

  return Counter;
})(React.Component);

/* jump line after counterid: 2) */ /* break point medium (720px) */ /* .col-xs-* classes, create a basic grid system that starts out stacked on */ /* extra small sizes and becomes horizontal at the small breakpoint (sm). */ /* m-3 is the marging */