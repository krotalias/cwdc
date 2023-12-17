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
class Counters extends React.Component {
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
    constructor(props) {
        super(props);
        console.log("Counters constructor: props", props);
    }

    /**
     * <p>Using a special prop called children to pass something between the opening and closing tag
     * of an element. Counter could be self closed, but here we pass an &lt;h6&gt; tag.</p>
     *
     * This is useful when using dialog boxes to allow the consumer of that component
     * to pass content to be rendered on the dialog box.
     * @memberof React.Component
     * @return {HTMLDivElement} a reset button plus a number of Counter components.
     */
    render() {
        const {
            counters,
            onReset,
            onDelete,
            onIncrement,
            onDecrement,
            onInsert,
        } = this.props;
        return (
            <div>
                <button
                    onClick={onReset}
                    className="btn btn-primary btn-sm m-2"
                >
                    Reset
                </button>
                <button
                    onClick={onInsert}
                    className="btn btn-primary btn-sm m-2"
                >
                    Insert
                </button>
                {counters.map((counter) => (
                    <Counter
                        key={counter.id}
                        // Counter component raises these events and we are bubbling them up to its parent
                        onDelete={onDelete}
                        onIncrement={onIncrement}
                        onDecrement={onDecrement}
                        counter={counter}
                    >
                        <h6>{counter.id})</h6>
                    </Counter>
                ))}
            </div>
        );
    }
}
