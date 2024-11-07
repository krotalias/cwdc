/**
 * @file
 *
 * Summary.
 * <p>A component to hold all counters.</p>
 *
 * This is a controlled component, because it does not have any state and
 * it simply receive data and add methods to modify the data via props.
 *
 * @author {@link https://codewithmosh.com Mosh Hamedani}
 * @author Paulo Roma
 * @since 08/10/2021
 * @see <a href="../src/components/counters.jsx">source</a>
 * @see <a href="../components/counters.js">source Babel</a>
 * @see <a href="/cwdc/14-react/counter/counter.html">link</a>
 */

/**
 * <p>Keeps a reset button and a set of buttons for each counter.</p>
 *
 * @extends {React.Component}
 * @see <a href="../doc-counter/Counter.html"> Counter component </a>
 */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Counters = (function (_React$Component) {
  _inherits(Counters, _React$Component);

  /**
   * Class components always need to call the base constructor with props.
   * Moreover, ES6 classes need to call super in case they are subclasses.
   * Thus, if you wish to use it in the constructor, you need to pass it to super().
   *
   * In case we omit it, we can always find props available inside render function.
   * @param {Object} props component input.
   * @param props.counters {Array<Object<id:Number,value:Number>>} array of counter objects.
   * @param props.onReset {Function} callback to reset all counters.
   * @param props.onIncrement {Function} callback to increment a counter.
   * @param props.onDecrement {Function} callback to decrement a counter.
   * @param props.onDelete {Function} callback to delete a counter.
   * @param props.onInsert {Function} callback to insert a new counter.
   * @extends {React.Component<Props>}
   * @see https://reactjs.org/docs/react-component.html
   * @see https://www.digitalocean.com/community/tutorials/react-constructors-with-react-components
   */

  function Counters(props) {
    _classCallCheck(this, Counters);

    _get(Object.getPrototypeOf(Counters.prototype), "constructor", this).call(this, props);
    console.log("Counters constructor: props", props);
  }

  /**
   * <p>Using a special prop called children to pass something between the opening and closing tag
   * of an element. Counter could be self closed, but here we pass an &lt;h6&gt; tag.</p>
   *
   * This is useful when using dialog boxes to allow the consumer of that component
   * to pass content to be rendered on the dialog box.
   * @return {React.JSX.Element} a reset button plus a number of Counter components.
   */

  _createClass(Counters, [{
    key: "render",
    value: function render() {
      var _props = this.props;
      var counters = _props.counters;
      var onReset = _props.onReset;
      var onDelete = _props.onDelete;
      var onIncrement = _props.onIncrement;
      var onDecrement = _props.onDecrement;
      var onInsert = _props.onInsert;

      return React.createElement(
        "div",
        null,
        React.createElement(
          "button",
          { onClick: onReset, className: "btn btn-primary btn-sm m-2" },
          "Reset"
        ),
        React.createElement(
          "button",
          { onClick: onInsert, className: "btn btn-primary btn-sm m-2" },
          "Insert"
        ),
        counters.map(function (counter) {
          return React.createElement(
            Counter,
            {
              key: counter.id,
              // Counter component raises these events and we are bubbling them up to its parent
              onDelete: onDelete,
              onIncrement: onIncrement,
              onDecrement: onDecrement,
              counter: counter
            },
            React.createElement(
              "h6",
              null,
              counter.id,
              ")"
            )
          );
        })
      );
    }
  }]);

  return Counters;
})(React.Component);