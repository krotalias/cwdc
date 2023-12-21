/**
 * @file
 *
 * Summary.
 * <p>A Stateless Functional Component.</p>
 *
 * Instead of using a class we use a function that returns a react element.
 *
 * @author {@link https://codewithmosh.com|Mosh Hamedani}
 * @author Paulo Roma
 * @since 08/10/2021
 * @see <a href="../src/components/navbar.jsx">source</a>
 * @see <a href="../components/navbar.js">source Babel</a>
 */

/**
 * <p>A function to return a <a href="/cwdc/5-bootstrap/5.4.html">navbar</a> element.</p>
 *
 * To simplify this code, we use object destructuring, to avoid using this.props, but
 * just totalCounters.
 *
 * @return {HTMLElement} a &lt;nav&gt; tag with the total of non-zero counters.
 * @see https://getbootstrap.com/docs/5.0/components/navbar/
 * @see https://getbootstrap.com/docs/5.0/components/badge/
 */
const NavBar = ({ totalCounters }) => {
    return (
        <nav className="navbar navbar-light bg-light">
            <div style={{ fontSize: "32px" }}>
                {" Total "}
                <span className="badge rounded-pill bg-secondary">
                    {totalCounters}
                </span>
            </div>
            <a href="https://react.dev">
                <img
                    src="/cwdc/14-react/counter/src/logo.svg"
                    style={{ height: "48px" }}
                    alt="logo"
                />
            </a>
            <a href="https://github.com/krotalias/cwdc/tree/main/14-react">
                <img
                    src="src/github.png"
                    style={{ height: "48px" }}
                    alt="github"
                />
            </a>
            <a href="https://getbootstrap.com/docs/5.2/getting-started/introduction/">
                <img
                    src="/cwdc/14-react/counter/src/Bootstrap_logo.svg"
                    style={{ height: "48px" }}
                    alt="logo"
                />
            </a>
            <a
                className="navbar-brand"
                href="https://www.youtube.com/watch?v=Ke90Tje7VS0"
            >
                Watch: "React for Beginners"
            </a>
        </nav>
    );
};
