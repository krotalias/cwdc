/**
 * @file
 *
 * Summary.
 * <p>Create a root to display React components inside a browser DOM node.</p>
 *
 * @since 10/10/2024
 * @author Paulo Roma.
 * @see <a href="../src/main.jsx">source</a>
 * @see <a href="https://cubes-app.vercel.app/">link</a>
 * @see {@link external:react-dom/client.createRoot createRoot}
 * @see {@link external:react-three/fiber R3F}
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

/**
 * The react-dom/client APIs let you render React components on the client (in the browser).
 * @external react-dom/client
 * @see {@link https://react.dev/reference/react-dom/client React DOM APIs}
 */

/**
 * Lets you create a root to display React components inside a browser DOM node.
 * @function createRoot
 * @memberof external:react-dom/client
 * @see {@link https://react.dev/reference/react-dom/client/createRoot createRoot}
 */
createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
