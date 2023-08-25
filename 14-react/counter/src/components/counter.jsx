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
 * @see <img src="../row.png" width="256">
 */
class Counter extends React.Component {
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
     * @extends {React.Component<Props>}
     * @see https://reactjs.org/docs/react-component.html
     * @see https://www.digitalocean.com/community/tutorials/react-constructors-with-react-components
     */
    constructor(props) {
        super(props);
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
     * @see https://dev.to/cesareferrari/how-to-use-componentdidupdate-in-react-30en
     */
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.counter.value !== this.props.counter.value) {
            // Ajax call and get new data from the server
            console.log("componentDidUpdate: Ajax has been called");
            console.log(`prevProps: ${prevProps.counter.value}`);
            console.log(`Props: ${this.props.counter.value}`);
        }
    }

    /**
     * Called when the component is destroyed.
     */
    componentWillUnmount() {
        console.log("Counter - Unmount");
    }

    /**
     * Use bootstrap's <a href="/cwdc/5-bootstrap/5.3.html">grid system</a>
     * to build layouts: one row and two columns.
     *
     * @return {HTMLDivElement} a badge, plus an increment, a decrement, and a delete button.
     * @see https://getbootstrap.com/docs/4.6/layout/grid/
     * @see https://getbootstrap.com/docs/4.6/utilities/spacing/
     * @see https://www.bitdegree.org/learn/horizontal-grid
     * @see https://icons.getbootstrap.com/icons/trash/
     * @see https://fontawesome.com/v4/icons/
     */
    render() {
        console.log("Counter: props", this.props);
        const { counter, onIncrement, onDecrement, onDelete } = this.props;
        return (
            <div className="row">
                {/* jump line after counterid: 2) */}
                <div className="w-100">{this.props.children}</div>

                {/* break point medium (720px) */}
                {/* .col-xs-* classes, create a basic grid system that starts out stacked on */}
                {/* extra small sizes and becomes horizontal at the small breakpoint (sm). */}
                <div className="col-sm-1">
                    <span className={this.getBadgeClasses()}>
                        {this.formatCount()}
                    </span>
                </div>
                <div className="col">
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onIncrement(counter)}
                    >
                        <span className="fa fa-plus"></span>
                    </button>

                    {/* m-3 is the marging */}
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm m-3"
                        onClick={() => onDecrement(counter)}
                        disabled={counter.value === 0 ? "disabled" : ""}
                    >
                        <span className="fa fa-minus"></span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-danger btn-sm "
                        onClick={() => onDelete(counter.id)}
                    >
                        <span className="fa fa-trash"></span>
                    </button>
                </div>
            </div>
        );
    }

    /**
     * Returns the color for this counter badge: yellow for 'Zero', or blue otherwise.
     *
     * @returns {String} the class for setting the color of this counter badge.
     */
    getBadgeClasses() {
        let classes = "badge m-2 bg-";
        classes += this.props.counter.value === 0 ? "warning" : "primary";
        return classes;
    }

    /**
     * Format the value of this counter as 'Zero' or its numerical value.
     *
     * @returns {String|Number} the value of this counter.
     */
    formatCount() {
        const { value } = this.props.counter;
        return value === 0 ? "Zero" : value;
    }
}
